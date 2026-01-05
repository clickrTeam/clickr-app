import React from 'react'
import { Trigger, TriggerType, AppFocus, TapSequence, KeyPress, KeyRelease, Hold } from '../../../../../models/Trigger'
import { Bind, Macro } from '../../../../../models/Bind'
import { getMacroButtonBgT } from '../Colors'
import profileController from '../ProfileControler'
import { MacroButton } from './MacroButton'

interface LeftoverKeyItemProps {
  trigger: Trigger
  bind: Bind
  onSelect: () => void
}

export const LeftoverKeyItem: React.FC<LeftoverKeyItemProps> = ({ trigger, bind, onSelect }) => {
  const getLabel = (): string => {
    if (trigger instanceof AppFocus) {
      return trigger.app_name
    }
    if (trigger instanceof TapSequence) {
      return trigger.key_time_pairs.map((pair) => pair[0]).join('+')
    }
    if (trigger instanceof KeyPress || trigger instanceof KeyRelease || trigger instanceof Hold) {
      return (trigger as any).value
    }
    return 'Unknown'
  }

  const isKeyedTrigger = trigger instanceof KeyPress || trigger instanceof KeyRelease || trigger instanceof Hold

  if (isKeyedTrigger) {
    return (
      <div aria-label={trigger.trigger_type + ' leftover-item'} className='vk-footer-macro-btn'>
        {getLabel()}
      </div>
    )
  }

  return (
    <MacroButton
      label={getLabel()}
      onClick={onSelect}
      background={getMacroButtonBgT(trigger)}
      className='relative z-10'
    />
  )
}
