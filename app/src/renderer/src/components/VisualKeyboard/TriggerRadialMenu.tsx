import React from 'react'
import * as T from '../../../../models/Trigger'
import { getTriggerTypeDisplayName } from '../../../../models/Trigger'
import { getMacroButtonBgT, getTriggerTypeBackground } from './Colors'
import { Card } from '../ui/card'
import { rgba } from 'framer-motion'

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
    <div
      className="fixed inset-0 flex items-center justify-center z-40"
      onClick={handleBackdropClick}
    >
      <div className="relative w-96 h-96">
        {TRIGGER_TYPES.map((triggerType, index) => {
          const angle = (index * angleSlice - 90) * (Math.PI / 180)
          const x = radius * Math.cos(angle)
          const y = radius * Math.sin(angle)

          return (
              <button
                key={triggerType}
                className="absolute w-20 h-20 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors shadow-lg"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  left: '50%',
                  top: '50%',
                  background: getTriggerTypeBackground(triggerType)
                }}
                onClick={(e) => handleItemClick(e, triggerType)}
                title={getTriggerTypeDisplayName(triggerType)}
              >
                <div className="flex flex-col items-center justify-center h-full gap-1 px-2">
                  <span className="text-xs text-center leading-tight">
                    {getTriggerTypeDisplayName(triggerType)}
                  </span>
                </div>
              </button>
          )
        })}

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-indigo-500">
          <span className="text-center text-sm font-semibold text-indigo-600">Add</span>
        </div>
      </div>
    </div>
  )
}
