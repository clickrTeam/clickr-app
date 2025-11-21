import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { API } from '../preload/index.d'
import log from 'electron-log'

const api: API = {
  getProfiles: function (): Promise<object[]> {
    return ipcRenderer.invoke('get-profiles') as Promise<object[]>
  },
  getActiveProfile: function (): Promise<number | null> {
    return ipcRenderer.invoke('get-active-profile')
  },
  createProfile: function (name: string): Promise<number> {
    return ipcRenderer.invoke('create-profile', name)
  },
  setActiveProfile: function (index: number): Promise<void> {
    return ipcRenderer.invoke('set-active-profile', index)
  },
  updateProfile: function (index: number, profileData: object): Promise<void> {
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
  fetchSpecificMapping: function (mappingId: string): Promise<any> {
    return ipcRenderer.invoke('fetch-specific-mapping', mappingId)
  },
  createMapping: function (username: string, mappingData: any): Promise<any> {
    return ipcRenderer.invoke('create-mapping', username, mappingData)
  },
  createNewMapping: function (username: string, mappingData: any): Promise<any> {
    return ipcRenderer.invoke('import-community-mapping', username, mappingData)
  },
  deleteMapping: function (username: string, mappingId: string): Promise<any> {
    return ipcRenderer.invoke('delete-mapping', username, mappingId)
  },
  setActiveMapping: function (username: string, mappingId: string): Promise<any> {
    return ipcRenderer.invoke('set-active-mapping', username, mappingId)
  },
  addTags: function (mappingId: string, tags: string[]): Promise<any> {
    return ipcRenderer.invoke('add-tags', mappingId, tags)
  },
  login: function (username: string, password: string): Promise<any> {
    return ipcRenderer.invoke('login', username, password)
  },
  register: function (username: string, email: string, password: string): Promise<any> {
    return ipcRenderer.invoke('register', username, email, password)
  },
  checkAuth: function (): Promise<{ isAuthenticated: boolean; username?: string }> {
    return ipcRenderer.invoke('check-auth')
  },
  logout: function (): Promise<{ success: boolean }> {
    return ipcRenderer.invoke('logout')
  },

  // Deamon Manager methods
  isKeybinderRunning: function (): Promise<boolean> {
    return ipcRenderer.invoke('is-keybinder-running')
  },
  runKeybinder: function (): Promise<void> {
    return ipcRenderer.invoke('run-keybinder')
  },
  stopKeybinder: function (): Promise<void> {
    return ipcRenderer.invoke('stop-keybinder')
  },

  // Statistics methods
  getKeyFrequencies: function (): Promise<{ key: string; count: number }[]> {
    return ipcRenderer.invoke('get-key-frequencies')
  },

  // Settings methods
  getSettings: function (): Promise<any> {
    return ipcRenderer.invoke('get-settings')
  },
  updateSettings: function (updates: any): Promise<any> {
    return ipcRenderer.invoke('update-settings', updates)
  },
  resetSettings: function (): Promise<any> {
    return ipcRenderer.invoke('reset-settings')
  },
  getSetting: function (key: string): Promise<any> {
    return ipcRenderer.invoke('get-setting', key)
  },
  setSetting: function (key: string, value: any): Promise<any> {
    return ipcRenderer.invoke('set-setting', key, value)
  },

  // Account Settings methods
  getUserProfile: function (username: string): Promise<any> {
    return ipcRenderer.invoke('get-user-profile', username)
  },
  updateUserProfile: function (
    username: string,
    profileData: { email?: string; profile_image?: string }
  ): Promise<any> {
    return ipcRenderer.invoke('update-user-profile', username, profileData)
  },
  updateUserPreferences: function (
    username: string,
    preferences: { default_mapping_visibility?: 'public' | 'private' }
  ): Promise<any> {
    return ipcRenderer.invoke('update-user-preferences', username, preferences)
  },
  changePassword: function (
    username: string,
    passwordData: { current_password: string; new_password: string; confirm_password: string }
  ): Promise<any> {
    return ipcRenderer.invoke('change-password', username, passwordData)
  },
  deleteAccount: function (username: string, password: string): Promise<any> {
    return ipcRenderer.invoke('delete-account', username, password)
  },
  syncMappings: function (username: string): Promise<any> {
    return ipcRenderer.invoke('sync-mappings', username)
  },
  renameMapping: function (mappingId: string, newName: string): Promise<any> {
    return ipcRenderer.invoke('rename-mapping', mappingId, newName)
  },
  updateMappingVisibility: function (mappingId: string, isPublic: boolean): Promise<any> {
    return ipcRenderer.invoke('update-mapping-visibility', mappingId, isPublic)
  },
  selectImageFile: function (): Promise<string | null> {
    return ipcRenderer.invoke('select-image-file')
  },

  // Recommendations methods
  getRecommendations: function (): Promise<any[]> {
    return ipcRenderer.invoke('get-recommendations')
  },
  saveRecommendations: function (recommendations: any[]): Promise<void> {
    return ipcRenderer.invoke('save-recommendations', recommendations)
  },
  clearRecommendations: function (): Promise<void> {
    return ipcRenderer.invoke('clear-recommendations')
  },
  getSelectedRecommendationId: function (): Promise<string | null> {
    return ipcRenderer.invoke('get-selected-recommendation-id')
  },
  saveSelectedRecommendationId: function (id: string | null): Promise<void> {
    return ipcRenderer.invoke('save-selected-recommendation-id', id)
  }
}

// Corrected check for context isolation
if (process.contextIsolated) {
  try {
    // Safe exposure of Electron APIs in the renderer process
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('daemon', {
      pause: () => ipcRenderer.invoke('daemon:pause'),
      resume: () => ipcRenderer.invoke('daemon:resume')
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    log.error('Error when exposing Electron APIs in the renderer process: ', error)
  }
} else {
  // If context isolation is not enabled, expose them directly (less secure)
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
