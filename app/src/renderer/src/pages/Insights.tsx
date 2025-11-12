import { useState } from 'react'
import { motion } from 'framer-motion'
import KeyboardHeatmap from '../components/KeyboardHeatmap'
import RemappingBubble from '../components/RemappingBubble'
import { Card } from '../components/ui/card'

// Data interfaces
export interface KeyCount {
  key: string
  count: number
  percentage: number
}

export interface SuggestedRemapping {
  id: string
  type: 'mapping' | 'swap'
  fromKey?: string // Used for 'mapping' type (fromKey → toKey)
  toKey?: string // Used for 'mapping' type (fromKey → toKey)
  swapKey1?: string // Used for 'swap' type (swapKey1 ↔ swapKey2)
  swapKey2?: string // Used for 'swap' type (swapKey1 ↔ swapKey2)
  reason: string
  potentialSavings: number
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
}

function Insights(): JSX.Element {
  // Mock data - can be connected to daemon/API later
  // Realistic data based on English letter frequency and typical usage patterns
  // Total: ~50,000 key presses
  const [keyCountData] = useState<KeyCount[]>([
    // Most common letters (English frequency distribution)
    { key: 'E', count: 6350, percentage: 12.7 },
    { key: 'T', count: 4550, percentage: 9.1 },
    { key: 'A', count: 4100, percentage: 8.2 },
    { key: 'O', count: 3750, percentage: 7.5 },
    { key: 'I', count: 3500, percentage: 7.0 },
    { key: 'N', count: 3350, percentage: 6.7 },
    { key: 'S', count: 3150, percentage: 6.3 },
    { key: 'R', count: 3000, percentage: 6.0 },
    { key: 'H', count: 3050, percentage: 6.1 },
    { key: 'D', count: 2150, percentage: 4.3 },
    { key: 'L', count: 2000, percentage: 4.0 },
    { key: 'U', count: 1400, percentage: 2.8 },
    { key: 'C', count: 1400, percentage: 2.8 },
    { key: 'M', count: 1200, percentage: 2.4 },
    { key: 'W', count: 1200, percentage: 2.4 },
    { key: 'F', count: 1100, percentage: 2.2 },
    { key: 'G', count: 1000, percentage: 2.0 },
    { key: 'Y', count: 1000, percentage: 2.0 },
    { key: 'P', count: 950, percentage: 1.9 },
    { key: 'B', count: 750, percentage: 1.5 },
    { key: 'V', count: 500, percentage: 1.0 },
    { key: 'K', count: 400, percentage: 0.8 },
    { key: 'J', count: 75, percentage: 0.15 },
    { key: 'X', count: 75, percentage: 0.15 },
    { key: 'Q', count: 50, percentage: 0.1 },
    { key: 'Z', count: 35, percentage: 0.07 },
    // Numbers (0-9)
    { key: '1', count: 800, percentage: 1.6 },
    { key: '2', count: 750, percentage: 1.5 },
    { key: '3', count: 700, percentage: 1.4 },
    { key: '4', count: 650, percentage: 1.3 },
    { key: '5', count: 600, percentage: 1.2 },
    { key: '6', count: 550, percentage: 1.1 },
    { key: '7', count: 500, percentage: 1.0 },
    { key: '8', count: 450, percentage: 0.9 },
    { key: '9', count: 400, percentage: 0.8 },
    { key: '0', count: 350, percentage: 0.7 },
    // High-frequency special keys
    { key: 'Space', count: 8500, percentage: 17.0 },
    { key: 'Enter', count: 2200, percentage: 4.4 },
    { key: 'Backspace', count: 1800, percentage: 3.6 },
    { key: 'ShiftLeft', count: 3200, percentage: 6.4 },
    { key: 'ShiftRight', count: 800, percentage: 1.6 },
    { key: 'Tab', count: 1200, percentage: 2.4 },
    // Modifiers
    { key: 'CtrlLeft', count: 1500, percentage: 3.0 },
    { key: 'CtrlRight', count: 200, percentage: 0.4 },
    { key: 'AltLeft', count: 800, percentage: 1.6 },
    { key: 'AltRight', count: 150, percentage: 0.3 },
    { key: 'Win', count: 600, percentage: 1.2 },
    // Common punctuation
    { key: '.', count: 1200, percentage: 2.4 },
    { key: ',', count: 1000, percentage: 2.0 },
    { key: "'", count: 600, percentage: 1.2 },
    { key: ';', count: 400, percentage: 0.8 },
    { key: '/', count: 500, percentage: 1.0 },
    { key: '-', count: 450, percentage: 0.9 },
    { key: '=', count: 200, percentage: 0.4 },
    { key: '[', count: 150, percentage: 0.3 },
    { key: ']', count: 150, percentage: 0.3 },
    { key: '\\', count: 100, percentage: 0.2 },
    { key: '`', count: 80, percentage: 0.16 },
    // Navigation keys
    { key: 'Up', count: 450, percentage: 0.9 },
    { key: 'Down', count: 500, percentage: 1.0 },
    { key: 'Left', count: 400, percentage: 0.8 },
    { key: 'Right', count: 450, percentage: 0.9 },
    { key: 'Home', count: 200, percentage: 0.4 },
    { key: 'End', count: 180, percentage: 0.36 },
    { key: 'PageUp', count: 150, percentage: 0.3 },
    { key: 'PageDown', count: 150, percentage: 0.3 },
    { key: 'Delete', count: 350, percentage: 0.7 },
    { key: 'Insert', count: 50, percentage: 0.1 },
    // Function keys (low usage)
    { key: 'F1', count: 120, percentage: 0.24 },
    { key: 'F2', count: 100, percentage: 0.2 },
    { key: 'F3', count: 90, percentage: 0.18 },
    { key: 'F4', count: 80, percentage: 0.16 },
    { key: 'F5', count: 200, percentage: 0.4 },
    { key: 'F6', count: 70, percentage: 0.14 },
    { key: 'F7', count: 60, percentage: 0.12 },
    { key: 'F8', count: 50, percentage: 0.1 },
    { key: 'F9', count: 40, percentage: 0.08 },
    { key: 'F10', count: 180, percentage: 0.36 },
    { key: 'F11', count: 300, percentage: 0.6 },
    { key: 'F12', count: 250, percentage: 0.5 },
    // Rarely used keys
    { key: 'Esc', count: 400, percentage: 0.8 },
    { key: 'CapsLock', count: 25, percentage: 0.05 },
    { key: 'Fn', count: 15, percentage: 0.03 },
    { key: 'Menu', count: 30, percentage: 0.06 },
    { key: 'PrintScreen', count: 20, percentage: 0.04 },
    { key: 'ScrollLock', count: 5, percentage: 0.01 },
    { key: 'Pause', count: 8, percentage: 0.016 },
    // Numpad (moderate usage)
    { key: 'Numpad0', count: 300, percentage: 0.6 },
    { key: 'Numpad1', count: 250, percentage: 0.5 },
    { key: 'Numpad2', count: 250, percentage: 0.5 },
    { key: 'Numpad3', count: 200, percentage: 0.4 },
    { key: 'Numpad4', count: 200, percentage: 0.4 },
    { key: 'Numpad5', count: 180, percentage: 0.36 },
    { key: 'Numpad6', count: 180, percentage: 0.36 },
    { key: 'Numpad7', count: 150, percentage: 0.3 },
    { key: 'Numpad8', count: 150, percentage: 0.3 },
    { key: 'Numpad9', count: 120, percentage: 0.24 },
    { key: 'NumpadAdd', count: 100, percentage: 0.2 },
    { key: 'NumpadSubtract', count: 80, percentage: 0.16 },
    { key: 'NumpadMultiply', count: 60, percentage: 0.12 },
    { key: 'NumpadDivide', count: 50, percentage: 0.1 },
    { key: 'NumpadDecimal', count: 90, percentage: 0.18 },
    { key: 'NumpadEnter', count: 120, percentage: 0.24 },
    { key: 'NumLock', count: 10, percentage: 0.02 }
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
      toKey: 'Esc',
      reason: 'Easy access to Escape for quick exits.',
      potentialSavings: 1.8,
      color: 'red'
    },
    {
      id: '5',
      type: 'mapping',
      fromKey: 'AltLeft',
      toKey: 'CtrlLeft + C',
      reason: 'Left Alt is rarely used, Left Ctrl is frequently used.',
      potentialSavings: 3.2,
      color: 'yellow'
    },
    {
      id: '6',
      type: 'mapping',
      fromKey: 'Menu',
      toKey: 'VolumeUp',
      reason: 'Menu key is underused, VolumeUp is frequently used.',
      potentialSavings: 2.8,
      color: 'purple'
    }
  ])

  const [hoveredRemapping, setHoveredRemapping] = useState<SuggestedRemapping | null>(null)

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
            <p className="text-2xl font-bold text-blue-600">50,000</p>
            <p className="text-xs text-muted-foreground mt-1">13% more than average</p>
          </Card>
          <Card className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">Most Used Key</h3>
            <p className="text-2xl font-bold text-green-600">Space</p>
            <p className="text-xs text-muted-foreground mt-1">8,500 presses (17.0%)</p>
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
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Keyboard Heatmap
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {hoveredRemapping
                ? hoveredRemapping.type === 'swap'
                  ? `Previewing swap: ${hoveredRemapping.swapKey1} ↔ ${hoveredRemapping.swapKey2}`
                  : `Previewing: ${hoveredRemapping.fromKey} → ${hoveredRemapping.toKey}`
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
              {keyCountData.slice(0, 10).map((keyData) => (
                <div key={keyData.key} className="flex items-center gap-3">
                  <div className="w-12 h-8 flex items-center justify-center rounded border-2 border-blue-600 text-blue-600 font-mono font-bold bg-white/20 text-sm">
                    {keyData.key.length > 4 ? keyData.key.slice(0, 4) : keyData.key}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">{keyData.key}</span>
                      <span className="text-xs text-muted-foreground">{keyData.count} presses</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${keyData.percentage * 8}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
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
