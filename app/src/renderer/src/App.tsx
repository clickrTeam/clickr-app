import { Profile } from '../../models/Profile'
import React, { useState } from 'react'
import { Button } from './components/ui/button'
import Navbar from './components/Navbar'
import NewProfileDialog from './components/NewProfileDialog'
import Community from './pages/community'
import { ProfileEditor } from './components/ProfileEditor'
import { Card } from './components/ui/card'

// Enum to represent different views/screens
export enum View {
  HOME = 'HOME',
  COMMUNITY = 'COMMUNITY',
  MY_MAPPINGS = 'MY_MAPPINGS',
  LOGIN = 'LOGIN',
  LOCAL_MAPPINGS = 'LOCAL_MAPPINGS',
}

function App(): JSX.Element {
  // State to manage which view to show
  const [currentView, setCurrentView] = useState<View>(View.HOME)
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [activeProfile, setActiveProfile] = useState<number | null>(null)
  const [editedProfileIndex, setEditedProfileIndex] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('')

  function updateProfiles() {
    window.api.getProfiles().then((profiles: object[]) => {
      console.log('Got profiles:', profiles)
      setProfiles(profiles.map((profile) => Profile.fromJSON(profile)))
    })

    window.api.getActiveProfile().then((activeProfile: number | null) => {
      console.log('Active profile is index: ', activeProfile)
      setActiveProfile(activeProfile)
    })
  }

  // Get the profile from the main process when the component mounts
  React.useEffect(() => {
    console.log('[App] useEffect running')
    updateProfiles()
  }, [])

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
                onClick={() => setCurrentView(View.LOCAL_MAPPINGS)}>
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
        {currentView === View.COMMUNITY && <Community />}

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
              <h1 className="text-2xl font-bold">Local Profiles</h1>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setCurrentView(View.HOME)}>
                  Back to Home
                </Button>
                <Button onClick={() => setIsCreatingProfile(true)}>
                  New Profile
                </Button>
              </div>
            </div>

            {editedProfileIndex !== null && profiles != null ? (
              <ProfileEditor
                profile={profiles[editedProfileIndex]}
                onSave={(updatedProfile: Profile) => {
                  console.log("here", updatedProfile)
                  window.api.updateProfile(editedProfileIndex, updatedProfile.toJSON());
                  updateProfiles();
                  setEditedProfileIndex(null);
                }}
                onBack={() => setEditedProfileIndex(null)}
              />
            ) : (
              <>
                {!profiles || profiles.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No profiles found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profiles.map((profile, index) => (
                      <Card key={index}>
                        <div className="flex items-center justify-between p-4">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                              {profile.profile_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {profile.layer_count} layers
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {activeProfile === index ? (
                              <span className="px-2 py-1 text-sm bg-primary/10 text-primary rounded-full">
                                Active
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.api.setActiveProfile(index);
                                  updateProfiles();
                                }}
                              >
                                Set Active
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditedProfileIndex(index)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                window.api.deleteProfile(index);
                                updateProfiles();
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            <NewProfileDialog
              isOpen={isCreatingProfile}
              onCancel={() => setIsCreatingProfile(false)}
              onCreate={(name, _desc) => {
                window.api.createProfile(name);
                updateProfiles();
                setIsCreatingProfile(false);
              }}
            />
          </div>
        )}
      </div>
    </div >
  )
}

export default App
