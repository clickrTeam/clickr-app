import React, { useState } from 'react'
import { Profile } from '../../../models/Profile'
import log from 'electron-log'
import { toast } from 'sonner'
import NewProfileDialog from '@renderer/components/NewProfileDialog'
import { ProfileEditor } from '@renderer/components/ProfileEditor'
import { Card } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Link } from 'react-router-dom'

function MyMappings(): JSX.Element {
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [activeProfile, setActiveProfile] = useState<number | null>(null)
  const [editedProfileIndex, setEditedProfileIndex] = useState<number | null>(null)
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false)

  function updateProfiles(): void {
    window.api.getProfiles().then((profiles: object[]) => {
      log.info('Got profiles:', profiles)
      setProfiles(profiles.map((profile) => Profile.fromJSON(profile)))
    })

    window.api.getActiveProfile().then((activeProfile: number | null) => {
      log.info('Active profile is index: ', activeProfile)
      setActiveProfile(activeProfile)
    })
  }

  React.useEffect(() => {
    log.info('[MyMappings] useEffect running')
    updateProfiles()
  }, [])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Local Profiles</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
          <Button onClick={() => setIsCreatingProfile(true)}>New Profile</Button>
        </div>
      </div>

      {editedProfileIndex !== null && profiles != null ? (
        <ProfileEditor
          profile={profiles[editedProfileIndex]}
          onSave={(updatedProfile: Profile) => {
            log.info(`Profile has been updated and saved. Updated profile: ${updatedProfile}`)
            window.api.updateProfile(editedProfileIndex, updatedProfile.toJSON())
            updateProfiles()
            setEditedProfileIndex(null)
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
                      <h3 className="text-lg font-semibold">{profile.profile_name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.layer_count} layers</p>
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
                            window.api.setActiveProfile(index)
                            updateProfiles()
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
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          window.api.createMapping('TEST_USER', profile.toJSON())
                          updateProfiles()
                        }}
                      >
                        Upload
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          confirmDeleteProfile(index)
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
        onCreate={(name) => {
          window.api.createProfile(name)
          updateProfiles()
          setIsCreatingProfile(false)
        }}
      />
    </div>
  )
}

export default MyMappings
