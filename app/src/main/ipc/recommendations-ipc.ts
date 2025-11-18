import { ipcMain } from 'electron'
import { recommendationsStore } from '../services/recommendations-store'
import log from 'electron-log'

export function registerRecommendationsHandlers(): void {
  ipcMain.handle('get-recommendations', () => {
    log.debug('IPC: Getting recommendations')
    return recommendationsStore.getRecommendations()
  })

  ipcMain.handle('save-recommendations', (_event, recommendations) => {
    log.info('IPC: Saving recommendations:', recommendations?.length || 0)
    recommendationsStore.saveRecommendations(recommendations)
  })

  ipcMain.handle('clear-recommendations', () => {
    log.info('IPC: Clearing recommendations')
    recommendationsStore.clearRecommendations()
  })

  ipcMain.handle('get-selected-recommendation-id', () => {
    log.debug('IPC: Getting selected recommendation ID')
    return recommendationsStore.getSelectedId()
  })

  ipcMain.handle('save-selected-recommendation-id', (_event, id: string | null) => {
    log.debug('IPC: Saving selected recommendation ID:', id)
    recommendationsStore.saveSelectedId(id)
  })
}

