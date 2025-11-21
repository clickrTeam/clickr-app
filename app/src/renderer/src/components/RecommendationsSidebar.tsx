import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { SuggestedRemapping } from '../pages/Insights'
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react'
import { Button } from './ui/button'

interface RecommendationsSidebarProps {
  recommendations: SuggestedRemapping[]
  selectedRecommendationId?: string | null
  isOpen: boolean
  onToggle: () => void
  onHover: (remapping: SuggestedRemapping | null) => void
  onLeave: () => void
  onDelete: (remappingId: string) => void
}

// Helper function to get destination keys array from SuggestedRemapping
const getDestinationKeys = (remapping: SuggestedRemapping): string[] => {
  if (remapping.type === 'swap') return []
  return remapping.toKeys || []
}

const keyColors = {
  red: 'border-red-400 text-red-600',
  blue: 'border-blue-400 text-blue-600',
  green: 'border-green-400 text-green-600',
  yellow: 'border-yellow-400 text-yellow-600',
  purple: 'border-purple-400 text-purple-600',
  orange: 'border-orange-400 text-orange-600'
}

export const RecommendationsSidebar = ({
  recommendations,
  selectedRecommendationId,
  isOpen,
  onToggle,
  onHover,
  onLeave,
  onDelete
}: RecommendationsSidebarProps): JSX.Element => {
  // Clear hover state when recommendations become empty
  useEffect(() => {
    if (recommendations.length === 0) {
      onLeave()
    }
  }, [recommendations.length, onLeave])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-20 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recommendations</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Apply a recommendation manually, then remove it to see the next suggestion.
            </p>

            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((remapping) => {
                  const isSelected = remapping.id === selectedRecommendationId
                  const baseClasses = 'backdrop-blur-sm rounded-lg p-3 cursor-pointer transition-all'
                  
                  if (isSelected) {
                    return (
                      <motion.div
                        key={remapping.id}
                        className="p-[2px] rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 shadow-lg shadow-blue-500/50"
                        onMouseEnter={() => onHover(remapping)}
                        onMouseLeave={onLeave}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          filter: 'brightness(1.05)',
                          transition: { duration: 0.15, ease: 'easeOut' }
                        }}
                        transition={{ duration: 0.1, ease: 'easeIn' }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                      >
                        <div
                          className={`${baseClasses} bg-white/80 border-0`}
                        >
                          <div className="font-semibold text-sm mb-1">
                            {remapping.type === 'swap'
                              ? `${remapping.swapKey1} ↔ ${remapping.swapKey2}`
                              : `${remapping.fromKey} → ${getDestinationKeys(remapping).join(' + ')}`}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {remapping.reason}
                          </div>
                          {remapping.potentialSavings > 0 && (
                            <div className="text-xs text-green-600 font-medium mb-2">
                              Potential savings: {remapping.potentialSavings.toFixed(2)}x
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(remapping.id)
                              }}
                              className="w-full h-7 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Applied/Remove
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }

                  return (
                    <motion.div
                      key={remapping.id}
                      className={`${baseClasses} border-2 ${keyColors[remapping.color]} bg-white/80`}
                      onMouseEnter={() => onHover(remapping)}
                      onMouseLeave={onLeave}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        filter: 'brightness(1.05)',
                        transition: { duration: 0.15, ease: 'easeOut' }
                      }}
                      transition={{ duration: 0.1, ease: 'easeIn' }}
                      whileTap={{
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                    >
                    <div className="font-semibold text-sm mb-1">
                      {remapping.type === 'swap'
                        ? `${remapping.swapKey1} ↔ ${remapping.swapKey2}`
                        : `${remapping.fromKey} → ${getDestinationKeys(remapping).join(' + ')}`}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {remapping.reason}
                    </div>
                    {remapping.potentialSavings > 0 && (
                      <div className="text-xs text-green-600 font-medium mb-2">
                        Potential savings: {remapping.potentialSavings.toFixed(2)}x
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(remapping.id)
                        }}
                        className="w-full h-7 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Applied/Remove
                      </Button>
                    </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mb-4 opacity-50" />
                <p className="text-gray-600 text-sm">
                  No recommendations exist yet.
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Visit Insights to get recommendations.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 380, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-20 z-50"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="rounded-l-lg rounded-r-none shadow-lg h-12"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-2 text-xs">Recommendations</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

