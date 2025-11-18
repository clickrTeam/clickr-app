import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import log from 'electron-log'

interface SuggestedRemapping {
  id: string
  type: 'mapping' | 'swap'
  fromKey?: string
  toKeys?: string[]
  swapKey1?: string
  swapKey2?: string
  reason: string
  potentialSavings: number
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
}

// Path to the recommendations JSON file
const recommendationsFilePath = path.join(app.getPath('userData'), 'recommendations.json')
const selectedIdFilePath = path.join(app.getPath('userData'), 'selected-recommendation-id.json')
log.info('Recommendations file path:', recommendationsFilePath)

let recommendations: SuggestedRemapping[] | null = null
let selectedId: string | null | undefined = undefined

// Read and parse the recommendations file
function getRecommendationsData(): SuggestedRemapping[] {
  if (recommendations === null) {
    try {
      if (fs.existsSync(recommendationsFilePath)) {
        const raw = fs.readFileSync(recommendationsFilePath, 'utf-8')
        recommendations = JSON.parse(raw) as SuggestedRemapping[]
        log.debug('Recommendations loaded from file:', recommendations.length)
      } else {
        recommendations = []
      }
    } catch (error) {
      log.error('Error reading recommendations file:', error)
      recommendations = []
    }
  }
  return recommendations!
}

// Serialize and write the recommendations file
function writeRecommendations(): void {
  try {
    fs.writeFileSync(recommendationsFilePath, JSON.stringify(getRecommendationsData(), null, 2), 'utf-8')
    log.debug('Recommendations written to file')
  } catch (error) {
    log.error('Error writing recommendations file:', error)
  }
}

// Read selected ID
function getSelectedIdData(): string | null {
  if (selectedId === undefined) {
    try {
      if (fs.existsSync(selectedIdFilePath)) {
        const raw = fs.readFileSync(selectedIdFilePath, 'utf-8')
        const parsed = JSON.parse(raw)
        selectedId = parsed.id || null
      } else {
        selectedId = null
      }
    } catch (error) {
      log.error('Error reading selected ID file:', error)
      selectedId = null
    }
  }
  return selectedId ?? null
}

// Write selected ID
function writeSelectedId(): void {
  try {
    if (selectedId) {
      fs.writeFileSync(selectedIdFilePath, JSON.stringify({ id: selectedId }, null, 2), 'utf-8')
    } else {
      if (fs.existsSync(selectedIdFilePath)) {
        fs.unlinkSync(selectedIdFilePath)
      }
    }
    log.debug('Selected ID written to file')
  } catch (error) {
    log.error('Error writing selected ID file:', error)
  }
}

export const recommendationsStore = {
  /**
   * Get all recommendations
   */
  getRecommendations(): SuggestedRemapping[] {
    return getRecommendationsData()
  },

  /**
   * Save recommendations
   */
  saveRecommendations(recs: SuggestedRemapping[]): void {
    recommendations = recs
    writeRecommendations()
    log.info('Recommendations saved:', recs.length)
  },

  /**
   * Clear recommendations
   */
  clearRecommendations(): void {
    recommendations = []
    writeRecommendations()
    log.info('Recommendations cleared')
  },

  /**
   * Get selected recommendation ID
   */
  getSelectedId(): string | null {
    return getSelectedIdData()
  },

  /**
   * Save selected recommendation ID
   */
  saveSelectedId(id: string | null): void {
    selectedId = id
    writeSelectedId()
    log.debug('Selected ID saved:', id)
  }
}

