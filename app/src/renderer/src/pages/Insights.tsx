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
  fromKey: string
  toKey: string
  reason: string
  potentialSavings: number
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
}

function Insights(): JSX.Element {
  // Mock data - can be connected to daemon/API later
  const [keyCountData] = useState<KeyCount[]>([
    { key: 'E', count: 1520, percentage: 12.5 },
    { key: 'T', count: 1180, percentage: 9.7 },
    { key: 'A', count: 1050, percentage: 8.6 },
    { key: 'O', count: 980, percentage: 8.0 },
    { key: 'I', count: 920, percentage: 7.5 },
    { key: 'N', count: 880, percentage: 7.2 },
    { key: 'S', count: 840, percentage: 6.9 },
    { key: 'R', count: 780, percentage: 6.4 },
    { key: 'H', count: 720, percentage: 5.9 },
    { key: 'CapsLock', count: 45, percentage: 0.37 },
    { key: 'Fn', count: 12, percentage: 0.1 },
    { key: 'Esc', count: 156, percentage: 1.3 },
    { key: 'Backspace', count: 645, percentage: 5.3 }
  ])

  const [suggestedRemappings] = useState<SuggestedRemapping[]>([
    {
      id: '1',
      fromKey: 'CapsLock',
      toKey: 'Ctrl',
      reason: 'CapsLock is rarely used. Ctrl is frequently needed.',
      potentialSavings: 2.5,
      color: 'blue'
    },
    {
      id: '2',
      fromKey: 'Fn',
      toKey: 'Esc',
      reason: 'Easy access to Escape for quick exits.',
      potentialSavings: 1.8,
      color: 'red'
    },
    {
      id: '3',
      fromKey: 'AltLeft',
      toKey: 'Command',
      reason: 'Optimize for Mac-style shortcuts.',
      potentialSavings: 3.2,
      color: 'yellow'
    },
    {
      id: '4',
      fromKey: 'ShiftRight',
      toKey: 'Backspace',
      reason: 'Right shift is underused, backspace is high-traffic.',
      potentialSavings: 4.1,
      color: 'green'
    }
  ])

  const [hoveredRemapping, setHoveredRemapping] = useState<SuggestedRemapping | null>(null)

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-background to-secondary/20">
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
          <Card className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Total Keys Pressed
            </h3>
            <p className="text-3xl font-bold text-blue-600">12,183</p>
            <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
          </Card>
          <Card className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Most Used Key</h3>
            <p className="text-3xl font-bold text-green-600">E</p>
            <p className="text-xs text-muted-foreground mt-2">1,520 presses (12.5%)</p>
          </Card>
          <Card className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Efficiency Score
            </h3>
            <p className="text-3xl font-bold text-yellow-600">78%</p>
            <p className="text-xs text-muted-foreground mt-2">+12% with suggestions</p>
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
                ? `Previewing: ${hoveredRemapping.fromKey} → ${hoveredRemapping.toKey}`
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
                      <span className="text-xs text-muted-foreground">
                        {keyData.count} presses
                      </span>
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

