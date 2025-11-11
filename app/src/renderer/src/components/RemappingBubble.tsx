import { motion } from 'framer-motion'
import { SuggestedRemapping } from '../pages/Insights'

interface RemappingBubbleProps {
  remapping: SuggestedRemapping
  index: number
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
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
  { bottom: '15%', left: '5%', delay: 3 }, // Bottom-left (red)
  { bottom: '5%', left: '40%', delay: 2 }, // Bottom-middle
  { bottom: '12%', right: '10%', delay: 1 } // Bottom-right (green)
]

const RemappingBubble = ({
  remapping,
  index,
  onHover,
  onLeave,
  isHovered
}: RemappingBubbleProps): JSX.Element => {
  const position = bubblePositions[index % bubblePositions.length]

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
      whileHover={{
        scale: 1.08,
        y: -5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        filter: 'brightness(1.05)',
        zIndex: 30,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
    >
      {remapping.type === 'swap'
        ? `${remapping.swapKey1} ↔ ${remapping.swapKey2}`
        : `${remapping.fromKey} → ${remapping.toKey}`}
    </motion.div>
  )
}

export default RemappingBubble
