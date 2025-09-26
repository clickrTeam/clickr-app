import { ElectronAPI } from '@electron-toolkit/preload'
import { Profile } from '../models/Profile.ts'

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
  getLocalSettings(): Promise<{ success: boolean; data?: any; message?: string }>
  updateLocalSettings(updates: any): Promise<{ success: boolean; data?: any; message?: string }>
  resetLocalSettings(): Promise<{ success: boolean; data?: any; message?: string }>
  getUserProfile(): Promise<{ success: boolean; data?: any; message?: string }>
  updateUserProfile(updates: any): Promise<{ success: boolean; data?: any; message?: string }>
  getCloudSettings(): Promise<{ success: boolean; data?: any; message?: string }>
  updateCloudSettings(updates: any): Promise<{ success: boolean; data?: any; message?: string }>
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }>
  getAllSettings(): Promise<{ success: boolean; data?: any; message?: string }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
