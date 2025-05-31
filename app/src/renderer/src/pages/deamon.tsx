import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { ipcRenderer } from 'electron'

const Daemon = (): JSX.Element => {
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

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button
              id="is-running-button"
              key="isRun"
              size="sm"
              // onClick={() =>
              //   isKeybinderRunning().then((isRun) => {
              //     if (isRun) {
              //       console.log('Keybinder is running')
              //     } else {
              //       console.log('Keybinder is running')
              //     }
              //   })
              // }
            >
              isRun
            </Button>
            <Button key="runKeybinder" size="sm" onClick={() => runKeybinder()}>
              runKeybinder
            </Button>
            <Button key="stopKeybinder" size="sm" onClick={() => stopKeybinder()}>
              stopKeybinder
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Daemon
