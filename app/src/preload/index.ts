import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { API } from '../preload/index.d'
import { Profile } from '../models/Profile'

const api: API = {
  getProfiles: function(): Promise<Profile[]> {
    return ipcRenderer.invoke('get-profiles').then((profilesJson: any[]) => {
      // Convert the plain objects to Profile instances
      return profilesJson.map(profileJson => Profile.fromJSON(profileJson))
    })
  },
  getActiveProfile: function(): Promise<number | null> {
    return ipcRenderer.invoke('get-active-profile')
  },
  createProfile: function(name: string): Promise<void> {
    return ipcRenderer.invoke('create-profile', name)
  },
  setActiveProfile: function(index: number): Promise<void> {
    return ipcRenderer.invoke('set-active-profile', index)
  },
  updateProfile: function(index: number, profileData: Profile): Promise<void> {
    return ipcRenderer.invoke('update-profile', index, profileData.toJSON()) // Send the profile's JSON representation
  }
}

// Corrected check for context isolation
if (process.contextIsolated) {
  try {
    // Safe exposure of Electron APIs in the renderer process
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // If context isolation is not enabled, expose them directly (less secure)
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
