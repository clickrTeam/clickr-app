import { motion } from 'framer-motion'
import { SuggestedRemapping } from '../pages/Insights'
import { useNavigate } from 'react-router-dom'

interface RemappingBubbleProps {
  remapping: SuggestedRemapping
  index: number
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
  allRecommendations?: SuggestedRemapping[]
}

// Helper function to get destination keys array from SuggestedRemapping
// Recommended max: 10 keys per mapping
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

// Positions for floating bubbles around the keyboard
const bubblePositions = [
  { top: '-5%', left: '10%', delay: 0 }, // Top-left (blue)
  { top: '-10%', left: '45%', delay: 1 }, // Top-middle
  { top: '-5%', right: '8%', delay: 2 }, // Top-right (yellow/orange)
  { bottom: '8%', left: '5%', delay: 3 }, // Bottom-left (red)
  { bottom: '3%', left: '40%', delay: 2 }, // Bottom-middle
  { bottom: '10%', right: '10%', delay: 1 } // Bottom-right (green)
]

const RemappingBubble = ({
  remapping,
  index,
  onHover,
  onLeave,
  isHovered,
  allRecommendations = []
}: RemappingBubbleProps): JSX.Element => {
  const position = bubblePositions[index % bubblePositions.length]
  const navigate = useNavigate()

  const handleClick = async (): Promise<void> => {
    if (allRecommendations.length > 0) {
      // Save to main process storage so recommendations persist
      await window.api.saveRecommendations(allRecommendations)
      await window.api.saveSelectedRecommendationId(remapping.id)
    }
    // Navigate to mappings page with state indicating we came from Insights
    // This will trigger a toast asking user to pick which mapping to modify
    navigate('/mappings', { state: { fromInsights: true } })
  }

  // Floating animation
  const bubbleVariants = {
    float: {
      y: [-5, -15, -5],
      x: [0, 5, -5, 0],
      transition: {
        duration: 4,
        delay: position.delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <motion.div
      className={`absolute z-20 px-5 py-3 rounded-lg shadow-md cursor-pointer text-sm font-semibold border-2 bg-white/80 ${keyColors[remapping.color]} backdrop-blur-sm`}
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        right: position.right
      }}
      animate={isHovered ? { x: 0, y: 0 } : 'float'}
      variants={bubbleVariants}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={handleClick}
      whileHover={{
        scale: 1.08,
        y: -5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        filter: 'brightness(1.05)',
        zIndex: 30,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {remapping.type === 'swap'
        ? `${remapping.swapKey1} ↔ ${remapping.swapKey2}`
        : `${remapping.fromKey} → ${getDestinationKeys(remapping).join(' + ')}`}
    </motion.div>
  )
}

export default RemappingBubble
