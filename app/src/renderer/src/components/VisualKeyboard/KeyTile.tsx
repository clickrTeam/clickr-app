import React from 'react'
import { getShortLabel } from './Util'
import { KeyTileModel } from './Model'
import { getBindColor } from './Colors'
import { SuggestedRemapping } from '../../pages/Insights'
import './KeyTile.css'

interface KeyTileProps {
  keyModel: KeyTileModel
  onClick: () => void
  onInspect: (keyModel: KeyTileModel | null) => void
  hoveredRemapping?: SuggestedRemapping | null
}

// Helper function to get destination keys array from SuggestedRemapping
const getDestinationKeys = (remapping: SuggestedRemapping | null): string[] => {
  if (!remapping || remapping.type === 'swap') return []
  return remapping.toKeys || []
}

// Function to check if key is part of hovered remapping and get the style
const getRemappingStyle = (key: string, hoveredRemapping: SuggestedRemapping | null): string | null => {
  if (!hoveredRemapping) return null

  if (hoveredRemapping.type === 'swap') {
    if (key === hoveredRemapping.swapKey1 || key === hoveredRemapping.swapKey2) {
      return 'border-4 border-purple-600 remapping-pulse-purple shadow-lg shadow-purple-600/50'
    }
  } else {
    if (key === hoveredRemapping.fromKey) {
      return 'border-4 border-green-600 remapping-pulse-green shadow-lg shadow-green-600/50'
    }

    // Support multiple destination keys (toKeys array)
    const toKeys = getDestinationKeys(hoveredRemapping)
    if (toKeys.includes(key)) {
      return 'border-4 border-blue-600 remapping-pulse-blue shadow-lg shadow-blue-600/50'
    }
  }

  return null
}

export const KeyTile: React.FC<KeyTileProps> = ({ keyModel, onClick, onInspect, hoveredRemapping = null }) => {
  if (keyModel.key === '') {
    return (
      <span className="flex items-center">
        <span
          className="inline-block"
          style={{
            minWidth: keyModel.displayWidth
          }}
        />
        {keyModel.gapAfter !== '0rem' && (
          <span
            className="inline-block"
            style={{
              minWidth: keyModel.gapAfter
            }}
          />
        )}
      </span>
    )
  }

  const remappingStyle = getRemappingStyle(keyModel.key, hoveredRemapping)

  return (
    <span className="flex items-center">
      <button
        ref={(el) => {
          keyModel.keyRef = el
        }}
        type="button"
        className={`${keyModel.className} ${remappingStyle || ''}`}
        style={{
          minWidth: keyModel.displayWidth,
          background: getBindColor(keyModel.mapped)
        }}
        onClick={onClick}
        onMouseEnter={() => onInspect(keyModel)}
        onMouseLeave={() => onInspect(null)}
      >
        {keyModel.displayKey ? (
          <b>{getShortLabel(keyModel.displayKey)}</b>
        ) : (
          getShortLabel(keyModel.key)
        )}
      </button>
      {keyModel.gapAfter !== '0rem' && (
        <span
          className="inline-block"
          style={{
            minWidth: keyModel.gapAfter
          }}
        />
      )}
    </span>
  )
}
