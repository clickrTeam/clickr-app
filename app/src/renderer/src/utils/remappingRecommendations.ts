import { KeyCount, SuggestedRemapping } from '../pages/Insights'
import { mainRows, specialtyRows, REPRESENTED_KEYS } from '../components/VisualKeyboard/Layout.const'

// Key position information
interface KeyPosition {
  row: number // 0-based row index (0=top, higher=lower)
  col: number // 0-based column index
  isMainKeyboard: boolean // true for mainRows, false for specialtyRows
}

// Finger reach multipliers (distance from home row)
// Home row is row index 3 in mainRows
const HOME_ROW_INDEX = 3
const FINGER_MULTIPLIERS = {
  0: 2.0, // Very far (Esc, F keys) - pinky needs to stretch significantly
  1: 1.8, // Far (number row) - requires finger extension
  2: 1.5, // Upper row (Q row) - moderate reach
  3: 1.0, // Home row - baseline
  4: 1.2, // Lower row (Z row) - slight reach down
  5: 1.4, // Bottom row (modifiers) - further reach down
}

// Specialty keys (Insert/Delete block) are considered very far
const SPECIALTY_ROW_DISTANCE_MULTIPLIER = 2.2

// Predicted average usage percentages by key category (as percentages, e.g., 0.8 = 0.8%)
const PREDICTED_AVERAGES: Record<string, number> = {
  // Letters (A-Z) - high usage
  letter: 0.8,
  // Numbers (0-9)
  number: 0.4,
  // Modifiers
  modifier: 0.6,
  // Navigation keys
  navigation: 0.15,
  // Function keys
  function: 0.08,
  // Punctuation
  punctuation: 0.3,
  // Special keys (Enter, Space, Tab, etc.)
  special: 0.2,
}

// Build key position map
function buildKeyPositionMap(): Map<string, KeyPosition> {
  const positionMap = new Map<string, KeyPosition>()

  // Map mainRows
  mainRows.forEach((row, rowIndex) => {
    row.forEach((keyData, colIndex) => {
      if (keyData.key !== '') {
        positionMap.set(keyData.key, {
          row: rowIndex,
          col: colIndex,
          isMainKeyboard: true,
        })
      }
    })
  })

  // Map specialtyRows (Insert/Delete block and arrows)
  specialtyRows.forEach((row, rowIndex) => {
    row.forEach((keyData, colIndex) => {
      if (keyData.key !== '') {
        // Specialty rows start after mainRows in the visual layout
        // They're positioned far from home row
        positionMap.set(keyData.key, {
          row: rowIndex + mainRows.length, // Offset by mainRows length
          col: colIndex,
          isMainKeyboard: false,
        })
      }
    })
  })

  return positionMap
}

// Calculate distance multiplier for a key based on home row distance
function getDistanceMultiplier(key: string, positionMap: Map<string, KeyPosition>): number {
  const pos = positionMap.get(key)
  if (!pos) {
    return 2.0 // Default to far if key not found
  }

  // Specialty rows (Insert/Delete block) are very far
  if (!pos.isMainKeyboard) {
    return SPECIALTY_ROW_DISTANCE_MULTIPLIER
  }

  // For main keyboard, use finger multipliers based on row
  return FINGER_MULTIPLIERS[pos.row as keyof typeof FINGER_MULTIPLIERS] || 2.0
}

// Get key category for predicted average
function getKeyCategory(key: string): string {
  // Single letter (A-Z)
  if (/^[A-Z]$/.test(key)) {
    return 'letter'
  }
  // Numbers (0-9)
  if (/^[0-9]$/.test(key)) {
    return 'number'
  }
  // Modifiers
  if (
    key.includes('Shift') ||
    key.includes('Ctrl') ||
    key.includes('Alt') ||
    key.includes('Win') ||
    key.includes('Meta') ||
    key === 'CapsLock'
  ) {
    return 'modifier'
  }
  // Navigation keys
  if (
    ['Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete'].includes(
      key
    ) ||
    key.startsWith('Arrow')
  ) {
    return 'navigation'
  }
  // Function keys
  if (/^F[0-9]+$/.test(key)) {
    return 'function'
  }
  // Punctuation
  if (['.', ',', ';', "'", '/', '-', '=', '[', ']', '\\', '`'].includes(key)) {
    return 'punctuation'
  }
  // Special keys
  return 'special'
}

// Check if key is a letter (A-Z)
function isLetter(key: string): boolean {
  return /^[A-Z]$/.test(key)
}

// Calculate predicted average usage count for a key
function getPredictedAverage(key: string, totalPresses: number): number {
  const category = getKeyCategory(key)
  const basePercentage = PREDICTED_AVERAGES[category] || 0.2
  // basePercentage is already a percentage (e.g., 0.8 = 0.8%), so divide by 100
  return (basePercentage / 100) * totalPresses
}

// Calculate distance score between two keys (lower = closer)
function getDistanceScore(
  key1: string,
  key2: string,
  positionMap: Map<string, KeyPosition>
): number {
  const pos1 = positionMap.get(key1)
  const pos2 = positionMap.get(key2)

  if (!pos1 || !pos2) {
    return 1000 // Very far if position unknown
  }

  // Both must be on main keyboard for meaningful distance
  if (!pos1.isMainKeyboard || !pos2.isMainKeyboard) {
    // Prefer mapping to main keyboard
    if (pos1.isMainKeyboard) return 10 // Key2 is specialty, prefer main keyboard
    if (pos2.isMainKeyboard) return 15 // Key1 is specialty, target is main keyboard - good!
    return 50 // Both specialty
  }

  // Euclidean distance
  const rowDiff = Math.abs(pos1.row - pos2.row)
  const colDiff = Math.abs(pos1.col - pos2.col)
  return Math.sqrt(rowDiff * rowDiff + colDiff * colDiff)
}

// Find candidate remapping targets (closer, less-used, non-letter keys)
function findCandidateTargets(
  sourceKey: string,
  keyCountData: KeyCount[],
  positionMap: Map<string, KeyPosition>,
  totalPresses: number
): Array<{ key: string; score: number; count: number }> {
  const sourcePos = positionMap.get(sourceKey)
  if (!sourcePos) return []

  const keyCountMap = new Map(keyCountData.map((kc) => [kc.key, kc.count]))
  const candidates: Array<{ key: string; score: number; count: number }> = []

  // Look through all represented keys
  REPRESENTED_KEYS.forEach((targetKey) => {
    // Skip letters as single-press targets
    if (isLetter(targetKey)) {
      return
    }

    // Never remap to the Space bar - it's always in an ideal spot
    if (targetKey === 'Space') {
      return
    }

    // Skip the source key itself
    if (targetKey === sourceKey) {
      return
    }

    const targetCount = keyCountMap.get(targetKey) || 0
    const targetUsagePercent = totalPresses > 0 ? (targetCount / totalPresses) * 100 : 0

    // Prefer less-used keys (<=1% of total) - threshold is 1%
    if (targetUsagePercent > 1.0) {
      return
    }

    // Calculate distance score (lower is better)
    const distanceScore = getDistanceScore(sourceKey, targetKey, positionMap)

    // Prefer keys closer to home row
    const targetPos = positionMap.get(targetKey)
    const sourcePos = positionMap.get(sourceKey)
    let homeRowBonus = 0
    if (targetPos?.isMainKeyboard && targetPos.row === HOME_ROW_INDEX) {
      homeRowBonus = -5 // Bonus for home row
    }
    
    // Bonus for keys in similar column position (same side of keyboard)
    let columnBonus = 0
    if (sourcePos && targetPos && sourcePos.isMainKeyboard && targetPos.isMainKeyboard) {
      const colDiff = Math.abs(sourcePos.col - targetPos.col)
      // If keys are in similar column positions (within 2 columns), give a bonus
      if (colDiff <= 2) {
        columnBonus = -2 // Prefer keys on the same side of keyboard
      }
    }

    // Score: lower distance and lower usage is better
    const score = distanceScore + targetUsagePercent * 10 + homeRowBonus + columnBonus

    candidates.push({
      key: targetKey,
      score,
      count: targetCount,
    })
  })

  // Sort by score (lower is better)
  return candidates.sort((a, b) => a.score - b.score)
}

// Generate remapping recommendations
export function generateRemappingRecommendations(
  keyCountData: KeyCount[]
): SuggestedRemapping[] {
  if (keyCountData.length === 0) {
    return []
  }

  const positionMap = buildKeyPositionMap()
  const totalPresses = keyCountData.reduce((sum, kc) => sum + kc.count, 0)

  if (totalPresses === 0) {
    return []
  }

  const keyCountMap = new Map(keyCountData.map((kc) => [kc.key, kc.count]))
  const recommendations: SuggestedRemapping[] = []

  // Find abnormally high-usage keys that are uncommon and far away
  const candidates: Array<{
    key: string
    count: number
    usagePercent: number
    distanceMultiplier: number
    predictedAvg: number
    threshold: number
    score: number
  }> = []

  keyCountData.forEach((kc) => {
    const key = kc.key
    const count = kc.count
    const usagePercent = (count / totalPresses) * 100

    // Skip letters - we're looking for non-standard high-usage keys
    if (isLetter(key)) {
      return
    }

    // Never remap the Space bar - it's always in an ideal spot
    if (key === 'Space') {
      return
    }

    // Must be a represented key
    if (!REPRESENTED_KEYS.includes(key)) {
      return
    }

    const distanceMultiplier = getDistanceMultiplier(key, positionMap)
    const predictedAvg = getPredictedAverage(key, totalPresses)
    // Threshold: 2x (predicted_avg * distance_multiplier)
    // This accounts for keys that are far away having a higher expected usage before being "abnormal"
    const threshold = predictedAvg * distanceMultiplier * 2

    // Check if usage is abnormally high (>2x the adjusted predicted average)
    // Also consider keys that are used frequently and are far away (regardless of % threshold)
    // This allows keys like Backspace (>1% usage, far away) to be considered for remapping
    const isAbnormallyHigh = count > threshold
    // Consider far-away keys with high absolute usage, even if they're >1% of total
    const isFarAndFrequent = distanceMultiplier >= 1.5 && count > predictedAvg * 1.5

    if (isAbnormallyHigh || isFarAndFrequent) {
      // Score: higher usage relative to threshold and further distance = higher priority
      const overThresholdRatio = isAbnormallyHigh ? count / threshold : count / (predictedAvg * 1.5)
      // Boost score for keys with high absolute usage even if percentage is lower
      const usageScore = usagePercent > 1.0 ? Math.max(usagePercent, 2.0) : usagePercent
      const score = overThresholdRatio * distanceMultiplier * usageScore

      candidates.push({
        key,
        count,
        usagePercent,
        distanceMultiplier,
        predictedAvg,
        threshold,
        score,
      })
    }
  })

  // Sort candidates by score (higher = more priority)
  candidates.sort((a, b) => b.score - a.score)

  // Generate recommendations for top candidates
  const colorOptions: SuggestedRemapping['color'][] = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
  ]

  let recommendationId = 1

  for (const candidate of candidates.slice(0, 10)) {
    // Limit to 6 recommendations total
    if (recommendations.length >= 6) {
      break
    }

    const targetCandidates = findCandidateTargets(
      candidate.key,
      keyCountData,
      positionMap,
      totalPresses
    )

    if (targetCandidates.length === 0) {
      continue
    }

    const bestTarget = targetCandidates[0]
    const targetCount = keyCountMap.get(bestTarget.key) || 0

    // Prefer swaps if both keys are single keys and not letters
    if (!isLetter(candidate.key) && !isLetter(bestTarget.key)) {
      // Check if swap would be beneficial (target key is used less and is closer)
      const targetDistanceMult = getDistanceMultiplier(bestTarget.key, positionMap)
      const targetUsagePercent = totalPresses > 0 ? (targetCount / totalPresses) * 100 : 0
      const targetDistance = getDistanceScore(bestTarget.key, 'A', positionMap)
      const sourceDistance = getDistanceScore(candidate.key, 'A', positionMap)
      
      // Swap is beneficial if target is less used and closer to home row
      // Also allow swaps if keys are in similar positions (e.g., F12 and \) and target is less used
      const isSimilarPosition = targetDistance <= sourceDistance + 2
      const isBetterTarget = targetCount < candidate.count && targetDistanceMult <= candidate.distanceMultiplier
      
      if (isBetterTarget || (isSimilarPosition && targetCount < candidate.count * 0.8)) {
        recommendations.push({
          id: `swap-${recommendationId++}`,
          type: 'swap',
          swapKey1: candidate.key,
          swapKey2: bestTarget.key,
          reason: `${candidate.key} is used ${candidate.count.toLocaleString()} times (${candidate.usagePercent.toFixed(2)}%) but is far from home row (${candidate.distanceMultiplier.toFixed(1)}x reach). Swap with ${bestTarget.key} (${targetCount.toLocaleString()} uses, ${targetUsagePercent.toFixed(2)}%, ${targetDistanceMult.toFixed(1)}x reach) which is closer and less used.`,
          potentialSavings: ((candidate.count - targetCount) * Math.max(candidate.distanceMultiplier - targetDistanceMult, 0.2)) / 1000,
          color: colorOptions[recommendations.length % colorOptions.length],
        })
        continue
      }
    }

    // Use mapping for multiple keys, letter combinations, or when target is non-standard
    const sourceDistance = getDistanceScore(candidate.key, 'A', positionMap) // Reference to home row
    const targetDistance = getDistanceScore(bestTarget.key, 'A', positionMap)

    // Prefer non-letter target if it's closer; otherwise use letter combination
    if (targetDistance < sourceDistance - 2 && !isLetter(bestTarget.key)) {
      // Good non-letter target that's closer
      recommendations.push({
        id: `mapping-${recommendationId++}`,
        type: 'mapping',
        fromKey: candidate.key,
        toKeys: [bestTarget.key],
        reason: `${candidate.key} is used ${candidate.count.toLocaleString()} times (${candidate.usagePercent.toFixed(2)}%) but requires reaching far from home row (distance multiplier: ${candidate.distanceMultiplier.toFixed(1)}x). Map to ${bestTarget.key} which is closer and less used (${targetCount.toLocaleString()} uses, ${((targetCount / totalPresses) * 100).toFixed(2)}%).`,
        potentialSavings: (candidate.count * (candidate.distanceMultiplier - 1.0)) / 1000,
        color: colorOptions[recommendations.length % colorOptions.length],
      })
    } else {
      // Map to letter combination (e.g., Delete -> Z+Z)
      // Find a letter on home row that's less frequently used to avoid conflicts
      const homeRowLetters = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
      
      // Prefer letters that are less used relative to candidate
      const letterUsage = homeRowLetters.map(letter => ({
        letter,
        count: keyCountMap.get(letter) || 0,
      })).sort((a, b) => a.count - b.count)
      
      // Pick a letter that's less used (to minimize conflicts) but still accessible
      // Avoid letters that are used more than 10% of candidate's usage
      const suitableLetter = letterUsage.find(l => l.count < candidate.count * 0.1)
      const bestLetter = suitableLetter?.letter || 'Z' // Fallback to Z (on Z row)

      recommendations.push({
        id: `mapping-${recommendationId++}`,
        type: 'mapping',
        fromKey: candidate.key,
        toKeys: [bestLetter, bestLetter],
        reason: `${candidate.key} is used ${candidate.count.toLocaleString()} times (${candidate.usagePercent.toFixed(2)}%) but is far from home row (distance multiplier: ${candidate.distanceMultiplier.toFixed(1)}x). Map to ${bestLetter}+${bestLetter} for quick access without leaving home row.`,
        potentialSavings: (candidate.count * (candidate.distanceMultiplier - 1.0)) / 1000,
        color: colorOptions[recommendations.length % colorOptions.length],
      })
    }
  }

  return recommendations
}

