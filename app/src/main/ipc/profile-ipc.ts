import { ipcMain } from 'electron'
import { profileStore } from '../services/profile-store'
import { Profile } from '../../models/Profile'
import { sendActiveProfile } from '../services/daemon-bridge'
import log from 'electron-log'

// Simple promise-based lock so get-active-profile can wait while
// set-active-profile is sending the active profile to the daemon.
let activeProfileLock: Promise<void> | null = null
let releaseActiveProfileLock: (() => void) | null = null

export function registerProfileHandlers(): void {
  ipcMain.handle('get-profiles', () => {
    log.debug('IPC: Getting all profiles')
    return profileStore.getProfiles().map((p) => p.toJSON())
  })

  ipcMain.handle('get-active-profile', async () => {
    if (activeProfileLock) {
      log.debug('IPC: get-active-profile is waiting for active profile to be sent to daemon')
      try {
        await activeProfileLock
      } catch (err) {
        // If the lock was rejected for some reason, continue and return current active profile
        log.error('IPC: Error waiting for active-profile lock:', err)
      }
    }

    log.debug('IPC: Returning active profile')
    return await profileStore.getActive()
  })

  ipcMain.handle('create-profile', (_event, name: string) => {
    log.info('IPC: Creating new profile:', name)
    return profileStore.create(name)
  })

  ipcMain.handle('set-active-profile', async (_event, index: number) => {
    log.info(`IPC: Setting active profile to index: ${index}`)

    // If another set-active-profile is already in progress, wait for it to finish
    if (activeProfileLock) {
      log.warn('IPC: Another set-active-profile in progress; waiting for it to complete before proceeding')
      try {
        await activeProfileLock
      } catch (err) {
        log.warn('IPC: Previous active-profile lock wait failed:', err)
      }
    }

    // Create a new lock so get-active-profile will wait until we finish sending.
    activeProfileLock = new Promise<void>((resolve) => {
      releaseActiveProfileLock = resolve
    })

    try {
      const profile = profileStore.getProfiles()[index]
      const response = await sendActiveProfile(profile)

      if (response && response.error !== undefined) {
        profileStore.setActiveByIndex(undefined)
        log.error('IPC: Failed to set active profile in daemon:', response.error)
      } else {
        profileStore.setActiveByIndex(index)
        log.info('IPC: Active profile set in daemon successfully')
      }

      return response
    } catch (err) {
      profileStore.setActiveByIndex(undefined)
      log.error('IPC: Error communicating with daemon to set active profile:', err)
      throw err
    } finally {
      // Release the lock so any waiting get-active-profile calls can proceed
      if (releaseActiveProfileLock) {
        try {
          releaseActiveProfileLock()
        } catch (e) {
          log.warn('IPC: Error releasing active-profile lock:', e)
        }
      }
      activeProfileLock = null
      releaseActiveProfileLock = null
    }
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
