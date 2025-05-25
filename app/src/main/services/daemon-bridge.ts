import path from 'path'
import * as os from 'os'
import * as net from 'net'
import { Profile } from '../../models/Profile'

// Path to the socket which is based on the OS
const SOCKET_PATH =
  process.platform === 'win32' ? `\\\\.\\pipe\\clickr` : path.join(os.tmpdir(), 'clickr.sock')

type DaemonReponse = {
  status: string
  error?: string
}

/**
 * Sends a profile to the daemon to be loaded as the active profile.
 *
 * This wraps the low-level `sendMessage` function with a higher-level command.
 */
export function sendActiveProfile(profile: Profile): Promise<DaemonReponse> {
  return sendMessage({
    type: 'load_profile',
    profile: profile
  })
}

/**
 * Sends a JSON message to the local daemon via a UNIX domain socket or named pipe,
 * waits for a newline-delimited JSON response, and resolves with the parsed result.
 *
 * TODO: Reuse the socket connection instead of creating a new one for every message.
 * This will requre messages to have some kind of ID.
 */
function sendMessage(message: object): Promise<DaemonReponse> {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(SOCKET_PATH, () => {
      client.write(JSON.stringify(message) + '\n')
    })

    let buffer = ''

    client.on('data', (data) => {
      buffer += data.toString()

      if (buffer.includes('\n')) {
        // We assume one message per line
        const [line] = buffer.split('\n')
        try {
          const parsed: DaemonReponse = JSON.parse(line)
          resolve(parsed)
        } catch {
          reject(new Error('Failed to parse response from daemon'))
        } finally {
          client.end()
        }
      }
    })

    client.on('error', (err) => {
      reject(new Error(`Failed to connect to daemon: ${err.message}`))
    })
  })
}
