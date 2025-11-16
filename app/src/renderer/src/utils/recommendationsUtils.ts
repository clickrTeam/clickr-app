import { SuggestedRemapping } from '../pages/Insights'

/**
 * Get keys used in a recommendation (for conflict checking)
 */
export function getKeysFromRecommendation(remapping: SuggestedRemapping): string[] {
  const keys: string[] = []
  
  if (remapping.type === 'swap') {
    if (remapping.swapKey1) keys.push(remapping.swapKey1)
    if (remapping.swapKey2) keys.push(remapping.swapKey2)
  } else {
    if (remapping.fromKey) keys.push(remapping.fromKey)
    if (remapping.toKeys) {
      keys.push(...remapping.toKeys)
    }
  }
  
  return keys
}

/**
 * Check if two recommendations share any keys
 */
export function recommendationsShareKeys(
  remapping1: SuggestedRemapping,
  remapping2: SuggestedRemapping
): boolean {
  const keys1 = new Set(getKeysFromRecommendation(remapping1))
  const keys2 = getKeysFromRecommendation(remapping2)
  
  return keys2.some(key => keys1.has(key))
}

/**
 * Remove recommendations that share keys with the applied one
 */
export function removeConflictingRecommendations(
  recommendations: SuggestedRemapping[],
  appliedRemapping: SuggestedRemapping
): SuggestedRemapping[] {
  return recommendations.filter(
    rec => !recommendationsShareKeys(rec, appliedRemapping) || rec.id === appliedRemapping.id
  )
}

