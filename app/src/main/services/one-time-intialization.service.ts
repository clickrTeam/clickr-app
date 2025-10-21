import log from 'electron-log'
import { join } from 'path'
import { app } from 'electron'
import { execFileSync } from 'child_process'
import fs from 'fs'

export function handleFirstRun(): void {
  const marker = join(app.getPath('userData'), 'first-run-done')
  try {
    if (fs.existsSync(marker)) {
      log.info('One-time initialization: already completed')
      return
    }
  } catch (err) {
    log.warn('One-time initialization: error checking marker file', err)
  }

  log.info('One-time initialization: first run detected')

  try {
    fs.writeFileSync(marker, new Date().toISOString(), { encoding: 'utf8' })
    log.info('One-time initialization: marker file created', marker)
  } catch (err) {
    log.error('One-time initialization: failed to create marker file', err)
  }

  if (process.platform === 'win32') {
    try {
      windowsSetupKeybinderRunOnStartup()
    } catch (err) {
      log.error('One-time initialization: windows setup failed', err)
    }
  } else {
    log.info('One-time initialization: non-windows platform, skipping windows setup')
  }
}

// deleteMarkerFile() // For testing purpose
/* eslint-disable @typescript-eslint/no-unused-vars */
function deleteMarkerFile(): void {
  const marker = join(app.getPath('userData'), 'first-run-done')
  try {
    if (fs.existsSync(marker)) {
      fs.unlinkSync(marker)
      log.info('One-time initialization: marker file deleted', marker)
    } else {
      log.info('One-time initialization: marker file does not exist', marker)
    }
  } catch (err) {
    log.error('One-time initialization: failed to delete marker file', err)
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

function windowsSetupKeybinderRunOnStartup(): void {
  log.info('One-time initialization: performing Windows startup registration')
  const keybinder = join(__dirname, '../../../../', 'resources', 'app', 'keybinder', 'keybinder.exe')
  try {
    if (!fs.existsSync(keybinder)) {
      log.error('~~~~~~~~ One-time initialization: keybinder executable not found ~~~~~~~~~~', keybinder)
      throw new Error(`Keybinder executable not found: ${keybinder}`)
    }
    execFileSync('reg', [
      'add',
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
      '/v',
      'clickr-keybinder',
      '/t',
      'REG_SZ',
      '/d',
      keybinder,
      '/f'
    ], { stdio: 'ignore' })
    log.info('One-time initialization: registered keybinder for startup', keybinder)
  } catch (err) {
    log.error('One-time initialization: failed to register keybinder for startup', err)
    throw err
  }
}
