import { useEffect, useState } from 'react'
import { KeyPressInfo } from './Model'
import { normalizeKey } from './Util'

export const useKeyboardController = () => {
  const [keyState, setKeyState] = useState<KeyPressInfo>({
    isDown: false,
    key: ''
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return
      }

      setKeyState({
        isDown: true,
        key: normalizeKey(event)
      })

      if (normalizeKey(event) == 'F11') event.preventDefault();
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return
      }

      setKeyState({
        isDown: false,
        key: normalizeKey(event)
      })
    }

    const handleBlur = () => {
      setKeyState({
        isDown: false,
        key: ''
      })
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })
    window.addEventListener('blur', handleBlur, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
      window.removeEventListener('blur', handleBlur, { capture: true })
    }
  }, [])

  return keyState
}
