import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { toast } from 'sonner'

interface ProfileSettingsProps {
  username?: string
}

const ProfileSettings = ({ username }: ProfileSettingsProps): JSX.Element => {
  const [email, setEmail] = useState<string>('')
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const loadProfile = useCallback(async (): Promise<void> => {
    if (!username) return

    setIsLoadingProfile(true)
    try {
      const profile = await window.api.getUserProfile(username)
      setEmail(profile.email || '')
      // Note: profile_image URL might be returned, but we'll handle file selection separately
    } catch (error) {
      toast.error('Failed to load profile')
      console.error('Error loading profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [username])

  useEffect(() => {
    if (username) {
      loadProfile()
    }
  }, [username, loadProfile])

  const handleSelectImage = async (): Promise<void> => {
    try {
      const filePath = await window.api.selectImageFile()
      if (filePath) {
        setProfileImagePath(filePath)
        toast.success('Profile image selected')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select image'
      toast.error(errorMessage)
      console.error('Error selecting image:', error)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!username) return

    setIsLoading(true)
    try {
      const profileData: { email?: string; profile_image?: string } = {}

      if (email) {
        profileData.email = email
      }

      if (profileImagePath) {
        profileData.profile_image = profileImagePath
      }

      if (Object.keys(profileData).length === 0) {
        toast.info('No changes to save')
        return
      }

      await window.api.updateUserProfile(username, profileData)
      toast.success('Profile updated successfully')
      setProfileImagePath(null) // Clear selected path after successful upload
      await loadProfile() // Reload profile to show updated data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      toast.error('Failed to update profile', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Manage your profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username || ''} disabled />
          <CardDescription>Username cannot be changed</CardDescription>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <CardDescription>Update your email address</CardDescription>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileImage">Profile Image</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleSelectImage}>
              {profileImagePath ? 'Change Image' : 'Select Image'}
            </Button>
            {profileImagePath && (
              <span className="text-sm text-muted-foreground self-center">
                {profileImagePath.split(/[/\\]/).pop()}
              </span>
            )}
          </div>
          <CardDescription>Upload a profile picture (max 2MB)</CardDescription>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ProfileSettings
