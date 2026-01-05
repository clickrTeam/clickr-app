import React from 'react'
import { Input } from '../../ui/input'
import { Trigger, TriggerType, Hold, TapSequence, AppFocus } from '../../../../../models/Trigger'
import { Macro } from '../../../../../models/Bind'
import profileController from '../ProfileControler'

interface TriggerEditorProps {
  trigger: Trigger
  selectedKey: string | null
  currentBinds: Macro
  onAddKeyClick: () => void
}

export const TriggerEditor: React.FC<TriggerEditorProps> = ({
  trigger,
  selectedKey,
  currentBinds,
  onAddKeyClick
}) => {
  if (selectedKey) {
    return (
      <div aria-label='keyed-trigger-hold'>
        {trigger.trigger_type === TriggerType.Hold && (
          <div aria-label='Hold'>
            <Input
              type="number"
              placeholder="Time (ms)"
              min={0}
              onChange={(e) => {
                profileController.currentTrigger = new Hold((trigger as Hold).value, parseInt(e.target.value))
                e.stopPropagation()
              }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div aria-label='keyless-trigger-editor'>
      {trigger.trigger_type === TriggerType.TapSequence && (
        <div aria-label='TapSequence' className='flex gap-4'>
          {(trigger as TapSequence).key_time_pairs.map((key_time_pair) => (
            <div key={key_time_pair[0]}>
              <div className='vk-footer-macro-btn relative z-10'>
                {key_time_pair[0]}
              </div>
            </div>
          ))}
          <button
            className="vk-footer-macro-btn"
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              padding: '0 0.7rem',
              marginLeft: currentBinds.binds.length > 0 ? 8 : 0
            }}
            onClick={onAddKeyClick}
          >
            +
          </button>
        </div>
      )}

      {trigger.trigger_type === TriggerType.AppFocused && (
        <div aria-label='AppFocused' className='flex'>
          <span
            className="vk-footer-selected-label"
            title='When this application is focused, or tab is selected.'
            style={{ minWidth: '112px' }}
          >
            On app focus:
          </span>
          <Input
            placeholder={(trigger as AppFocus).app_name}
            onChange={(e) => {
              const appFocus = trigger as AppFocus
              profileController.currentTrigger = new AppFocus(e.target.value, appFocus.id)
              e.stopPropagation()
            }}
          />
        </div>
      )}
    </div>
  )
}
