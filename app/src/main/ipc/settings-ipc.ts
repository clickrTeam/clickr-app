import { ipcMain } from 'electron'
import log from 'electron-log'
import { localSettingsStore, LocalSettings } from '../services/local-settings'
import axios from 'axios'
import { tokenStorage } from '../services/token-storage'

const BASE_URL = 'https://clickr-backend-production.up.railway.app/api/'

// Create axios instance for settings API calls
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'User-Agent': 'Electron Clickr App'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const tokenData = await tokenStorage.getTokens()
  if (tokenData?.access_token) {
    config.headers.Authorization = `Bearer ${tokenData.access_token}`
  }
  return config
})

interface CloudSettings {
  theme: 'light' | 'dark' | 'system'
  keyboardLayout: 'qwerty' | 'dvorak' | 'colemak'
  defaultMappingVisibility: 'private' | 'public'
  autoSyncMappings: boolean
  showAdvancedFeatures: boolean
}

interface UserProfile {
  username: string
  email: string
  firstName: string
  lastName: string
  profileImage?: string
}

export function registerSettingsHandlers(): void {
  // Local Settings Handlers
  ipcMain.handle('get-local-settings', async (): Promise<{ success: boolean; data?: LocalSettings; message?: string }> => {
    try {
      const settings = localSettingsStore.getSettings()
      return { success: true, data: settings }
    } catch (error) {
      log.error('Failed to get local settings:', error)
      return { success: false, message: 'Failed to load local settings' }
    }
  })

  ipcMain.handle('update-local-settings', async (_, updates: Partial<LocalSettings>): Promise<{ success: boolean; data?: LocalSettings; message?: string }> => {
    try {
      const updatedSettings = localSettingsStore.updateSettings(updates)
      return { success: true, data: updatedSettings }
    } catch (error) {
      log.error('Failed to update local settings:', error)
      return { success: false, message: 'Failed to save local settings' }
    }
  })

  ipcMain.handle('reset-local-settings', async (): Promise<{ success: boolean; data?: LocalSettings; message?: string }> => {
    try {
      const defaultSettings = localSettingsStore.resetToDefaults()
      return { success: true, data: defaultSettings }
    } catch (error) {
      log.error('Failed to reset local settings:', error)
      return { success: false, message: 'Failed to reset local settings' }
    }
  })

  // User Profile Handlers (requires authentication)
  ipcMain.handle('get-user-profile', async (): Promise<{ success: boolean; data?: UserProfile; message?: string }> => {
    try {
      const tokenData = await tokenStorage.getTokens()
      if (!tokenData?.access_token) {
        return { success: false, message: 'Not authenticated' }
      }

      const response = await api.get(`user/profile/`)
      return { success: true, data: response.data }
    } catch (error: any) {
      log.error('Failed to get user profile:', error)
      if (error.response?.status === 401) {
        return { success: false, message: 'Authentication required' }
      }
      return { success: false, message: 'Failed to load user profile' }
    }
  })

  ipcMain.handle('update-user-profile', async (_, updates: Partial<UserProfile>): Promise<{ success: boolean; data?: UserProfile; message?: string }> => {
    try {
      const tokenData = await tokenStorage.getTokens()
      if (!tokenData?.access_token) {
        return { success: false, message: 'Not authenticated' }
      }

      const response = await api.put(`user/profile/`, updates)
      return { success: true, data: response.data }
    } catch (error: any) {
      log.error('Failed to update user profile:', error)
      if (error.response?.status === 401) {
        return { success: false, message: 'Authentication required' }
      }
      return { success: false, message: error.response?.data?.message || 'Failed to update profile' }
    }
  })

  // Cloud Settings Handlers (requires authentication)
  ipcMain.handle('get-cloud-settings', async (): Promise<{ success: boolean; data?: CloudSettings; message?: string }> => {
    try {
      const tokenData = await tokenStorage.getTokens()
      if (!tokenData?.access_token) {
        return { success: false, message: 'Not authenticated' }
      }

      const response = await api.get(`user/settings/`)
      return { success: true, data: response.data }
    } catch (error: any) {
      log.error('Failed to get cloud settings:', error)
      if (error.response?.status === 401) {
        return { success: false, message: 'Authentication required' }
      }
      return { success: false, message: 'Failed to load cloud settings' }
    }
  })

  ipcMain.handle('update-cloud-settings', async (_, updates: Partial<CloudSettings>): Promise<{ success: boolean; data?: CloudSettings; message?: string }> => {
    try {
      const tokenData = await tokenStorage.getTokens()
      if (!tokenData?.access_token) {
        return { success: false, message: 'Not authenticated' }
      }

      const response = await api.put(`user/settings/`, updates)
      
      // Sync relevant settings to local storage
      localSettingsStore.syncWithCloudSettings(updates)
      
      return { success: true, data: response.data }
    } catch (error: any) {
      log.error('Failed to update cloud settings:', error)
      if (error.response?.status === 401) {
        return { success: false, message: 'Authentication required' }
      }
      return { success: false, message: error.response?.data?.message || 'Failed to update cloud settings' }
    }
  })

  // Password Change Handler (requires authentication)
  ipcMain.handle('change-password', async (_, { currentPassword, newPassword }: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const tokenData = await tokenStorage.getTokens()
      if (!tokenData?.access_token) {
        return { success: false, message: 'Not authenticated' }
      }

      await api.post(`user/change-password/`, {
        current_password: currentPassword,
        new_password: newPassword
      })
      
      return { success: true, message: 'Password changed successfully' }
    } catch (error: any) {
      log.error('Failed to change password:', error)
      if (error.response?.status === 401) {
        return { success: false, message: 'Authentication required' }
      }
      return { success: false, message: error.response?.data?.message || 'Failed to change password' }
    }
  })

  // Combined Settings Handler (merges local + cloud when authenticated)
  ipcMain.handle('get-all-settings', async (): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const localSettings = localSettingsStore.getSettings()
      
      // Try to get cloud settings if authenticated
      const tokenData = await tokenStorage.getTokens()
      let cloudSettings: CloudSettings | null = null
      let userProfile: UserProfile | null = null
      
      if (tokenData?.access_token) {
        try {
          const [cloudResponse, profileResponse] = await Promise.all([
            api.get(`user/settings/`),
            api.get(`user/profile/`)
          ])
          cloudSettings = cloudResponse.data
          userProfile = profileResponse.data
          
          // Sync cloud settings to local
          localSettingsStore.syncWithCloudSettings(cloudSettings)
        } catch (error) {
          log.warn('Failed to fetch cloud settings, using local only:', error)
        }
      }
      
      return {
        success: true,
        data: {
          local: localSettings,
          cloud: cloudSettings,
          profile: userProfile,
          isAuthenticated: !!tokenData?.access_token
        }
      }
    } catch (error) {
      log.error('Failed to get all settings:', error)
      return { success: false, message: 'Failed to load settings' }
    }
  })
}
