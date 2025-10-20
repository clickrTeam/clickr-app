import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import log from 'electron-log'
import { toast } from 'sonner'
import { cn } from '@renderer/lib/utils'
import { PowerIcon } from 'lucide-react'

const Daemon = (): JSX.Element => {
  const [isRunning, setIsRunning] = useState<boolean>(false)

  // Function to update isRunning state
  const checkIsRunning = useCallback(() => {
    window.api.isKeybinderRunning().then((isRun: boolean) => {
      setIsRunning(isRun)
      if (isRun) {
        log.info('Keybinder is running, click to stop it.')
      } else {
        if (process.env.NODE_ENV === 'production') toast.warning('Keybinder is not running')
        log.info('Keybinder is not running, click to start it.')
      }
    })
  }, [])

  useEffect(() => {
    checkIsRunning()
    const interval = setInterval(checkIsRunning, 10000) // 10 seconds
    return () => clearInterval(interval)
  }, [checkIsRunning])

  // Handlers for run/stop that also update the state
  const handleRunKeybinder = (): void => {
    window.api.runKeybinder().then(checkIsRunning)
  }

  const handleStopKeybinder = (): void => {
    window.api.stopKeybinder().then(checkIsRunning)
  }
  const handleToggleKeybinder = (): void => {
    if (isRunning) {
      handleStopKeybinder()
    } else {
      handleRunKeybinder()
    }
  }

  return (
  <Button
    className={cn(
      'flex items-center justify-center w-10 h-10 rounded-full', // Compact power button styling
      'transition-all duration-300 ease-in-out', // Smooth transition
      isRunning
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white',
      'focus:outline-none focus:ring-2 focus:ring-offset-2', // Accessibility improvements
      'shadow-md hover:shadow-lg' // Subtle depth effect
    )}
    onClick={handleToggleKeybinder}
    title={isRunning ? 'Keybinder is Running' : 'Keybinder is Stopped'}
  >
    <PowerIcon
      className={cn(
        'w-6 h-6',
        isRunning ? 'animate-pulse' : '' // Optional pulse animation when running
      )}
    />
  </Button>
  )
}

export default Daemon
