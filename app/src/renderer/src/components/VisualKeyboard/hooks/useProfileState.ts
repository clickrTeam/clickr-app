import { useEffect, useState } from 'react'
import { Macro, Bind } from '../../../../../models/Bind'
import { Trigger } from '../../../../../models/Trigger'
import profileController from '../ProfileControler'

export function useProfileState() {
  const [currentBinds, setCurrentBinds] = useState<Macro>(profileController.currentBinds)
  const [currentTrigger, setCurrentTrigger] = useState<Trigger>(profileController.currentTrigger)

  useEffect(() => {
    const cleanup = profileController.addStateChangeListener((binds, trigger) => {
      setCurrentBinds(binds)
      setCurrentTrigger(trigger)
    })
    return cleanup
  }, [])

  return { currentBinds, currentTrigger }
}
