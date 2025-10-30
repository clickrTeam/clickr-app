import { ElectronAPI } from '@electron-toolkit/preload'
import { Profile } from '../models/Profile.ts'
import { Settings } from '../models/Settings.ts'

export interface API {
  getProfiles(): Promise<object[]>
  getActiveProfile(): Promise<number | null>
  createProfile(name: string): Promise<number>
  setActiveProfile(index: number): Promise<void>
  updateProfile(index: number, profileData: object): Promise<void>
  deleteProfile(index: number): Promise<void>

  // API communication methods
  fetchCommunityMappings(): Promise<any>
  fetchUserMappings(username: string): Promise<any>
  fetchSpecificMapping(mappingId: string): Promise<any>
  createMapping(username: string, mappingData: any): Promise<any>
  createNewMapping(username: string, mappingData: any): Promise<any>
  deleteMapping(username: string, mappingId: string): Promise<any>
  setActiveMapping(username: string, mappingId: string): Promise<any>
  addTags(mappingId: string, tags: string[]): Promise<any>
  login(username: string, password: string): Promise<any>
  register(username: string, email: string, password: string): Promise<any>
  checkAuth(): Promise<{ isAuthenticated: boolean; username?: string }>
  logout(): Promise<{ success: boolean }>

  // Daemon Manager methods
  isKeybinderRunning(): Promise<boolean>
  runKeybinder(): Promise<void>
  stopKeybinder(): Promise<void>

  // Settings methods
  getSettings(): Promise<Settings>
  updateSettings(updates: Partial<Settings>): Promise<Settings>
  resetSettings(): Promise<Settings>
  getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]>
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<Settings>

  // Account Settings methods
  getUserProfile(username: string): Promise<any>
  updateUserProfile(username: string, profileData: { email?: string; profile_image?: string }): Promise<any>
  updateUserPreferences(username: string, preferences: { default_mapping_visibility?: 'public' | 'private' }): Promise<any>
  changePassword(username: string, passwordData: { current_password: string; new_password: string; confirm_password: string }): Promise<any>
  deleteAccount(username: string, password: string): Promise<any>
  syncMappings(username: string): Promise<any>
  renameMapping(mappingId: string, newName: string): Promise<any>
  updateMappingVisibility(mappingId: string, isPublic: boolean): Promise<any>
  selectImageFile(): Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
