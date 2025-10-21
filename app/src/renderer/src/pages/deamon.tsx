import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import log from 'electron-log'
import { toast } from 'sonner'
import { cn } from '@renderer/lib/utils'
import { PowerIcon } from 'lucide-react'

interface DaemonProps {
  refreshActive: boolean
}

const Daemon = ({ refreshActive }: DaemonProps): JSX.Element => {
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

  if (refreshActive) {
    useEffect(() => {
      checkIsRunning()
      const interval = setInterval(checkIsRunning, 10000) // 10 seconds
      return () => clearInterval(interval)
    }, [checkIsRunning])
  }

  // Handlers for run/stop that also update the state
  const handleRunKeybinder = (): void => {
    window.api.runKeybinder().then(() => {
      setTimeout(checkIsRunning, 100)
    })
  }

  const handleStopKeybinder = (): void => {
    window.api.stopKeybinder().then(() => {
      setTimeout(checkIsRunning, 100)
    })
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
        'flex items-center justify-center w-8 h-8 rounded-full',
        'transition-all duration-300 ease-in-out',
        isRunning
          ? 'bg-green-200/30 hover:bg-green-200/50 text-green-700'
          : 'bg-red-200/30 hover:bg-red-200/50 text-red-700',
        'focus:outline-none focus:ring-1 focus:ring-offset-1',
        'shadow-sm hover:shadow-md',
        'opacity-60 hover:opacity-100',
        'border border-opacity-20'
      )}
      onClick={handleToggleKeybinder}
      title={isRunning ? 'Keybinder is Running' : 'Keybinder is Stopped'}
    >
      <PowerIcon
        className={cn(
          'w-5 h-5',
          isRunning ? 'animate-pulse opacity-80' : 'opacity-60'
        )}
      />
    </Button>
  )
}

export default Daemon
