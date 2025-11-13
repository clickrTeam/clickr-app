import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import KeyboardHeatmap from '../components/KeyboardHeatmap'
import RemappingBubble from '../components/RemappingBubble'
import { Card } from '../components/ui/card'
import { RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/button'
import log from 'electron-log'

// Data interfaces
export interface KeyCount {
  key: string
  count: number
}

export interface SuggestedRemapping {
  id: string
  type: 'mapping' | 'swap'
  fromKey?: string // Used for 'mapping' type (fromKey → toKeys)
  toKeys?: string[] // Used for 'mapping' type (fromKey → toKeys). Supports up to 10 keys
  swapKey1?: string // Used for 'swap' type (swapKey1 ↔ swapKey2)
  swapKey2?: string // Used for 'swap' type (swapKey1 ↔ swapKey2)
  reason: string
  potentialSavings: number
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
}

function Insights(): JSX.Element {
  const [keyCountData, setKeyCountData] = useState<KeyCount[]>([
    // Most common letters (English frequency distribution)
    { key: 'E', count: 6350 },
    { key: 'T', count: 4550 },
    { key: 'A', count: 4100 },
    { key: 'O', count: 3750 },
    { key: 'I', count: 3500 },
    { key: 'N', count: 3350 },
    { key: 'S', count: 3150 },
    { key: 'R', count: 3000 },
    { key: 'H', count: 3050 },
    { key: 'D', count: 2150 },
    { key: 'L', count: 2000 },
    { key: 'U', count: 1400 },
    { key: 'C', count: 1400 },
    { key: 'M', count: 1200 },
    { key: 'W', count: 1200 },
    { key: 'F', count: 1100 },
    { key: 'G', count: 1000 },
    { key: 'Y', count: 1000 },
    { key: 'P', count: 950 },
    { key: 'B', count: 750 },
    { key: 'V', count: 500 },
    { key: 'K', count: 400 },
    { key: 'J', count: 75 },
    { key: 'X', count: 75 },
    { key: 'Q', count: 50 },
    { key: 'Z', count: 35 },
    // Numbers (0-9)
    { key: '1', count: 800 },
    { key: '2', count: 750 },
    { key: '3', count: 700 },
    { key: '4', count: 650 },
    { key: '5', count: 600 },
    { key: '6', count: 550 },
    { key: '7', count: 500 },
    { key: '8', count: 450 },
    { key: '9', count: 400 },
    { key: '0', count: 350 },
    // High-frequency special keys
    { key: 'Space', count: 8500 },
    { key: 'Enter', count: 2200 },
    { key: 'Backspace', count: 1800 },
    { key: 'ShiftLeft', count: 3200 },
    { key: 'ShiftRight', count: 800 },
    { key: 'Tab', count: 1200 },
    // Modifiers
    { key: 'CtrlLeft', count: 1500 },
    { key: 'CtrlRight', count: 200 },
    { key: 'AltLeft', count: 800 },
    { key: 'AltRight', count: 150 },
    { key: 'Win', count: 600 },
    // Common punctuation
    { key: '.', count: 1200 },
    { key: ',', count: 1000 },
    { key: "'", count: 600 },
    { key: ';', count: 400 },
    { key: '/', count: 500 },
    { key: '-', count: 450 },
    { key: '=', count: 200 },
    { key: '[', count: 150 },
    { key: ']', count: 150 },
    { key: '\\', count: 100 },
    { key: '`', count: 80 },
    // Navigation keys
    { key: 'Up', count: 450 },
    { key: 'Down', count: 500 },
    { key: 'Left', count: 400 },
    { key: 'Right', count: 450 },
    { key: 'Home', count: 200 },
    { key: 'End', count: 180 },
    { key: 'PageUp', count: 150 },
    { key: 'PageDown', count: 150 },
    { key: 'Delete', count: 350 },
    { key: 'Insert', count: 50 },
    // Function keys (low usage)
    { key: 'F1', count: 120 },
    { key: 'F2', count: 100 },
    { key: 'F3', count: 90 },
    { key: 'F4', count: 80 },
    { key: 'F5', count: 200 },
    { key: 'F6', count: 70 },
    { key: 'F7', count: 60 },
    { key: 'F8', count: 50 },
    { key: 'F9', count: 40 },
    { key: 'F10', count: 180 },
    { key: 'F11', count: 300 },
    { key: 'F12', count: 250 },
    // Rarely used keys
    { key: 'Esc', count: 400 },
    { key: 'CapsLock', count: 25 },
    { key: 'Fn', count: 15 },
    { key: 'Menu', count: 30 },
    { key: 'PrintScreen', count: 20 },
    { key: 'ScrollLock', count: 5 },
    { key: 'Pause', count: 8 },
    // Numpad (moderate usage)
    { key: 'Numpad0', count: 300 },
    { key: 'Numpad1', count: 250 },
    { key: 'Numpad2', count: 250 },
    { key: 'Numpad3', count: 200 },
    { key: 'Numpad4', count: 200 },
    { key: 'Numpad5', count: 180 },
    { key: 'Numpad6', count: 180 },
    { key: 'Numpad7', count: 150 },
    { key: 'Numpad8', count: 150 },
    { key: 'Numpad9', count: 120 },
    { key: 'NumpadAdd', count: 100 },
    { key: 'NumpadSubtract', count: 80 },
    { key: 'NumpadMultiply', count: 60 },
    { key: 'NumpadDivide', count: 50 },
    { key: 'NumpadDecimal', count: 90 },
    { key: 'NumpadEnter', count: 120 },
    { key: 'NumLock', count: 10 }
  ])

  const [suggestedRemappings] = useState<SuggestedRemapping[]>([
    {
      id: '1',
      type: 'swap',
      swapKey1: 'CapsLock',
      swapKey2: 'CtrlLeft',
      reason: 'Swap CapsLock and Ctrl for better ergonomics. CapsLock is rarely used.',
      potentialSavings: 2.5,
      color: 'blue'
    },
    {
      id: '2',
      type: 'swap',
      swapKey1: 'ShiftRight',
      swapKey2: 'Backspace',
      reason:
        'Swap right shift with backspace. Right shift is underused, backspace is high-traffic.',
      potentialSavings: 4.1,
      color: 'green'
    },
    {
      id: '3',
      type: 'swap',
      swapKey1: 'CtrlRight',
      swapKey2: 'Enter',
      reason: 'Swap right Ctrl with Enter. Right Ctrl is rarely used, Enter is frequently needed.',
      potentialSavings: 3.5,
      color: 'orange'
    },
    {
      id: '4',
      type: 'mapping',
      fromKey: 'Fn',
      toKeys: ['CtrlLeft', 'ShiftLeft', 'E'],
      reason: 'Easy access to Escape for quick exits.',
      potentialSavings: 1.8,
      color: 'red'
    },
    {
      id: '5',
      type: 'mapping',
      fromKey: 'AltLeft',
      toKeys: ['CtrlLeft', 'C'],
      reason: 'Left Alt is rarely used, Left Ctrl is frequently used.',
      potentialSavings: 3.2,
      color: 'yellow'
    },
    {
      id: '6',
      type: 'mapping',
      fromKey: 'Menu',
      toKeys: ['VolumeUp'],
      reason: 'Menu key is underused, VolumeUp is frequently used.',
      potentialSavings: 2.8,
      color: 'purple'
    }
  ])

  const [hoveredRemapping, setHoveredRemapping] = useState<SuggestedRemapping | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isButtonSpinning, setIsButtonSpinning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch key frequencies from daemon
  const fetchKeyFrequencies = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
        // Stop the immediate spin animation once refresh state is set
        setTimeout(() => setIsButtonSpinning(false), 100)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Check if API method exists (in case preload hasn't reloaded)
      if (!window.api || typeof window.api.getKeyFrequencies !== 'function') {
        const errorMsg =
          'getKeyFrequencies API not available. Please restart the app to reload the preload script.'
        log.error(errorMsg)
        setError(errorMsg)
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      log.info('Fetching key frequencies from daemon...')
      const frequencies = await window.api.getKeyFrequencies()

      log.debug('Received frequencies:', frequencies)

      if (frequencies && frequencies.length > 0) {
        setKeyCountData(frequencies)
        log.info(`Successfully loaded ${frequencies.length} key frequencies`)
      } else {
        log.warn('No key frequency data received from daemon')
        setError('No data available. Make sure the keybinder is running.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch key frequencies'
      log.error('Error fetching key frequencies:', err)

      // Provide more helpful error messages
      if (errorMessage.includes('ENOENT') || errorMessage.includes('connect')) {
        setError(
          'Cannot connect to daemon. Make sure the keybinder is running. Check the daemon status in settings.'
        )
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    fetchKeyFrequencies()
  }, [fetchKeyFrequencies])

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Keyboard Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your typing patterns and optimize your keyboard layout
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">Total Keys Pressed</h3>
            <p className="text-2xl font-bold text-blue-600">
              {keyCountData.reduce((sum, kc) => sum + kc.count, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {keyCountData.length > 0
                ? `${keyCountData.length} unique key combinations tracked`
                : 'No data available'}
            </p>
          </Card>
          <Card className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">Most Used Key</h3>
            <p className="text-2xl font-bold text-green-600">
              {(() => {
                if (keyCountData.length === 0) return 'N/A'
                const mostUsed = [...keyCountData].sort((a, b) => b.count - a.count)[0]
                return mostUsed.key
              })()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(() => {
                if (keyCountData.length === 0) return 'No data available'
                const totalCount = keyCountData.reduce((sum, kc) => sum + kc.count, 0)
                const mostUsed = [...keyCountData].sort((a, b) => b.count - a.count)[0]
                const percentage =
                  totalCount > 0 ? ((mostUsed.count / totalCount) * 100).toFixed(1) : '0.0'
                return `${mostUsed.count.toLocaleString()} presses (${percentage}%)`
              })()}
            </p>
          </Card>
          <Card className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">Efficiency Score</h3>
            <p className="text-2xl font-bold text-yellow-600">78%</p>
            <p className="text-xs text-muted-foreground mt-1">
              +12% with suggestions (need to find a way to quantify this metric)
            </p>
          </Card>
        </motion.div>

        {/* Main Content - Keyboard Heatmap with Overlaid Bubbles */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-panel p-6 relative overflow-visible">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Keyboard Heatmap
                </h2>
              </div>
              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Start spinning immediately for visual feedback
                  setIsButtonSpinning(true)
                  fetchKeyFrequencies(true)
                }}
                disabled={isRefreshing || isLoading}
                className="ml-4"
              >
                <motion.div
                  animate={{
                    rotate: isRefreshing || isButtonSpinning ? 360 : 0
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isRefreshing || isButtonSpinning ? Infinity : 0,
                    ease: 'linear'
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>

            {/* Error/Loading State */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            {isLoading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm">
                Loading key frequency data...
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-4">
              {hoveredRemapping
                ? hoveredRemapping.type === 'swap'
                  ? `Previewing swap: ${hoveredRemapping.swapKey1} ↔ ${hoveredRemapping.swapKey2}`
                  : `Previewing: ${hoveredRemapping.fromKey} → ${(hoveredRemapping.toKeys || []).join(' + ')}`
                : 'Hover over a suggestion bubble to preview the remapping'}
            </p>

            {/* Container for keyboard with overlaid bubbles */}
            <div className="relative min-h-[500px] py-8">
              {/* Floating bubbles overlaid on top of keyboard */}
              {suggestedRemappings.map((remapping, index) => (
                <RemappingBubble
                  key={remapping.id}
                  remapping={remapping}
                  index={index}
                  onHover={(): void => setHoveredRemapping(remapping)}
                  onLeave={(): void => setHoveredRemapping(null)}
                  isHovered={hoveredRemapping?.id === remapping.id}
                />
              ))}

              {/* Keyboard component */}
              <div className="relative z-10">
                <KeyboardHeatmap keyCountData={keyCountData} hoveredRemapping={hoveredRemapping} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-200 to-blue-300"></div>
                <span>Low Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-300 to-orange-400"></div>
                <span>Medium Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-red-600"></div>
                <span>High Usage</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4">Top 10 Keys</h3>
            <div className="space-y-2">
              {(() => {
                // Sort by count descending and take top 10
                const topKeys = [...keyCountData].sort((a, b) => b.count - a.count).slice(0, 10)
                // Find the highest count to scale bars relative to the top key
                const maxCount = topKeys.length > 0 ? topKeys[0].count : 1
                return topKeys.map((keyData) => {
                  // Scale bar width relative to the highest count, capped at 100%
                  const barWidth =
                    maxCount > 0 ? Math.min((keyData.count / maxCount) * 100, 100) : 0
                  // Calculate dynamic font size based on key length
                  const keyLength = keyData.key.length
                  const fontSize =
                    keyLength <= 4
                      ? 'text-xs'
                      : keyLength <= 6
                        ? 'text-[10px]'
                        : keyLength <= 8
                          ? 'text-[9px]'
                          : 'text-[8px]'
                  return (
                    <div key={keyData.key} className="flex items-center gap-3">
                      <div className="w-12 h-8 flex items-center justify-center rounded border-2 border-blue-600 text-blue-600 font-mono font-bold bg-white/20 overflow-hidden px-1">
                        <span
                          className={`${fontSize} leading-tight truncate`}
                          style={{ maxWidth: '100%' }}
                        >
                          {keyData.key}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">{keyData.key}</span>
                          <span className="text-xs text-muted-foreground">
                            {keyData.count.toLocaleString()} presses
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </Card>

          <Card className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4">Optimization Tips</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
                <h4 className="font-semibold text-blue-600 mb-1 text-sm">🎯 Home Row Efficiency</h4>
                <p className="text-xs text-muted-foreground">
                  60% of your keystrokes are on the home row. Great job! Consider remapping
                  rarely-used keys to increase this further.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/20">
                <h4 className="font-semibold text-green-600 mb-1 text-sm">⚡ Quick Wins</h4>
                <p className="text-xs text-muted-foreground">
                  Remapping CapsLock to Ctrl could save you ~2 seconds per minute based on your
                  usage patterns.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
                <h4 className="font-semibold text-yellow-600 mb-1 text-sm">📊 Track Progress</h4>
                <p className="text-xs text-muted-foreground">
                  Your typing efficiency has improved 8% this week. Keep up the great work!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Insights
