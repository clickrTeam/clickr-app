import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as net from 'net'
import * as os from 'os'
import * as fs from 'fs/promises'
import * as path from 'path'

// Store the socket globally
let client: net.Socket | null = null

function getSocketPath(): string {
  if (process.platform === 'win32') {
    return '\\\\\\.\\\\pipe\\myapp-socket';
  } else {
    return path.join(os.tmpdir(), 'daemon.sock') // or /var/run/daemon.sock if your daemon creates it there
  }
}

function sendStartSignalToDaemon(): void {
  client = net.createConnection(getSocketPath(), (): void => {
    console.log('Connected to daemon')
    client.write('start\n')
  })

  client.on('data', (data) => {
    console.log('Daemon responded:', data.toString())
    client.end()
  })

  client.on('error', (err) => {
    console.error('Failed to connect to daemon:', err.message)
  })
}

async function sendProfileJson(client: net.Socket): Promise<void> {
  const jsonPath = path.join(__dirname, '..', '..', 'resources', 'e1.json') // TODO: Just an example, eventually this will not be hardcoded.

  try {
    // Check if the socket is still writable
    if (!client.writable || client.destroyed) {
      console.error('Socket is not connected or already closed.')
      return
    }

    const data = await fs.readFile(jsonPath, 'utf8')

    // Optional: Validate JSON
    JSON.parse(data)

    // Send it with newline for framing
    client.write(data + '\n')
    console.log('Sent profile JSON to daemon')
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error sending JSON file:', err.message)
    } else {
      // Handle other types of errors if needed (e.g., a string or object)
      console.error('Unknown error:', err)
    }
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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

  /// Listen for the 'start-daemon' IPC message from the renderer
  ipcMain.on('start-daemon', () => {
    sendStartSignalToDaemon() // Call the function when the message is received
  })

  ipcMain.on('load', () => {
    if (client) {
      sendProfileJson(client)
    } else {
      console.error('Not connected to socket.')
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
