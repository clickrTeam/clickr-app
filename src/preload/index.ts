import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Define interfaces for your API if you want more type safety.
// For this example, we're using `unknown` for the profile JSON type.
interface API {
  getProfile: () => Promise<unknown>
  updateProfile: (profileJSON: unknown) => void
}

// Custom APIs for renderer to interact with the profile data.
const api: API = {
  // Gets the profile JSON from the main process.
  getProfile: (): Promise<unknown> => ipcRenderer.invoke('get-profile'),

  // Sends updated profile JSON back to the main process.
  updateProfile: (profileJSON: unknown): void => {
    ipcRenderer.send('update-profile', profileJSON)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
