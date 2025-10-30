export type Settings = {
  // Appearance
  theme: 'light' | 'dark' | 'system'

  // Application
  startOnBoot: boolean
  minimizeToTray: boolean

  // Keyboard/Daemon
  autoStartKeybinder: boolean
  keybinderAutoRestart: boolean
  showKeybinderStatus: boolean

  // Privacy
  analyticsEnabled: boolean
  aiAnalyticsEnabled: boolean

  // Notifications
  systemNotificationsEnabled: boolean
  layerNotificationEnabled: boolean
}

