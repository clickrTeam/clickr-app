import { ipcMain } from 'electron'
import { getFrequencies } from '../services/daemon-bridge'
import log from 'electron-log'

export interface KeyCount {
  key: string
  count: number
}

export function registerStatsHandlers(): void {
  ipcMain.handle('get-key-frequencies', async () => {
    log.debug('IPC: Getting key frequencies from daemon')
    try {
      const frequencies = await getFrequencies()
      log.debug('IPC: Raw frequencies from daemon:', JSON.stringify(frequencies).substring(0, 200))
      
      // Convert Record<string, number> to KeyCount[]
      const keyCountData: KeyCount[] = Object.entries(frequencies).map(([key, count]) => ({
        key,
        count
      }))
      
      log.info(`IPC: Converted ${keyCountData.length} key frequencies`)
      return keyCountData
    } catch (error) {
      log.error('IPC: Error getting key frequencies:', error)
      throw error
    }
  })
}

