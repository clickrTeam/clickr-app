import { ipcMain } from 'electron'
import { profileStore } from '../services/profile-store'
import { Profile } from '../../models/Profile'
import { sendActiveProfile } from '../services/daemon-bridge'

export function registerProfileHandlers() {
  ipcMain.handle('get-profiles', () => {
    return profileStore.getProfiles().map(p => p.toJSON())
  })

  ipcMain.handle('get-active-profile', () => {
    return profileStore.getActive()
  })

  ipcMain.handle('create-profile', (_event, name: string) => {
    return profileStore.create(name).toJSON()
  })

  ipcMain.handle('set-active-profile', (_event, index: number) => {
    profileStore.setActiveByIndex(index)
    sendActiveProfile(profileStore.getProfiles()[index])
  })

  ipcMain.handle('update-profile', (_event, index: number, profileData) => {
    const updated = Profile.fromJSON(profileData)
    profileStore.setProfileByIndex(index, updated)
  })

  ipcMain.handle('delete-profile', (_event, index: number) => {
    profileStore.deleteProfileByIndex(index)
  })
}
