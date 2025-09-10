import { ipcMain } from 'electron'
import { profileStore } from '../services/profile-store'
import { Profile } from '../../models/Profile'
import { sendActiveProfile } from '../services/daemon-bridge'
import log from 'electron-log'

export function registerProfileHandlers(): void {
  ipcMain.handle('get-profiles', () => {
    log.info('IPC: Getting all profiles')
    return profileStore.getProfiles().map((p) => p.toJSON())
  })

  ipcMain.handle('get-active-profile', () => {
    log.info('IPC: Getting active profile')
    return profileStore.getActive()
  })

  ipcMain.handle('create-profile', (_event, name: string) => {
    log.info('IPC: Creating new profile:', name)
    return profileStore.create(name)
  })

  ipcMain.handle('set-active-profile', (_event, index: number) => {
    log.info(`IPC: Setting active profile to index: ${index}`)
    profileStore.setActiveByIndex(index)
    sendActiveProfile(profileStore.getProfiles()[index])
  })

  ipcMain.handle('update-profile', (_event, index: number, profileData) => {
    log.info('IPC: Updating profile at index:', index)
    const updated = Profile.fromJSON(profileData)
    profileStore.setProfileByIndex(index, updated)
  })

  ipcMain.handle('delete-profile', (_event, index: number) => {
    log.info('IPC: Deleting profile at index:', index)
    profileStore.deleteProfileByIndex(index)
  })
}
