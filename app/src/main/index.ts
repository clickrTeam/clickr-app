import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { Profile } from '../models/Profile'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs'
import * as path from 'path'


let active_profile: Profile | null = null
/**
 * Creates a new profile object with the default values and sets it to active_profile
 * @param profile_name The name of the Profile
 */
function createNewProfile(profile_name: string): void {
  active_profile = new Profile(profile_name)
  active_profile.ADD_TEST_LAYER('TEST_LAYER')
}
/**
 * Loads a profile.json from a file path and sets it to the active profile
 * @param profile_path Path to the JSON file which will be loaded
 */
function loadProfile(profile_path: string): void {
  // temp = parseProfileJson()
  // active_profile = temp
}
/**
 * Parses the JSON to ensure it is not malformed, then returns a Profile object
 * @param profile_path Path to the JSON file which will be parsed
 * @returns A formed Profile object
 */
function parseProfileJson(profile_path: string): Profile {
  // do stuff
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
  /**
   * In this section, listen for 'commands' from the app to execute the underlying logic
   */
  ipcMain.on('start-daemon', () => {
    sendStartSignalToDaemon() // Call the function when the message is received
  })
  ipcMain.on('load', () => {
    //TODO: This logic should change and should instead load a profile from a JSON
    if (client) {
      sendProfileJson(client)
    } else {
      console.error('Not connected to socket.')
    }
  })
  ipcMain.on('send-prof-to-daemon', () => {
    if (client) {
      sendProfileJson(client)
    } else {
      console.error('Not connected to socket.')
    }
  })
  ipcMain.on('create-new-profile', () => {
    createNewProfile('default')
  })
  ipcMain.handle('get-profile', () => {
    if (active_profile == null) {
      createNewProfile('default')
    }
    // Create the path to the file in ../../resources
    const filePath = path.join(__dirname, '../../resources/test.json')

    // Ensure the directory exists (optional, in case you need to create it)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })

    // Write the JSON to the file
    fs.writeFileSync(filePath, JSON.stringify(active_profile?.toJSON(), null, 2), 'utf-8')

    console.log('JSON has been written to test.json')
    return active_profile?.toJSON()
  })
  ipcMain.handle('save-profile', async (_event, profileJson) => {
    console.log(
      'JSON recieved back in main. Deserialzing, updating active_profile, and writing profileJSON'
    )
    const filePath = path.join(__dirname, '../../resources/test_recieve_in_main.json')
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(profileJson, null, 2), 'utf-8')
    console.log('JSON has been written to test_recieve_in_main.json')
    active_profile = Profile.fromJSON(profileJson)
    console.log('active_profile updated sucessfully')
  })
  createWindow()
  app.on('activate', function() {
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
