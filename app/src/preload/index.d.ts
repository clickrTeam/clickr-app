import { ElectronAPI } from '@electron-toolkit/preload'
import { Profile } from "../models/Profile.ts"
export interface API {
  getProfiles(): Promise<Profile[]>;
  getActiveProfile(): Promise<number | null>;
  createProfile(name: string): Promise<void>;
  setActiveProfile(index: number): Promise<void>;
  updateProfile(index: number, profileData: Profile): Promise<void>;
}


declare global {
  interface Window {
    api: API
  }
}
