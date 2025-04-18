import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { Profile } from '../../models/Profile'
import React from 'react'

// Enum to represent different views/screens
enum View {
  HOME = 'HOME',
  CURRENT_PROFILE = 'CURRENT_PROFILE',
  ANOTHER_VIEW = 'ANOTHER_VIEW' // Example of additional views
}

// Define type for the Profile JSON that matches Profile.toJSON()
interface ProfileJSON {
  profile_name: string
  layer_count: number
  layers: object[]
}

let active_profile: Profile | null = null

function App(): JSX.Element {
  // State to manage which view to show
  const [currentView, setCurrentView] = React.useState<View>(View.HOME)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [profileName, setProfileName] = React.useState<string>('')
  console.log('electronAPI:', window.electronAPI) //debug

  // Get the profile from the main process when the component mounts. TODO: This bit of code causes none of the gui to load
  React.useEffect(() => {
    console.log('[App] useEffect running')
    console.log('window.api:', window.api)

    window.api
      .getProfile()
      .then((profileJSON: ProfileJSON) => {
        console.log('Got profile:', profileJSON)
        const parsed_profile = Profile.fromJSON(profileJSON)
        setProfile(parsed_profile)
        setProfileName(parsed_profile.profile_name)
      })
      .catch((err) => {
        console.error('Failed to fetch profile:', err)
      })
  }, [])

  /**
   * Send an IPC message to the main process to run the daemon start signal. 
   * Will be depreceated once daemon runs on machine boot
   */
  const handleStartDaemon = (): void => {
    window.electron.ipcRenderer.send('start-daemon')
  }

  /**
   * Loads a profile.json from a specific path.
   * @param file_path The path where the desired json is
   */
  const loadProfile = (file_path: string): void => {
    // TODO: Implement logic
    window.electron.ipcRenderer.send('load')
  }

  const transmitProfile = (): void => {
    window.electron.ipcRenderer.send('send-prof-to-daemon')
  }
  /**
   * Sends an IPC message to the main process to create a new profile
   */
  const createNewProfile = (): void => {
    window.electron.ipcRenderer.send('create-new-profile')
  }

  /**
   * Changes the view to show the current profile. NOTE: Almost certainly will change when GUI is updated.
   */
  const seeCurrentProfile = (): void => {
    setCurrentView(View.CURRENT_PROFILE)
  }

  /**
   * Returns to the 'home' screen on the application. NOTE: Almost certainly will change when GUI is updated.
   */
  const goHome = (): void => {
    setCurrentView(View.HOME)
  }

  /**
   * Sends an IPC message to the main process to save the current profile into a JSON file.
   * @param prof The profile object to save.
   */
  const saveProfile = (prof: Profile): void => {
    const json = prof.toJSON()
    console.log('Sending Profile: ', JSON.stringify(json))
    window.api.saveProfile(json)
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
          <button onClick={seeCurrentProfile}>Current Profile</button>
          <button onClick={loadProfile}>Load e1.json</button>
        </div>
      )}

      {/* Current Profile Screen */}
      {currentView === View.CURRENT_PROFILE && (
        <div>
          <h1>New Profile</h1>
          <h1>Current Profile: {profileName}</h1>
          <h2>Allow a user to create a new profile</h2>
          {/*<KeyboardRemapper /> TODO: Rework this*/}
          <button onClick={goHome}>Home</button>
          <button onClick={transmitProfile}>Transmit Profile</button>
          <button onClick={() => profile && saveProfile(profile)}>Save</button>
          <button onClick={createNewProfile}>New Profile</button>
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
