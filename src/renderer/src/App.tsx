import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import React from 'react'

// Enum to represent different views/screens
enum View {
  HOME = 'HOME',
  NEW_PROFILE = 'NEW_PROFILE',
  ANOTHER_VIEW = 'ANOTHER_VIEW' // Example of additional views
}

type Key = {
  label: string
  code: string // this could be the physical key like 'KeyA', 'Space', etc.
}

const keyboardRows: Key[][] = [
  [
    { label: 'Esc', code: 'Escape' },
    { label: '1', code: 'Digit1' }, { label: '2', code: 'Digit2' }, { label: '3', code: 'Digit3' },
    { label: '4', code: 'Digit4' }, { label: '5', code: 'Digit5' }, { label: '6', code: 'Digit6' },
    { label: '7', code: 'Digit7' }, { label: '8', code: 'Digit8' }, { label: '9', code: 'Digit9' },
    { label: '0', code: 'Digit0' }, { label: '-', code: 'Minus' }, { label: '=', code: 'Equal' },
    { label: 'Backspace', code: 'Backspace' },
  ],
  [
    { label: 'Tab', code: 'Tab' },
    { label: 'Q', code: 'KeyQ' }, { label: 'W', code: 'KeyW' }, { label: 'E', code: 'KeyE' },
    { label: 'R', code: 'KeyR' }, { label: 'T', code: 'KeyT' }, { label: 'Y', code: 'KeyY' },
    { label: 'U', code: 'KeyU' }, { label: 'I', code: 'KeyI' }, { label: 'O', code: 'KeyO' },
    { label: 'P', code: 'KeyP' }, { label: '[', code: 'BracketLeft' }, { label: ']', code: 'BracketRight' },
    { label: '\\', code: 'Backslash' },
  ],
  [
    { label: 'Caps', code: 'CapsLock' },
    { label: 'A', code: 'KeyA' }, { label: 'S', code: 'KeyS' }, { label: 'D', code: 'KeyD' },
    { label: 'F', code: 'KeyF' }, { label: 'G', code: 'KeyG' }, { label: 'H', code: 'KeyH' },
    { label: 'J', code: 'KeyJ' }, { label: 'K', code: 'KeyK' }, { label: 'L', code: 'KeyL' },
    { label: ';', code: 'Semicolon' }, { label: '\'', code: 'Quote' },
    { label: 'Enter', code: 'Enter' },
  ],
  [
    { label: 'Shift', code: 'ShiftLeft' },
    { label: 'Z', code: 'KeyZ' }, { label: 'X', code: 'KeyX' }, { label: 'C', code: 'KeyC' },
    { label: 'V', code: 'KeyV' }, { label: 'B', code: 'KeyB' }, { label: 'N', code: 'KeyN' },
    { label: 'M', code: 'KeyM' }, { label: ',', code: 'Comma' }, { label: '.', code: 'Period' },
    { label: '/', code: 'Slash' },
    { label: 'Shift', code: 'ShiftRight' },
  ],
  [
    { label: 'Ctrl', code: 'ControlLeft' },
    { label: 'Meta', code: 'MetaLeft' },
    { label: 'Alt', code: 'AltLeft' },
    { label: 'Space', code: 'Space' },
    { label: 'Alt', code: 'AltRight' },
    { label: 'Fn', code: 'Fn' }, // Optional
    { label: 'Menu', code: 'ContextMenu' },
    { label: 'Ctrl', code: 'ControlRight' },
  ],
];

const KeyboardRemapper: React.FC = () => {
  const [remappings, setRemappings] = React.useState<Record<string, string>>({})

  return (
    <div className="p-4 bg-gray-900 text-white space-y-2 font-mono">
      {keyboardRows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1 justify-center">
          {row.map((key) => (
            <button
              key={key.code}
              className="bg-gray-700 hover:bg-gray-600 text-sm rounded px-3 py-2 w-fit min-w-[48px]"
              onClick={() => {
                // Do something with key.code
              }}
            >
              {key.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function App(): JSX.Element {
  // State to manage which view to show
  const [currentView, setCurrentView] = React.useState<View>(View.HOME)

  const handleStartDaemon = (): void => {
    // Send an IPC message to the main process to run the daemon start signal
    window.electron.ipcRenderer.send('start-daemon')
  }

  const loadProfile = (): void => {
    // Eventually this will point to a specific .json file or path
    window.electron.ipcRenderer.send('load')
  }

  const createNewProfile = (): void => {
    // Change view to create a new profile
    setCurrentView(View.NEW_PROFILE)
  }

  // Handle going back to the previous screen
  const goHome = (): void => {
    setCurrentView(View.HOME)
  }

  const editProfile = (): void => {
    // Open profile.json and edit
  }

  return (
    // <>
    //   <h1>Clickr</h1>

    //   {/* Call your method when this button is clicked */}
    //   <button onClick={handleStartDaemon}>Start Daemon</button>
    // </>
    <div>
      {currentView === View.HOME && (
        <div>
          <h1>Clickr</h1>
          <button onClick={handleStartDaemon}>Start Daemon</button>
          <button onClick={createNewProfile}>Create New Profile</button>
          <button onClick={loadProfile}>Load e1.json</button>
        </div>
      )}

      {/* New Profile Screen */}
      {currentView === View.NEW_PROFILE && (
        <div>
          <h1>New Profile</h1>
          <h2>Allow a user to create a new profile</h2>
          <KeyboardRemapper />
          <button onClick={goHome}>Home</button>
          <button onClick={goHome}>Save</button>
        </div>
      )}

      {/* Example for another view */}
      {currentView === View.ANOTHER_VIEW && (
        <div>
          <h1>Another View</h1>
          <button onClick={goHome}>Home</button>
        </div>
      )}
    </div>
  )
}

export default App
