import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerProfileHandlers } from './ipc/profile-ipc'
import { registerApiHandlers } from './ipc/api-ipc'
import { registerDeamonManagerHandlers } from './services/daemon-manager'
import { getClient, getSocketPath } from './services/daemon-bridge'
import fs from 'fs'
import log from 'electron-log'

function createWindow(): void {
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
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('before-quit', () => {
    // Perform all necessary cleanup before quitting
    log.info('Application is quitting, performing cleanup...')
    const client = getClient()

    /**
     * @note This code will not clean up the socket / pipe if either of the following conditions are true:
     * 1. The 'server' or deamon is still running and has not closed the socket.
     * 2. The socket was created with elevated permissions and the application does not have permission to delete it.
     *    This may be remedied by running the application with the same permissions as the daemon.
     */
    if (client) {
      const SOCKET_PATH = getSocketPath()
      let cleanupError = false

      client.on('error', (err) => {
        cleanupError = true
        log.warn('Socket cleanup error:', err.message)
      })

      client.end(() => {
        client.destroy()
        if (!cleanupError) {
          log.info('Socket fully closed and destroyed on the electron side.')
          // This checks to see if the socket file still exists after closing the connection.
          if (fs.existsSync(SOCKET_PATH)) {
            log.warn('Socket file still exists after cleanup:', SOCKET_PATH)
          } else {
            log.info('Socket file successfully cleaned up:', SOCKET_PATH)
          }
        }
      })
    } else {
      log.error('Attempted to close socket (or named pipe) connection that was not open.')
    }
  })

  console.log('Starting Express server for keybinder control...')

  // Handle IPC messages
  // ipcMain.on('is-keybinder-running', async (event) => {
  //   const isRunning = await isKeybinderRunning()
  //   event.reply('is-keybinder-running', isRunning)
  // })

  // ipcMain.on('run-keybinder', () => {
  //   runKeybinder()
  // })

  // ipcMain.on('stop-keybinder', () => {
  //   stopKeybinder()
  // })

  // isKeybinderRunning().then((isRunning) => {
  //   console.log('Keybinder running:', isRunning)
  //   if (!isRunning) {
  //     runKeybinder()
  //   } else {
  //     stopKeybinder()
  //   }
  // })
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
