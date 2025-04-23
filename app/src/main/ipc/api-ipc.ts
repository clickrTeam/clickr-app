import { ipcMain } from 'electron'
import axios from 'axios'

const BASE_URL = 'https://temp-django-docker-production.up.railway.app/api/'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

export function registerApiHandlers() {
  // Community mappings
  ipcMain.handle('fetch-community-mappings', async () => {
    try {
      const response = await api.get('community/')
      return response.data
    } catch (error) {
      console.error('Error fetching community mappings:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch community mappings')
    }
  })

  // User mappings
  ipcMain.handle('fetch-user-mappings', async (_, username: string) => {
    try {
      const response = await api.get(`users/${username}/mappings`)
      return response.data
    } catch (error) {
      console.error('Error fetching user mappings:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user mappings')
    }
  })

  // Create mapping
  ipcMain.handle('create-mapping', async (_, username: string, mappingData: any) => {
    //TODO: Temparary hack
    let entireMapping = {
      name: mappingData.profile_name,
      description: "TODO",
      mappings: mappingData,
      isActive: false,
      is_public: true,
      num_likes: 0,
      num_downloads: 0,
    }

    try {
      const response = await api.post(`users/${username}/mappings/new`, entireMapping)
      return response.data
    } catch (error) {
      console.error('Error creating mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create mapping')
    }
  })

  // Delete mapping
  ipcMain.handle('delete-mapping', async (_, username: string, mappingId: string) => {
    try {
      const response = await api.post(`users/${username}/mappings/delete`, {
        mapping_id: mappingId
      })
      return response.data
    } catch (error) {
      console.error('Error deleting mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to delete mapping')
    }
  })

  // Set active mapping
  ipcMain.handle('set-active-mapping', async (_, username: string, mappingId: string) => {
    try {
      const response = await api.post(`users/${username}/mappings/set_active`, {
        mapping_id: mappingId
      })
      return response.data
    } catch (error) {
      console.error('Error setting active mapping:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to set active mapping')
    }
  })

  // Login
  ipcMain.handle('login', async (_, username: string, password: string) => {
    try {
      const response = await api.post('token/', { username, password })
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Login Failed')
    }
  })

  // Register
  ipcMain.handle('register', async (_, username: string, email: string, password: string) => {
    try {
      const response = await api.post('register/', { username, email, password })
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Registration Failed')
    }
  })
}
