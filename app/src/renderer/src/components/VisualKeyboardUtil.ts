// Utility functions for VisualKeyboard
import log from 'electron-log'
import { keyShortLabels } from './VisualKeyboard/Layout.const'

// Helper to get short label or icon
export const getShortLabel = (key: string): string => {
  if (keyShortLabels[key]) return keyShortLabels[key]
  if (/^F\d{1,2}$/.test(key)) return key // F1-F12
  if (key.length > 5) return key.slice(0, 5)
  return key
}
