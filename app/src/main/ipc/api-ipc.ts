import { ipcMain } from 'electron'
import axios from 'axios'
import log from 'electron-log'
import { tokenStorage } from '../services/token-storage'

const BASE_URL = 'https://clickr-backend-production.up.railway.app/api/'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false
})

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const tokenData = await tokenStorage.getTokens()
  if (tokenData?.access_token) {
    config.headers.Authorization = `Bearer ${tokenData.access_token}`
  }
  return config
})

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const tokenData = await tokenStorage.getTokens()
      if (tokenData?.refresh_token) {
        try {
          // Try to refresh the token
          const refreshResponse = await axios.post(`${BASE_URL}token/refresh/`, {
            refresh: tokenData.refresh_token
          })
          
          // Update stored access token
          await tokenStorage.updateAccessToken(refreshResponse.data.access_token)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          log.error('Token refresh failed:', refreshError)
          // Clear invalid tokens
          tokenStorage.clearTokens()
          throw new Error('Session expired. Please log in again.')
        }
      }
    }
    return Promise.reject(error)
  }
)

export function registerApiHandlers(): void {
  // Community mappings
  ipcMain.handle('fetch-community-mappings', async () => {
    try {
      const response = await api.get('community/')
      log.info('Fetching community mappings')
      return response.data
    } catch (error) {
      log.error('Error fetching community mappings:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch community mappings')
    }
  })

  // User mappings
  ipcMain.handle('fetch-user-mappings', async (_, username: string) => {
    try {
      const response = await api.get(`users/${username}/mappings`)
      log.info(`Fetching user mappings for ${username}`)
      return response.data
    } catch (error) {
      log.error('Error fetching user mappings:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user mappings')
    }
  })
  ipcMain.handle('fetch-specific-mapping', async (_, mappingId: string) => {
    try {
      const response = await api.get(`users/mappings/${mappingId}`)
      log.info(`Fetching specific mapping with ID ${mappingId}`)
      return response.data
    } catch (error) {
      log.error('Error fetching specific mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch specific mapping')
    }
  })

  // Create mapping
  ipcMain.handle('create-mapping', async (_, username: string, mappingData) => {
    //TODO: Temparary hack
    const entireMapping = {
      name: mappingData.profile_name,
      description: 'TODO',
      mappings: mappingData,
      isActive: false,
      is_public: true,
      num_likes: 0,
      num_downloads: 0
    }

    try {
      const response = await api.post(`users/${username}/mappings/new`, entireMapping)
      log.info(`Creating new mapping for user ${username}`)
      return response.data
    } catch (error) {
      log.error('Error creating mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create mapping')
    }
  })

  // Delete mapping
  ipcMain.handle('delete-mapping', async (_, username: string, mappingId: string) => {
    try {
      const response = await api.post(`users/${username}/mappings/delete`, {
        mapping_id: mappingId
      })
      log.info(`Deleting mapping with ID ${mappingId} for user ${username}`)
      return response.data
    } catch (error) {
      log.error('Error deleting mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to delete mapping')
    }
  })

  // Set active mapping
  ipcMain.handle('set-active-mapping', async (_, username: string, mappingId: string) => {
    try {
      const response = await api.post(`users/${username}/mappings/set_active`, {
        mapping_id: mappingId
      })
      log.info(`Setting active mapping with ID ${mappingId} for user ${username}`)
      return response.data
    } catch (error) {
      log.error('Error setting active mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to set active mapping')
    }
  })

  // Login
  ipcMain.handle('login', async (_, username: string, password: string) => {
    try {
      const response = await api.post('token/', { username, password })
      
      // Store tokens securely
      await tokenStorage.storeTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        username: username,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      })
      
      log.info(`User ${username} logged in successfully and tokens stored`)
      return { ...response.data, username }
    } catch (error) {
      log.error('Login failed:', error)
      throw new Error('Login Failed')
    }
  })

  // Register
  ipcMain.handle('register', async (_, username: string, email: string, password: string) => {
    try {
      const response = await api.post('register/', { username, email, password })
      log.info(`User ${username} with email ${email} registered successfully`)
      return response.data
    } catch (error) {
      log.error('Registration failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Registration Failed')
    }
  })

  // Check authentication status
  ipcMain.handle('check-auth', async () => {
    try {
      const tokenData = await tokenStorage.getTokens()
      if (!tokenData) {
        return { isAuthenticated: false }
      }

      // Verify token with backend
      try {
        await api.get('authenticated/')
        return { 
          isAuthenticated: true, 
          username: tokenData.username 
        }
      } catch (error) {
        // Token might be invalid, clear it
        tokenStorage.clearTokens()
        return { isAuthenticated: false }
      }
    } catch (error) {
      log.error('Error checking authentication:', error)
      return { isAuthenticated: false }
    }
  })

  // Logout
  ipcMain.handle('logout', async () => {
    try {
      tokenStorage.clearTokens()
      log.info('User logged out and tokens cleared')
      return { success: true }
    } catch (error) {
      log.error('Error during logout:', error)
      throw new Error('Logout failed')
    }
  })
}

ipcMain.handle('add-tags', async (_, mappingId: string, tags: string[]) => {
  try {
    const response = await api.patch(`users/mappings/${mappingId}/add_tags`, {
      tags: tags
    })
    log.info(`Adding tags to mapping with ID ${mappingId}: ${tags.join(', ')}`)
    return response.data
  } catch (error) {
    log.error('Error adding tags:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to add tags')
  }
})

ipcMain.handle('rename-mapping', async (_, mappingId: string, newName: string) => {
  try {
    const response = await api.patch(`users/mappings/${mappingId}/rename`, {
      name: newName
    })
    log.info(`Renaming mapping with ID ${mappingId} to ${newName}`)
    return response.data
  } catch (error) {
    log.error('Error renaming mapping:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to rename mapping')
  }
})

ipcMain.handle('update-mapping-visibility', async (_, mappingId: string, isPublic: boolean) => {
  try {
    const response = await api.patch(`users/mappings/${mappingId}/visibility`, {
      is_public: isPublic
    })
    log.info(`Updating visibility of mapping with ID ${mappingId} to ${isPublic ? 'public' : 'private'}`)
    return response.data
  } catch (error) {
    log.error('Error updating mapping visibility:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to update mapping visibility')
  }
})
