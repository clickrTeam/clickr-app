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
    return true
  })

  ipcMain.handle('stop-keybinder', async () => {
    await stopKeybinder()
    return true
  })
}

const KEYBINDER_EXE = 'keybinder.exe'

export const isKeybinderRunning = (): Promise<unknown> => {
  log.info('Checking if keybinder is running...')
  const command =
    platform() === 'win32'
      ? `tasklist | findstr ${KEYBINDER_EXE}`
      : `ps -ef | grep ${KEYBINDER_EXE}`
  return new Promise((resolve) => {
    exec(command, (error, stdout) => {
      if (error) {
        resolve(false)
      } else {
        resolve(stdout.includes(KEYBINDER_EXE))
      }
    })
  })
}

export const runKeybinder = (): void => {
  log.info('Running keybinder...')
  /// @todo This is hardcoding the path to the keybinder executable on Windows. Mac & Linux will not use an .exe file.
  const command = path.join(__dirname, '../../../../', 'resources', 'keybinder', 'keybinder.exe')

  log.info(`Command to run: ${command}`)
  const ls = spawn(command, {
    shell: true
  })

  ls.stdout.on('data', (data) => {
    log.info('stdout: ', data)
  })

  ls.stderr.on('data', (data) => {
    log.error('stderr: ', data)
  })

  ls.on('close', (code) => {
    log.info('child process exited with code: ', code)
  })
}

export const stopKeybinder = (): void => {
  log.info('Stopping keybinder...')
  /// @todo KEYBINDER_EXE expands to keybinder.exe. Mac & Linux will not use an .exe file.
  const command =
    platform() === 'win32' ? `taskkill /im ${KEYBINDER_EXE} /t /F` : `pkill -15 -f ${KEYBINDER_EXE}`
  exec(command, (error) => {
    if (error) {
      log.error('Error when attempting to stop keybinder: ', error)
    }
  })
}
