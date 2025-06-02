import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'

const Daemon = (): JSX.Element => {
  const [isRunning, setIsRunning] = useState<boolean>(false)

  // Function to update isRunning state
  const checkIsRunning = useCallback(() => {
    window.api.isKeybinderRunning().then((isRun: boolean) => {
      setIsRunning(isRun)
      if (isRun) {
        console.log('Keybinder is running')
      } else {
        console.log('Keybinder is not running')
      }
    })
  }, [])

  // Handlers for run/stop that also update the state
  const handleRunKeybinder = (): void => {
    window.api.runKeybinder().then(checkIsRunning)
  }

  const handleStopKeybinder = (): void => {
    window.api.stopKeybinder().then(checkIsRunning)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">DEAMON Mappings</h1>
          <p className="text-xl text-muted-foreground mb-8">Control your keybinder.</p>

          <div className="flex flex-wrap gap-2 justify-center mb-8 items-center">
            {/* Green bubble indicator */}
            <span
              className={`inline-block w-4 h-4 rounded-full border-2 border-gray-300 mr-2 ${
                isRunning ? 'bg-green-500' : 'bg-gray-300'
              }`}
              title={isRunning ? 'Keybinder is running' : 'Keybinder is not running'}
            ></span>
            <Button id="is-running-button" key="isRun" size="sm" onClick={checkIsRunning}>
              isRun
            </Button>
            <Button key="runKeybinder" size="sm" onClick={handleRunKeybinder}>
              runKeybinder
            </Button>
            <Button key="stopKeybinder" size="sm" onClick={handleStopKeybinder}>
              stopKeybinder
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Daemon
