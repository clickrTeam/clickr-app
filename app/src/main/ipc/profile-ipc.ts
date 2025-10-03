import { ipcMain } from 'electron'
import { profileStore } from '../services/profile-store'
import { Profile } from '../../models/Profile'
import { sendActiveProfile } from '../services/daemon-bridge'
import log from 'electron-log'

export function registerProfileHandlers(): void {
  ipcMain.handle('get-profiles', () => {
    log.debug('IPC: Getting all profiles')
    return profileStore.getProfiles().map((p) => p.toJSON())
  })

  ipcMain.handle('get-active-profile', () => {
    log.debug('IPC: Getting active profile')
    return profileStore.getActive()
  })

  ipcMain.handle('create-profile', (_event, name: string) => {
    log.info('IPC: Creating new profile:', name)
    return profileStore.create(name)
  })

  ipcMain.handle('set-active-profile', (_event, index: number) => {
    log.info(`IPC: Setting active profile to index: ${index}`)
    const response = sendActiveProfile(profileStore.getProfiles()[index])
    response.then((res) => {
      if (res.error !== undefined) {
        profileStore.setActiveByIndex(undefined)
        log.error('IPC: Failed to set active profile in daemon:', res.error)
      } else {
        profileStore.setActiveByIndex(index)
        log.info('IPC: Active profile set in daemon successfully')
      }
    }).catch((err) => {
      profileStore.setActiveByIndex(undefined)
      log.error('IPC: Error communicating with daemon to set active profile:', err)
    })
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
