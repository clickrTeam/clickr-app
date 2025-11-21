import { useState, useEffect, useRef } from 'react'
import { Profile } from '../../../models/Profile'
import log from 'electron-log'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import NewProfileDialog from '@renderer/components/NewProfileDialog'
import { ProfileEditor } from '@renderer/components/ProfileEditor'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Input } from '@renderer/components/ui/input'
import { Search, Download, User, Clock, Plus, Upload, Cloud, Trash } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import profileController, { ProfileController } from '@renderer/components/VisualKeyboard/ProfileControler'


type UploadedMapping = {
  id: string
  user: string
  name: string
  description: string
  mappings: Profile
  updated_at: string
  lastEdited: string
  keyCount: number
  isActive: boolean
  isPublic: boolean
  numLikes: number
  numDownloads: number
  tags: Array<string>
}

interface MyMappingsProps {
  isAuthenticated: boolean
  username?: string
}

function MyMappings({ isAuthenticated, username }: MyMappingsProps): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()

  // Local mappings state
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [activeProfileIndex, setActiveProfileIndex] = useState<number | null>(null)
  const [editedProfileIndex, setEditedProfileIndex] = useState<number | null>(null)
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false)

  // User's uploaded mappings state
  const [userMappings, setUserMappings] = useState<UploadedMapping[]>([])
  const [isLoadingUploaded, setIsLoadingUploaded] = useState(false)
  const [uploadedError, setUploadedError] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Ref to track if toast has been shown to prevent duplicates
  const toastShownRef = useRef(false)

  function updateProfiles(): Promise<void> {
    return new Promise((resolve) => {
      window.api.getProfiles().then((profiles: object[]) => {
        log.silly('Got profiles:', profiles)
        setProfiles(profiles.map((profile) => Profile.fromJSON(profile)))
      })

      window.api.getActiveProfile().then((activeProfile: number | null) => {
        log.info('Active profile is index: ', activeProfile)
        setActiveProfileIndex(activeProfile)
        resolve()
      }).catch(() => {
        // If getActiveProfile fails, still resolve after a short delay
        setTimeout(resolve, 100)
      })
    })
  }

  // Fetch user's uploaded mappings only
  const fetchUploadedMappings = async (): Promise<void> => {
    try {
      setIsLoadingUploaded(true)
      setUploadedError(null)

      // Only fetch user's own mappings if authenticated
      if (isAuthenticated && username) {
        try {
          const userData = await window.api.fetchUserMappings(username)
          setUserMappings(
            userData.map((mapping: any) => ({
              ...mapping,
              lastEdited: formatLastEdited(mapping.updated_at)
            }))
          )
        } catch (userError) {
          log.warn('Could not fetch user mappings:', userError)
          setUploadedError('Failed to fetch your uploaded mappings')
        }
      } else {
        setUserMappings([])
      }
    } catch (err) {
      setUploadedError(err instanceof Error ? err.message : 'Failed to fetch mappings')
    } finally {
      setIsLoadingUploaded(false)
    }
  }

  const formatLastEdited = (dateString: string): string => {
    const updatedDate = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  // Load local profiles immediately on mount
  useEffect(() => {
    updateProfiles()
  }, [])

  // Load uploaded mappings only when auth status changes
  useEffect(() => {
    if (isAuthenticated && username) {
      fetchUploadedMappings()
    } else {
      setUserMappings([])
    }
  }, [isAuthenticated, username])

  // Reset edit state when navigating to mappings page (from navbar clicks)
  // Listen for custom event dispatched by navbar when clicking Mappings/Clickr
  useEffect(() => {
    const handleResetEdit = (): void => {
      if (editedProfileIndex !== null) {
        // Save changes before resetting, just like the Back button does
        profileController.onSave()
        setEditedProfileIndex(null)
      }
    }

    window.addEventListener('reset-mappings-edit', handleResetEdit)
    return () => {
      window.removeEventListener('reset-mappings-edit', handleResetEdit)
    }
  }, [editedProfileIndex])

  // Show toast when navigating from Insights page
  useEffect(() => {
    const state = location.state as { fromInsights?: boolean } | null
    if (state?.fromInsights && !toastShownRef.current) {
      toast.info('Please select a mapping to apply the remapping recommendation', {
        duration: 8000
      })
      toastShownRef.current = true
      // Clear the state to prevent showing the toast again on re-renders
      window.history.replaceState({}, '')
    }
    // Reset the ref when location changes (new navigation)
    if (!state?.fromInsights) {
      toastShownRef.current = false
    }
  }, [location.state])


  const confirmDeleteProfile = (profile_index: number): void => {
    toast('Are you sure you want to delete this profile?', {
      action: {
        label: 'Delete',
        onClick: () => {
          window.api.deleteProfile(profile_index)
          updateProfiles()
          log.info(`Profile at index ${profile_index} deleted.`)
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    })
  }

  const handleUploadMapping = async (profile: Profile): Promise<void> => {
    if (!isAuthenticated || !username) {
      toast.error('Please log in to upload mappings')
      return
    }

    try {
      await window.api.createMapping(username, profile.toJSON())
      toast.success('Mapping uploaded successfully!')
      fetchUploadedMappings() // Refresh uploaded mappings
    } catch (error) {
      toast.error('Failed to upload mapping')
      log.error('Upload error:', error)
    }
  }

  const handleDownloadMapping = async (mapping: UploadedMapping): Promise<void> => {
    try {
      const profileData = mapping.mappings
      const profileName = `${mapping.name} (Downloaded)`

      // Create a new local profile from the downloaded mapping
      await window.api.createProfile(profileName)

      // Get the newly created profile index
      const profiles = await window.api.getProfiles()
      const newProfileIndex = profiles.length - 1

      // Update the profile with the downloaded data
      const downloadedProfile = Profile.fromJSON(profileData)
      downloadedProfile.profile_name = profileName

      await window.api.updateProfile(newProfileIndex, downloadedProfile.toJSON())

      toast.success(`Downloaded "${mapping.name}" to local mappings!`)
      updateProfiles() // Refresh local profiles
    } catch (error) {
      toast.error('Failed to download mapping')
      log.error('Download error:', error)
    }
  }

  // Filter mappings based on search and tab
  const getFilteredMappings = (): any[] => {
    const localMappings =
      profiles?.map((profile, index) => ({
        type: 'local' as const,
        profile,
        index,
        isActive: activeProfileIndex === index
      })) || []

    // Only handle local and user's uploaded mappings
    const userUploadedMappingsWithType = userMappings.map((mapping) => ({
      type: 'uploaded' as const,
      mapping,
      isUserOwned: true
    }))

    let filteredMappings: any[] = []

    switch (activeTab) {
      case 'local':
        filteredMappings = localMappings
        break
      case 'uploaded':
        // Only show user's own uploaded mappings
        filteredMappings = userUploadedMappingsWithType
        break
      case 'all':
      default:
        // Show local and user uploaded mappings only
        filteredMappings = [...localMappings, ...userUploadedMappingsWithType]
        break
    }

    if (searchQuery) {
      filteredMappings = filteredMappings.filter((item) => {
        if (item.type === 'local') {
          return item.profile.profile_name.toLowerCase().includes(searchQuery.toLowerCase())
        } else {
          return (
            item.mapping.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mapping.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mapping.tags.some((tag: string) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        }
      })
    }

    return filteredMappings
  }

  const onSave = (_profileController: ProfileController): void => {
    if (editedProfileIndex === null) return
    if (activeProfileIndex == editedProfileIndex) {
      window.api.setActiveProfile(editedProfileIndex)
    }
    updateProfiles()
  }

  // If editing a profile, show the editor
  if (editedProfileIndex !== null && profiles != null) {
    profileController.setup(
        profiles[editedProfileIndex],
        editedProfileIndex,
        onSave)
    return (
      <div className="space-y-6">
        <ProfileEditor
          onBack={() => {
            setEditedProfileIndex(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-8 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {isAuthenticated ? `Welcome back, ${username}!` : 'Keyboard Mappings'}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {isAuthenticated
                ? 'Manage your local mappings and discover community creations'
                : 'Create local mappings and explore community creations'}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search mappings..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center mb-8">
              <Button
                onClick={() => setIsCreatingProfile(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                New Local Mapping
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2"
                >
                  <User size={16} />
                  Login to Upload
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Mappings</TabsTrigger>
              <TabsTrigger value="local">Local ({profiles?.length || 0})</TabsTrigger>
              <TabsTrigger value="uploaded">Uploaded ({userMappings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <MappingGrid mappings={getFilteredMappings()} />
            </TabsContent>

            <TabsContent value="local" className="mt-6">
              <MappingGrid mappings={getFilteredMappings()} />
            </TabsContent>

            <TabsContent value="uploaded" className="mt-6">
              {isLoadingUploaded ? (
                <div className="text-center p-12">
                  <p className="text-muted-foreground">Loading uploaded mappings...</p>
                </div>
              ) : uploadedError ? (
                <div className="text-center p-12">
                  <p className="text-red-500">Error: {uploadedError}</p>
                  <Button onClick={fetchUploadedMappings} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : (
                <MappingGrid mappings={getFilteredMappings()} />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Dialogs */}
        <NewProfileDialog
          isOpen={isCreatingProfile}
          onCancel={() => setIsCreatingProfile(false)}
          onCreate={(name) => {
            window.api.createProfile(name)
            updateProfiles()
            setIsCreatingProfile(false)
          }}
        />
      </div>
    </div>
  )

  // Mapping Grid Component
  function MappingGrid({ mappings }: { mappings: any[] }) {
    if (mappings.length === 0) {
      return (
        <div className="text-center p-12">
          <p className="text-muted-foreground text-lg">No mappings found</p>
          {activeTab === 'local' && (
            <Button
              onClick={() => setIsCreatingProfile(true)}
              className="mt-4 flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Create Your First Mapping
            </Button>
          )}
        </div>
      )
    }

    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {mappings.map((item, index) => (
          <motion.div
            key={item.type === 'local' ? `local-${item.index}` : `${item.type}-${item.mapping.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {item.type === 'local' ? (
              <LocalMappingCard item={item} />
            ) : (
              <UserUploadedMappingCard item={item} />
            )}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // Local Mapping Card Component
  function LocalMappingCard({ item }: { item: any }) {
    return (
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{item.profile.profile_name}</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Download size={12} />
              Local
            </Badge>
          </div>
          <CardDescription>{item.profile.layer_count} layers</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow relative">
          {item.isActive && (
            <Badge variant="default" className="mb-2 bg-green-200 hover:bg-green-300 text-gray-800">
              Currently Active
            </Badge>
          )}
          {!item.isActive && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-0 right-3"
              onClick={() => {
                window.api.setActiveProfile(item.index)
                updateProfiles()
              }}
            >
              Set Active
            </Button>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 flex justify-end gap-2 px-4">
          <Button variant="secondary" size="sm" onClick={() => setEditedProfileIndex(item.index)}>
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleUploadMapping(item.profile)}
            className="flex items-center gap-1"
            disabled={!isAuthenticated}
          >
            <Upload size={14} />
            {isAuthenticated ? 'Upload' : 'Login to Upload'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-500 text-white"
            onClick={() => confirmDeleteProfile(item.index)}
          >
            <Trash size={14} />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // User's Uploaded Mapping Card Component (blue border like community)
  function UserUploadedMappingCard({ item }: { item: any }) {
    const { mapping } = item

    return (
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow ring-2 ring-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{mapping.name}</CardTitle>
            <Badge variant="default" className="flex items-center gap-1">
              <Cloud size={12} />
              Your Upload
            </Badge>
          </div>
          <CardDescription>
            <div className="space-y-2">
              <p className="text-sm">{mapping.description}</p>
              <div className="flex flex-wrap gap-1">
                {mapping.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>{mapping.user}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{mapping.lastEdited}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4 flex justify-end gap-2 px-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/mapping/${mapping.id}`, { state: { from: 'mappings' } })}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadMapping(mapping)}
            className="flex items-center gap-1 text-xs px-2"
          >
            <Download size={12} />
            Download to Local
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-500 text-white"
            onClick={() => {
              if (!isAuthenticated || !username) {
                toast.error('Please log in to delete mappings')
                return
              }

              toast('Are you sure you want to delete this uploaded mapping?', {
                action: {
                  label: 'Delete',
                  onClick: async () => {
                    try {
                      await window.api.deleteMapping(username, mapping.id)
                      toast.success('Uploaded mapping deleted successfully!')
                      fetchUploadedMappings() // Refresh the uploaded mappings
                    } catch (error) {
                      toast.error('Failed to delete uploaded mapping')
                      log.error('Delete uploaded mapping error:', error)
                    }
                  }
                },
                cancel: {
                  label: 'Cancel',
                  onClick: () => {}
                }
              })
            }}
          >
            <Trash size={14} />
          </Button>
        </CardFooter>
      </Card>
    )
  }
}

export default MyMappings
