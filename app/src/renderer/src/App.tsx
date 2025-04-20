import { Profile } from '../../models/Profile'
import React, { useState } from 'react'
import { Button } from './components/ui/button'
import Navbar from './components/Navbar'

// Enum to represent different views/screens
export enum View {
  HOME = 'HOME',
  COMMUNITY = 'COMMUNITY',
  MY_MAPPINGS = 'MY_MAPPINGS',
  LOGIN = 'LOGIN',
  LOCAL_MAPPINGS = 'TEST'
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
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [activeProfile, setActiveProfile] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('')

  function updateProfiles() {
    window.api.getProfiles()
      .then((profiles: Profile[]) => {
        console.log('Got profile:', profiles)
        setProfiles(profiles)
      });

    window.api.getActiveProfile()
      .then((activeProfile: number | null) => {
        console.log('Active profile is index: ', activeProfile)
        setActiveProfile(activeProfile)
      });

  }

  // Get the profile from the main process when the component mounts
  React.useEffect(() => {
    console.log('[App] useEffect running')
    console.log('window.api:', window.api)
    updateProfiles()

  }, [])

  /**
   * Loads a profile.json from a specific path.
   * TODO: Add logic to the new backed
   * @param file_path The path where the desired json is
   */
  const loadProfile = (file_path: string): void => {
    // // TODO: Implement logic
    // window.electron.ipcRenderer.send('load')
  }

  /**
   * TOOD: not implemnted this seems like some kind of export utility currently all json is stored in the app data
   * Sends an IPC message to the main process to save the current profile into a JSON file.
   * @param prof The profile object to save.
   */
  const saveProfile = (prof: Profile): void => {
    // const json = prof.toJSON()
    // console.log('Sending Profile: ', JSON.stringify(json))
    // window.api.saveProfile(json)
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
                onClick={() => setCurrentView(View.LOCAL_MAPPINGS)}
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
        {currentView === View.LOCAL_MAPPINGS && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-black">Local Profiles</h1>
              <Button onClick={() => setCurrentView(View.HOME)}>Back to Home</Button>
            </div>

            {!profiles || profiles.length === 0 ? (
              <p className="text-black">No profiles found.</p>
            ) : (
              <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow-md">
                {profiles.map((profile, index) => (
                  <li key={index} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-black">
                          {profile.profile_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Layers: {profile.layer_count}
                        </p>
                      </div>
                      {activeProfile === index && (
                        <span className="px-2 py-1 text-sm bg-cyan-100 text-cyan-800 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
