import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as T from '../../../../models/Trigger'
import { getTriggerTypeDescription, getTriggerTypeDisplayName } from '../../../../models/Trigger'
import { getTriggerTypeBackground } from './Colors'

interface TriggerRadialMenuProps {
  isOpen: boolean
  onSelectTrigger: (triggerType: T.TriggerType) => void
  onClose: () => void
}

const TRIGGER_TYPES = Object.values(T.TriggerType)

export const TriggerRadialMenu: React.FC<TriggerRadialMenuProps> = ({
  isOpen,
  onSelectTrigger,
  onClose
}) => {
  if (!isOpen) return null

  const itemCount = TRIGGER_TYPES.length
  const angleSlice = 360 / itemCount
  const radius = 120

  const handleBackdropClick = () => {
    onClose()
  }

  const handleItemClick = (e: React.MouseEvent, triggerType: T.TriggerType) => {
    e.stopPropagation()
    onSelectTrigger(triggerType)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-40"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-96 h-96"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
          >
            {TRIGGER_TYPES.map((triggerType, index) => {
              const angle = (index * angleSlice - 90) * (Math.PI / 180)
              const x = radius * Math.cos(angle)
              const y = radius * Math.sin(angle)

              return (
                <motion.button
                  key={triggerType}
                  className="absolute w-20 h-20 rounded-lg text-white font-semibold text-sm shadow-lg"
                  style={{
                    left: '45%',
                    top: '220px',
                    background: getTriggerTypeBackground(triggerType)
                  }}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, x, y }}
                  exit={{ opacity: 0, x: 0, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleItemClick(e, triggerType)}
                  title={getTriggerTypeDescription(triggerType)}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-1 px-2">
                    <span className="text-xs text-center leading-tight">
                      {getTriggerTypeDisplayName(triggerType)}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
