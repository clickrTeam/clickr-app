import { spawn, exec } from 'child_process'
import { ipcMain } from 'electron'
import { platform } from 'os'
import path from 'path'
import log from 'electron-log'

export function registerDeamonManagerHandlers(): void {
  ipcMain.handle('is-keybinder-running', async () => {
    return await isKeybinderRunning()
  })

  ipcMain.handle('run-keybinder', async () => {
    await runKeybinder()
    return await isKeybinderRunning()
  })

  ipcMain.handle('stop-keybinder', async () => {
    await stopKeybinder()
    return true
  })
}

const KEYBINDER_EXE = 'keybinder.exe'

export const isKeybinderRunning = (): Promise<unknown> => {
  let command = ''
  const current_platform = platform()
  if (current_platform === 'win32') {
    log.info('Checking if keybinder is running on Windows...')
    command = `tasklist | findstr ${KEYBINDER_EXE}`
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        if (error) {
          resolve(false)
        } else {
          resolve(stdout.includes(KEYBINDER_EXE))
        }
      })
    })
  } else if (current_platform === 'darwin' || current_platform === 'linux') {
    log.info(`Checking if keybinder is running on ${current_platform}...`)
    command = `pgrep -x keybinder`
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        if (error) {
          resolve(false)
        } else {
          resolve(stdout.trim().length > 0)
        }
      })
    })
  } else {
    log.error('Unsupported platform for checking keybinder status.')
    return Promise.resolve(false)
  }
}

export const runKeybinder = (): void => {
  const current_platform = platform()
  if (current_platform === 'win32') {
    log.info('Running keybinder on Windows...')
    /// @todo This is hardcoding the path to the keybinder executable on Windows. Mac & Linux will not use an .exe file.
    const command = path.join(
      __dirname,
      '../../../../',
      'resources',
      'app',
      'keybinder',
      'keybinder.exe'
    )

    log.info(`Command to run: ${command}`)
    const ls = spawn(command, {
      shell: true,
      detached: true, // Key option for independent process
      stdio: 'ignore' // Optional: prevents process from blocking
      // windowsHide: true  // Optionally hide the console window on Windows
    })
    ls.unref() // Ensures the child process can continue running independently

    ls.on('close', (code) => {
      log.info('child process exited with code: ', code)
    })
  } else if (current_platform === 'darwin') {
    log.warn('Starting keybinder on macOS is not yet implemented.')
  } else if (current_platform === 'linux') {
    log.info('Running keybinder on Linux...')

    const command = 'keybinder' // Assumes 'keybinder' has SYMLINK from setup script
    const ls = spawn(command, {
      shell: true,
      detached: true,
      stdio: 'ignore'
    })
    ls.unref()

    ls.on('close', (code) => {
      log.info('keybinder process exited with code:', code)
    })
  } else {
    log.error('Unsupported platform for running keybinder.')
  }
}

export const stopKeybinder = (): void => {
  let command = ''
  const current_platform = platform()
  if (current_platform === 'win32') {
    log.info('Stopping keybinder on Windows...')
    command = `taskkill /im ${KEYBINDER_EXE} /t /F`
    exec(command, (error) => {
      if (error) {
        log.error('Error when attempting to stop keybinder: ', error)
      }
    })
  } else if (current_platform === 'darwin' || current_platform === 'linux') {
    log.info(`Stopping keybinder on ${current_platform}...`)
    command = `pkill -x -SIGINT keybinder`
    exec(command, (error) => {
      if (error) {
        log.error('Error when attempting to stop keybinder: ', error)
      }
    })
  } else {
    log.error('Unsupported platform for stopping keybinder.')
  }
}
