import { useState, useEffect } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Separator } from '@renderer/components/ui/separator'
import { Switch } from '@renderer/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { toast } from 'sonner'
import { Save, User, Shield, Globe, HardDrive } from 'lucide-react'

interface LocalSettings {
  // App behavior settings
  autoStartDaemon: boolean
  enableNotifications: boolean
  enableAppSpecificProfiles: boolean
  enableDataAnalytics: boolean
  // Advanced mapping configuration
  showAdvancedFeatures: boolean
  // Cloud-synced settings (stored locally but synced)
  theme: 'light' | 'dark' | 'system'
  keyboardLayout: 'qwerty' | 'dvorak' | 'colemak'
  defaultMappingVisibility: 'private' | 'public'
  autoSyncMappings: boolean
  // Performance settings
  macroExecutionTimeout: number
  keyPressDelayOverride: number
  doubleTapSensitivity: number
  // Other advanced settings
  enableDaemonAutoRecovery: boolean
  blockOriginalKeyEvents: boolean
  enableGamingMode: boolean
  enableLayerIndicators: boolean
}

interface UserProfile {
  username: string
  email: string
  firstName: string
  lastName: string
  profileImage?: string
}

interface CloudSettings {
  theme: 'light' | 'dark' | 'system'
  keyboardLayout: 'qwerty' | 'dvorak' | 'colemak'
  defaultMappingVisibility: 'private' | 'public'
  autoSyncMappings: boolean
  showAdvancedFeatures: boolean
}

const Settings = (): JSX.Element => {
  const [localSettings, setLocalSettings] = useState<LocalSettings | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [cloudSettings, setCloudSettings] = useState<CloudSettings | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadAllSettings()
  }, [])

  const loadAllSettings = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const result = await window.api.getAllSettings()
      if (result.success && result.data) {
        setLocalSettings(result.data.local)
        setUserProfile(result.data.profile)
        setCloudSettings(result.data.cloud)
        setIsAuthenticated(result.data.isAuthenticated)
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocalSettingChange = (key: keyof LocalSettings, value: any): void => {
    if (localSettings) {
      setLocalSettings(prev => prev ? { ...prev, [key]: value } : null)
    }
  }

  const handleProfileChange = (key: keyof UserProfile, value: any): void => {
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, [key]: value } : null)
    }
  }

  const handleSaveLocalSettings = async (): Promise<void> => {
    if (!localSettings) return
    
    setIsSaving(true)
    try {
      const result = await window.api.updateLocalSettings(localSettings)
      if (result.success) {
        toast.success('Local settings saved successfully')
      } else {
        toast.error(result.message || 'Failed to save local settings')
      }
    } catch (error) {
      console.error('Failed to save local settings:', error)
      toast.error('Failed to save local settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfile = async (): Promise<void> => {
    if (!userProfile) return
    
    setIsSaving(true)
    try {
      const result = await window.api.updateUserProfile(userProfile)
      if (result.success) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(result.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCloudSettings = async (): Promise<void> => {
    if (!cloudSettings) return
    
    setIsSaving(true)
    try {
      // Create cloud settings object with only the synced settings
      const cloudUpdates = {
        theme: localSettings?.theme,
        keyboardLayout: localSettings?.keyboardLayout,
        defaultMappingVisibility: localSettings?.defaultMappingVisibility,
        autoSyncMappings: localSettings?.autoSyncMappings,
        showAdvancedFeatures: localSettings?.showAdvancedFeatures
      }
      
      const result = await window.api.updateCloudSettings(cloudUpdates)
      if (result.success) {
        setCloudSettings(result.data)
        toast.success('Cloud settings synced successfully')
      } else {
        toast.error(result.message || 'Failed to sync cloud settings')
      }
    } catch (error) {
      console.error('Failed to save cloud settings:', error)
      toast.error('Failed to sync cloud settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (): Promise<void> => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsSaving(true)
    try {
      const result = await window.api.changePassword({
        currentPassword,
        newPassword
      })
      
      if (result.success) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-cyan-500" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Local Settings - Always Available */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Local Settings
          </CardTitle>
          <CardDescription>
            Settings stored locally on this device (available offline)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {localSettings && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start Daemon</Label>
                  <p className="text-sm text-gray-500">Automatically start the key mapping daemon when the app opens</p>
                </div>
                <Switch
                  checked={localSettings.autoStartDaemon}
                  onCheckedChange={(checked) => handleLocalSettingChange('autoStartDaemon', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Show desktop notifications for mapping events</p>
                </div>
                <Switch
                  checked={localSettings.enableNotifications}
                  onCheckedChange={(checked) => handleLocalSettingChange('enableNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>App-Specific Profiles</Label>
                  <p className="text-sm text-gray-500">Automatically switch profiles based on active application</p>
                </div>
                <Switch
                  checked={localSettings.enableAppSpecificProfiles}
                  onCheckedChange={(checked) => handleLocalSettingChange('enableAppSpecificProfiles', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Analytics</Label>
                  <p className="text-sm text-gray-500">Help improve Clickr by sharing anonymous usage data</p>
                </div>
                <Switch
                  checked={localSettings.enableDataAnalytics}
                  onCheckedChange={(checked) => handleLocalSettingChange('enableDataAnalytics', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Advanced Mapping Configuration</Label>
                  <p className="text-sm text-gray-500">Enable advanced mapping and configuration options</p>
                </div>
                <Switch
                  checked={localSettings.showAdvancedFeatures}
                  onCheckedChange={(checked) => handleLocalSettingChange('showAdvancedFeatures', checked)}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveLocalSettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Local Settings'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cloud-Synced Settings - Requires Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cloud-Synced Settings
          </CardTitle>
          <CardDescription>
            Settings that sync across all your devices {!isAuthenticated && '(login required)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Please log in to access cloud-synced settings</p>
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </div>
          ) : localSettings ? (
            <>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={localSettings.theme} onValueChange={(value) => handleLocalSettingChange('theme', value)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Keyboard Layout</Label>
                <Select value={localSettings.keyboardLayout} onValueChange={(value) => handleLocalSettingChange('keyboardLayout', value)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qwerty">QWERTY</SelectItem>
                    <SelectItem value="dvorak">Dvorak</SelectItem>
                    <SelectItem value="colemak">Colemak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Mapping Visibility</Label>
                <Select value={localSettings.defaultMappingVisibility} onValueChange={(value) => handleLocalSettingChange('defaultMappingVisibility', value)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-sync Mappings</Label>
                  <p className="text-sm text-gray-500">Automatically sync your mappings with the cloud</p>
                </div>
                <Switch
                  checked={localSettings.autoSyncMappings}
                  onCheckedChange={(checked) => handleLocalSettingChange('autoSyncMappings', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Advanced Features</Label>
                  <p className="text-sm text-gray-500">Enable advanced mapping and configuration options</p>
                </div>
                <Switch
                  checked={localSettings.showAdvancedFeatures}
                  onCheckedChange={(checked) => handleLocalSettingChange('showAdvancedFeatures', checked)}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveCloudSettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Syncing...' : 'Sync to Cloud'}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Profile Settings - Requires Authentication */}
      {isAuthenticated && userProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Manage your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={userProfile.username}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={userProfile.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={userProfile.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Change - Requires Authentication */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleChangePassword} 
                disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                variant="destructive"
              >
                <Shield className="h-4 w-4 mr-2" />
                {isSaving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Settings