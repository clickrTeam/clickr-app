import { motion, AnimatePresence } from 'framer-motion'
import { KeyCount, SuggestedRemapping } from '../pages/Insights'
import {
  mainRows,
  specialtyRows,
  numpadRows,
  keyShortLabels,
  REPRESENTED_KEYS
} from './VisualKeyboard/Layout.const'

interface KeyboardHeatmapProps {
  keyCountData: KeyCount[]
  hoveredRemapping: SuggestedRemapping | null
}

// Helper function to get destination keys array from SuggestedRemapping
// Recommended max: 10 keys per mapping
const getDestinationKeys = (remapping: SuggestedRemapping | null): string[] => {
  if (!remapping || remapping.type === 'swap') return []
  return remapping.toKeys || []
}

// Helper function to get keys that are not on the keyboard layout
const getMissingKeys = (remapping: SuggestedRemapping | null): string[] => {
  const destinationKeys = getDestinationKeys(remapping)
  return destinationKeys.filter((key) => !REPRESENTED_KEYS.includes(key))
}

const KeyboardHeatmap = ({ keyCountData, hoveredRemapping }: KeyboardHeatmapProps): JSX.Element => {
  // Create a map for quick lookup
  const keyCountMap = new Map(keyCountData.map((kc) => [kc.key, kc]))

  // Calculate total count once for percentage calculations
  const totalCount = keyCountData.reduce((sum, kc) => sum + kc.count, 0)

  // Get the max count for color intensity calculation
  const maxCount = Math.max(...keyCountData.map((kc) => kc.count))

  // Function to get heat color based on count
  const getHeatColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 border-gray-300 text-gray-500'

    const intensity = count / maxCount

    if (intensity < 0.2) {
      return 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-blue-700'
    } else if (intensity < 0.4) {
      return 'bg-gradient-to-br from-cyan-200 to-cyan-300 border-cyan-400 text-cyan-800'
    } else if (intensity < 0.6) {
      return 'bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-400 text-yellow-900'
    } else if (intensity < 0.8) {
      return 'bg-gradient-to-br from-orange-300 to-orange-400 border-orange-500 text-orange-900'
    } else {
      return 'bg-gradient-to-br from-red-400 to-red-600 border-red-600 text-white'
    }
  }

  // Function to check if key is part of hovered remapping
  const getRemappingStyle = (key: string): string | null => {
    if (!hoveredRemapping) return null

    if (hoveredRemapping.type === 'swap') {
      if (key === hoveredRemapping.swapKey1 || key === hoveredRemapping.swapKey2) {
        return 'border-4 border-purple-600 animate-pulse shadow-lg shadow-purple-600/50'
      }
    } else {
      if (key === hoveredRemapping.fromKey) {
        return 'border-4 border-green-600 animate-pulse shadow-lg shadow-green-600/50'
      }

      // Support multiple destination keys (toKeys array)
      const toKeys = getDestinationKeys(hoveredRemapping)
      if (toKeys.includes(key)) {
        return 'border-4 border-blue-600 animate-pulse shadow-lg shadow-blue-600/50'
      }
    }

    return null
  }

  // Render a single key
  const renderKey = (
    keyData: { key: string; width?: number; gapAfter?: boolean },
    rowIndex: number,
    keyIndex: number,
    section: string
  ): JSX.Element => {
    if (keyData.key === '') {
      return (
        <div
          key={`${section}-${rowIndex}-${keyIndex}`}
          style={{
            width: `${(keyData.width || 2.25) * 16}px`,
            height: '40px'
          }}
        />
      )
    }

    const keyCount = keyCountMap.get(keyData.key)
    const count = keyCount?.count || 0
    const heatColor = getHeatColor(count)
    const remappingStyle = getRemappingStyle(keyData.key)
    const displayLabel = keyShortLabels[keyData.key] || keyData.key

    return (
      <motion.div
        key={`${section}-${rowIndex}-${keyIndex}`}
        className={`relative flex items-center justify-center rounded-md border-2 font-mono font-bold text-xs transition-all duration-300 group cursor-pointer ${heatColor} ${remappingStyle || ''} ${keyData.gapAfter ? 'mr-2' : ''}`}
        style={{
          width: `${(keyData.width || 2.25) * 16}px`,
          height: '40px',
          minWidth: `${(keyData.width || 2.25) * 16}px`,
          zIndex: 1
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rowIndex * 0.05 + keyIndex * 0.01 }}
        whileHover={{
          scale: 1.05,
          y: -2,
          zIndex: 40,
          transition: { duration: 0.08, ease: 'easeOut' }
        }}
      >
        {/* Key label */}
        <span className="relative z-10 text-[10px]">{displayLabel}</span>

        {/* Tooltip on hover */}
        {count > 0 && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity delay-100 pointer-events-none z-50">
            <div className="bg-gray-900 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-xl">
              <div className="font-bold">{keyData.key}</div>
              <div>{count.toLocaleString()} presses</div>
              <div className="text-gray-300">
                {totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}

        {/* Remapping indicator */}
        {remappingStyle && hoveredRemapping && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-100 border-2 border-gray-400 text-gray-700 rounded px-1 py-0.5 text-[9px] font-bold whitespace-nowrap shadow-lg z-30">
            {hoveredRemapping.type === 'swap'
              ? 'SWAP'
              : keyData.key === hoveredRemapping.fromKey
                ? 'TO'
                : 'FROM'}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl backdrop-blur-sm">
      <div className="flex gap-4">
        {/* Main keyboard section */}
        <div className="flex flex-col gap-1">
          {mainRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-0.5"
              style={{ marginBottom: rowIndex === 0 ? '8px' : '0' }}
            >
              {row.map((keyData, keyIndex) => renderKey(keyData, rowIndex, keyIndex, 'main'))}
            </div>
          ))}
        </div>

        {/* Specialty keys section (Insert/Delete block + Arrow keys) */}
        <div className="flex flex-col gap-1">
          {specialtyRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-0.5">
              {row.map((keyData, keyIndex) => renderKey(keyData, rowIndex, keyIndex, 'specialty'))}
            </div>
          ))}
        </div>

        {/* Numpad section */}
        <div className="flex flex-col gap-1 relative">
          {/* Ethereal keys - keys not on the keyboard layout */}
          <AnimatePresence>
            {hoveredRemapping && hoveredRemapping.type === 'mapping' && (
              <div
                className="absolute right-0 flex flex-col gap-1 items-end"
                style={{ top: '-8px' }}
              >
                {getMissingKeys(hoveredRemapping).map((missingKey, index) => {
                  const displayText = keyShortLabels[missingKey] || missingKey
                  return (
                    <motion.div
                      key={missingKey}
                      className="relative flex items-center justify-center rounded-md border-4 border-blue-600 bg-white/90 backdrop-blur-sm font-mono font-bold text-xs animate-pulse shadow-lg shadow-blue-600/50 px-2"
                      style={{
                        height: '40px',
                        minWidth: `${2.25 * 16}px`
                      }}
                      initial={{ opacity: 0, scale: 0.5, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -10 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: 'easeOut'
                      }}
                    >
                      {/* Remapping indicator */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-100 border-2 border-gray-400 text-gray-700 rounded px-1 py-0.5 text-[9px] font-bold whitespace-nowrap shadow-lg z-30">
                        FROM
                      </div>
                      <span className="relative z-10 text-[10px] text-blue-600 whitespace-nowrap">
                        {displayText}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>

          {numpadRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-0.5">
              {row.map((keyData, keyIndex) => renderKey(keyData, rowIndex, keyIndex, 'numpad'))}
            </div>
          ))}
        </div>
      </div>

      {/* Remapping preview text */}
      {hoveredRemapping && (
        <motion.div
          className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <p className="text-sm font-semibold">
            {hoveredRemapping.type === 'swap' ? (
              <>
                <span className="text-purple-600">{hoveredRemapping.swapKey1}</span>
                {' ↔ '}
                <span className="text-purple-600">{hoveredRemapping.swapKey2}</span>
              </>
            ) : (
              <>
                <span className="text-green-600">{hoveredRemapping.fromKey}</span>
                {' → '}
                {getDestinationKeys(hoveredRemapping).map((toKey, index) => (
                  <span key={toKey}>
                    {index > 0 && <span className="text-gray-600"> + </span>}
                    <span className="text-blue-600">{toKey}</span>
                  </span>
                ))}
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{hoveredRemapping.reason}</p>
        </motion.div>
      )}
    </div>
  )
}

export default KeyboardHeatmap
