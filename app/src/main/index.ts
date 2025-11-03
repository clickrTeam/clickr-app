import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerProfileHandlers } from './ipc/profile-ipc'
import { registerApiHandlers } from './ipc/api-ipc'
import { registerSettingsHandlers } from './ipc/settings-ipc'
import { isKeybinderRunning, registerDeamonManagerHandlers, runKeybinder } from './services/daemon-manager'
import log from 'electron-log'
import { handleFirstRun } from './services/one-time-intialization.service'

// Handle EPIPE errors gracefully (broken pipe when console is closed)
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') {
    throw error
  }
  // Ignore EPIPE errors - console was closed
})

process.stderr.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') {
    throw error
  }
  // Ignore EPIPE errors - console was closed
})

// Handle uncaught exceptions for EPIPE errors
process.on('uncaughtException', (error: NodeJS.ErrnoException) => {
  // Check for EPIPE errors (broken pipe when console is closed)
  if (error.code === 'EPIPE' || error.message?.includes('EPIPE')) {
    // Ignore EPIPE errors - console was closed, this is expected in some scenarios
    return
  }
  // Log other errors but don't crash - let Electron handle it
  try {
    log.error('Uncaught Exception:', error)
  } catch {
    // If logging fails, at least try to show in console
    console.error('Uncaught Exception:', error)
  }
})

function createWindow(): void {
  log.initialize()
  // error, warn, info, verbose, debug, and silly.
  log.transports.file.level = 'debug' // TODO at final set to 'info' or 'verbose'
  log.transports.console.level = 'debug'

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    log.info('Clickr main window sucessfully created and ready to show.')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerProfileHandlers()
  registerDeamonManagerHandlers() // Register daemon manager handlers
  registerApiHandlers() // Register our new API handlers
  registerSettingsHandlers() // Register settings handlers
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  log.info('Starting Express server for keybinder control...')
})

app.on('ready', async () => {
  if (await isKeybinderRunning()) {
    log.info('Keybinder is already running.')
  } else {
    log.info('Keybinder is not running. Starting keybinder...')
    runKeybinder()
  }
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    log.info('!---------------- All windows closed. ----------------!')
  }
})

app.whenReady().then(handleFirstRun)
