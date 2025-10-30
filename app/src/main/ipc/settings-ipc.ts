import { ipcMain, dialog } from 'electron'
import { settingsStore, Settings } from '../services/settings-store'
import * as fs from 'fs'
import log from 'electron-log'

export function registerSettingsHandlers(): void {
  ipcMain.handle('get-settings', () => {
    log.debug('IPC: Getting all settings')
    return settingsStore.getSettings()
  })

  ipcMain.handle('update-settings', (_event, updates: Partial<Settings>) => {
    log.info('IPC: Updating settings:', Object.keys(updates))
    settingsStore.updateSettings(updates)
    return settingsStore.getSettings()
  })

  ipcMain.handle('reset-settings', () => {
    log.info('IPC: Resetting settings to defaults')
    settingsStore.resetSettings()
    return settingsStore.getSettings()
  })

  ipcMain.handle('get-setting', (_event, key: keyof Settings) => {
    log.debug(`IPC: Getting setting: ${key}`)
    return settingsStore.getSetting(key)
  })

  ipcMain.handle('set-setting', (_event, key: keyof Settings, value: any) => {
    log.info(`IPC: Setting ${key} to:`, value)
    settingsStore.setSetting(key, value)
    return settingsStore.getSettings()
  })

  ipcMain.handle('select-image-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      const filePath = result.filePaths[0]
      // Check file size (max 2MB)
      const stats = fs.statSync(filePath)
      const fileSizeInMB = stats.size / (1024 * 1024)

      if (fileSizeInMB > 2) {
        throw new Error('File size must be less than 2MB')
      }

      return filePath
    } catch (error) {
      log.error('Error selecting image file:', error)
      throw error
    }
  })
}

