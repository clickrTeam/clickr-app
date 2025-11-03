import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import log from 'electron-log'
import { Settings } from '../../models/Settings'

const defaultSettings: Settings = {
  theme: 'system',
  startOnBoot: false,
  minimizeToTray: false,
  autoStartKeybinder: true,
  keybinderAutoRestart: true,
  showKeybinderStatus: true,
  analyticsEnabled: true,
  aiAnalyticsEnabled: true,
  systemNotificationsEnabled: true,
  layerNotificationEnabled: true
}

// Path to the settings JSON file
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json')
log.info('Settings file path:', settingsFilePath)

// Ensure the settings file exists with default structure
function ensureSettingsFile(): void {
  if (!fs.existsSync(settingsFilePath)) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2), 'utf-8')
    log.info('Created default settings file')
  }
}

let settings: Settings | undefined = undefined

// Read and parse the settings file
function getSettingsData(): Settings {
  ensureSettingsFile()
  if (settings === undefined) {
    try {
      const raw = fs.readFileSync(settingsFilePath, 'utf-8')
      const parsed = JSON.parse(raw)
      // Merge with defaults to ensure all settings exist
      settings = { ...defaultSettings, ...parsed }
      // Validate and ensure all required fields exist
      Object.keys(defaultSettings).forEach((key) => {
        if (!(key in settings!)) {
          ;(settings as any)[key] = (defaultSettings as any)[key]
        }
      })
      log.info('Settings loaded from file')
    } catch (error) {
      log.error('Error reading settings file:', error)
      settings = { ...defaultSettings }
      writeSettings()
    }
  }
  return settings as Settings
}

// Serialize and write the settings file
function writeSettings(): void {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(getSettingsData(), null, 2), 'utf-8')
    log.debug('Settings written to file')
  } catch (error) {
    log.error('Error writing settings file:', error)
  }
}

export const settingsStore = {
  /**
   * Get all settings
   */
  getSettings(): Settings {
    return getSettingsData()
  },

  /**
   * Update settings with partial updates
   */
  updateSettings(updates: Partial<Settings>): void {
    settings = { ...getSettingsData(), ...updates }
    writeSettings()
    log.info('Settings updated:', Object.keys(updates))
  },

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    settings = { ...defaultSettings }
    writeSettings()
    log.info('Settings reset to defaults')
  },

  /**
   * Get a specific setting by key
   */
  getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return getSettingsData()[key]
  },

  /**
   * Set a specific setting
   */
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    settings = { ...getSettingsData(), [key]: value }
    writeSettings()
    log.info(`Setting ${key} updated to:`, value)
  }
}

