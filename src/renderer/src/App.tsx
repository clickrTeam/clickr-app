import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { Profile } from '../../models/Profile'
import React from 'react'

// Enum to represent different views/screens
enum View {
  HOME = 'HOME',
  NEW_PROFILE = 'NEW_PROFILE',
  ANOTHER_VIEW = 'ANOTHER_VIEW' // Example of additional views
}

// Define type for the Profile JSON that matches Profile.toJSON()
interface ProfileJSON {
  profile_name: string
  layer_count: number
  layers: object[]
}

function App(): JSX.Element {
  // State to manage which view to show
  const [currentView, setCurrentView] = React.useState<View>(View.HOME)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [profileName, setProfileName] = React.useState<string>('')

  // Get the profile from the main process when the component mounts.
  React.useEffect(() => {
    window.electronAPI.getProfile().then((profileJSON: ProfileJSON) => {
      // Convert JSON back to a Profile instance using your fromJSON() helper.
      const prof = Profile.fromJSON(profileJSON)
      setProfile(prof)
      setProfileName(prof.profile_name)
    })
  }, [])

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
    window.electron.ipcRenderer.send('create-new-profile')
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
          {/*<KeyboardRemapper /> TODO: Rework this*/}
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
