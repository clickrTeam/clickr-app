import { motion } from 'framer-motion'
import { cn } from '@renderer/lib/utils'

interface PositionedKeyProps {
  letter: string
  color: string
  className?: string
  delay?: number
  finalX: number
  index: number
  totalLetters: number
}

const keyColors = {
  red: 'border-clickr-red text-clickr-red',
  blue: 'border-clickr-blue text-clickr-blue',
  green: 'border-clickr-green text-clickr-green',
  yellow: 'border-clickr-yellow text-clickr-yellow',
  purple: 'border-clickr-purple text-clickr-purple',
  orange: 'border-clickr-orange text-clickr-orange'
}

const PositionedKey: React.FC<PositionedKeyProps> = ({
  letter,
  color,
  className,
  delay = 0,
  finalX,
  index,
  totalLetters
}) => {
  // Calculate random starting position (far away from final position)
  const randomStartX = (Math.random() * 2 - 1) * 100
  const randomStartY = (Math.random() * 2 - 1) * 300 - 300 // -500 to -100 (above)

  // Calculate ripple delay based on letter position
  const rippleDelay = index * 0.08 // Each letter's ripple starts 0.08s after the previous

  return (
    <motion.div
      className={cn(
        'absolute w-16 h-16 flex items-center justify-center rounded-md border-2 bg-white/20 backdrop-blur-sm shadow-md select-none',
        'left-1/2 top-0',
        keyColors[color as keyof typeof keyColors],
        className
      )}
      initial="hidden"
      animate={{
        opacity: 1,
        x: [finalX, finalX + 5, finalX - 3, finalX],
        y: 0,
        rotate: 0,
        scale: 1
      }}
      variants={{
        hidden: {
          opacity: 0,
          x: randomStartX,
          y: randomStartY,
          rotate: Math.random() * 60 - 30,
          scale: 0.8
        }
      }}
      transition={{
        x: {
          delay: 4 + rippleDelay,
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.4, 0.7, 1],
          repeat: Infinity,
          repeatDelay: 3 + totalLetters * 0.08
        },
        opacity: {
          type: 'spring',
          stiffness: 70,
          damping: 4,
          delay: delay,
          duration: 1.5
        },
        y: {
          type: 'spring',
          stiffness: 70,
          damping: 8,
          delay: delay,
          duration: 1.5
        },
        rotate: {
          type: 'spring',
          stiffness: 70,
          damping: 4,
          delay: delay,
          duration: 1.5
        },
        scale: {
          type: 'spring',
          stiffness: 70,
          damping: 4,
          delay: delay,
          duration: 1.5
        }
      }}
    >
      <span className="font-mono font-bold text-2xl">{letter}</span>
    </motion.div>
  )
}

interface PositionedKeysProps {
  text: string
  className?: string
  colors?: string[]
}

const PositionedKeys: React.FC<PositionedKeysProps> = ({
  text,
  className,
  colors = ['blue', 'green', 'yellow', 'red', 'purple', 'orange']
}) => {
  const letters = text.split('')
  const spacing = 70
  const totalWidth = letters.length * spacing

  return (
    <div className={cn('relative h-20 w-full flex justify-center', className)}>
      <div
        className="relative h-full mx-auto flex justify-center"
        style={{ width: `${totalWidth}px` }}
      >
        {letters.map((letter, index) => {
          // Calculate the final X position with increased spacing
          const finalX = (index - (letters.length - 1) / 2) * spacing

          // Cycle through colors
          const color = colors[index % colors.length]

          return (
            <PositionedKey
              key={index}
              letter={letter}
              color={color}
              delay={index * 0.2} // Stagger the entrance
              finalX={finalX}
              index={index}
              totalLetters={letters.length}
            />
          )
        })}
      </div>
    </div>
  )
}

export default PositionedKeys

