import { Profile } from '../../models/Profile'
import React, { useState } from 'react'
import { Button } from './components/ui/button'
import Navbar from './components/Navbar'

// Enum to represent different views/screens
enum View {
  HOME = 'HOME',
  COMMUNITY = 'COMMUNITY',
  MY_MAPPINGS = 'MY_MAPPINGS',
  LOGIN = 'LOGIN',
  TEST = 'TEST'
}

// Define type for the Profile JSON that matches Profile.toJSON()
interface ProfileJSON {
  profile_name: string
  layer_count: number
  layers: object[]
}

function App(): JSX.Element {
  // State to manage which view to show
  const [currentView, setCurrentView] = useState<View>(View.HOME)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileName, setProfileName] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('')

  // Get the profile from the main process when the component mounts
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
   * Sends an IPC message to the main process to save the current profile into a JSON file.
   * @param prof The profile object to save.
   */

  const saveProfile = (prof: Profile): void => {
    const json = prof.toJSON()
    console.log('Sending Profile: ', JSON.stringify(json))
    window.api.saveProfile(json)
  }

  const logout = (): void => {
    setIsAuthenticated(false)
    setUsername('')
  }

  // Mock login function (replace with real implementation)
  const login = (): void => {
    setIsAuthenticated(true)
    setUsername('TestUser')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white w-full h-full">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAuthenticated={isAuthenticated}
        username={username}
        logout={logout}
      />

      <div className="w-full px-4 flex-grow py-8">
        {/* Home/Welcome Screen */}
        {currentView === View.HOME && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold text-cyan-600 mb-24">Welcome to Clickr</h1>

            <div className="flex space-x-12 mt-10">
              <Button
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700 text-black px-8"
                onClick={() => setCurrentView(View.LOGIN)}
              >
                Login
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-600 text-black hover:bg-cyan-700 px-8"
                onClick={() => setCurrentView(View.TEST)}
              >
                Test
              </Button>
            </div>
          </div>
        )}

        {/* Login Screen */}
        {currentView === View.LOGIN && (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-6 text-black">Login</h1>
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md ">
              {/* Simple mock login form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Username</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your password"
                  />
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={login}>
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Community Screen Placeholder */}
        {currentView === View.COMMUNITY && (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6 text-black">Community Mappings</h1>
            <p className="text-black">Community mapping content will be displayed here.</p>
          </div>
        )}

        {/* My Mappings Screen Placeholder */}
        {currentView === View.MY_MAPPINGS && (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6 text-black">My Mappings</h1>
            {isAuthenticated ? (
              <p>Your personal mappings will be displayed here.</p>
            ) : (
              <div className="text-center">
                <p className="mb-4">Please login to view your mappings.</p>
                <Button onClick={() => setCurrentView(View.LOGIN)}>Go to Login</Button>
              </div>
            )}
          </div>
        )}

        {/* Test Page (Original functionality) */}
        {currentView === View.TEST && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-black">Test Page</h1>
              <Button onClick={() => setCurrentView(View.HOME)}>Back to Home</Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-black">
              <h2 className="text-xl mb-4 text-black">Test Functions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleStartDaemon}>Start Daemon</Button>
                <Button onClick={() => loadProfile('')}>Load Profile</Button>
                <Button onClick={transmitProfile}>Transmit Profile</Button>
                <Button onClick={createNewProfile}>Create New Profile</Button>
                <Button onClick={() => profile && saveProfile(profile)}>Save Profile</Button>
              </div>

              {profile && (
                <div className="mt-6 p-4 bg-gray-100 rounded-md">
                  <h3 className="font-medium mb-2">Current Profile: {profileName}</h3>
                  <p className="text-sm text-gray-600">
                    Profile data is loaded and can be edited/saved.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
