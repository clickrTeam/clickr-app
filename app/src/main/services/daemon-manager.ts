import { spawn, exec } from 'child_process'
import { ipcMain } from 'electron'
import { platform } from 'os'
import path from 'path'

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
  console.log('Checking if keybinder is running...')
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
  console.log('Running keybinder...')
  const command = path.join(__dirname, '../../../../', 'resources', 'keybinder', 'keybinder.exe')

  console.log(`Command to run: ${command}`)
  const ls = spawn(command, {
    shell: true
  })

  ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

export const stopKeybinder = (): void => {
  console.log('Stopping keybinder...')
  const command =
    platform() === 'win32' ? `taskkill /im ${KEYBINDER_EXE} /t /F` : `pkill -15 -f ${KEYBINDER_EXE}`
  exec(command, (error) => {
    if (error) {
      console.error(error)
    }
  })
}
