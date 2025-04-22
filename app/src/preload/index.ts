import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { API } from '../preload/index.d'

const api: API = {
  getProfiles: function (): Promise<object[]> {
    return ipcRenderer.invoke('get-profiles') as Promise<object[]>
  },
  getActiveProfile: function (): Promise<number | null> {
    return ipcRenderer.invoke('get-active-profile')
  },
  createProfile: function (name: string): Promise<void> {
    return ipcRenderer.invoke('create-profile', name)
  },
  setActiveProfile: function (index: number): Promise<void> {
    return ipcRenderer.invoke('set-active-profile', index)
  },
  updateProfile: function (index: number, profileData: object): Promise<void> {
    console.log('HERE', index, profileData)
    return ipcRenderer.invoke('update-profile', index, profileData) // Send the profile's JSON representation
  },
  deleteProfile: function (index: number): Promise<void> {
    return ipcRenderer.invoke('delete-profile', index)
  },

  // API communication methods
  fetchCommunityMappings: function (): Promise<any> {
    return ipcRenderer.invoke('fetch-community-mappings')
  },
  fetchUserMappings: function (username: string): Promise<any> {
    return ipcRenderer.invoke('fetch-user-mappings', username)
  },
  createMapping: function (username: string, mappingData: any): Promise<any> {
    return ipcRenderer.invoke('create-mapping', username, mappingData)
  },
  deleteMapping: function (username: string, mappingId: string): Promise<any> {
    return ipcRenderer.invoke('delete-mapping', username, mappingId)
  },
  setActiveMapping: function (username: string, mappingId: string): Promise<any> {
    return ipcRenderer.invoke('set-active-mapping', username, mappingId)
  },
  login: function (username: string, password: string): Promise<any> {
    return ipcRenderer.invoke('login', username, password)
  },
  register: function (username: string, email: string, password: string): Promise<any> {
    return ipcRenderer.invoke('register', username, email, password)
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
