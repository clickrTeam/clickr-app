import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Settings as SettingsType } from '../../../models/Settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Separator } from '@renderer/components/ui/separator'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import AppearanceSettings from '@renderer/components/settings/AppearanceSettings'
import ApplicationSettings from '@renderer/components/settings/ApplicationSettings'
import KeyboardSettings from '@renderer/components/settings/KeyboardSettings'
import PrivacySettings from '@renderer/components/settings/PrivacySettings'
import NotificationSettings from '@renderer/components/settings/NotificationSettings'
import ProfileSettings from '@renderer/components/settings/ProfileSettings'
import SecuritySettings from '@renderer/components/settings/SecuritySettings'
import DataManagement from '@renderer/components/settings/DataManagement'

interface SettingsProps {
  isAuthenticated: boolean
  username?: string
}

const Settings = ({ isAuthenticated, username }: SettingsProps): JSX.Element => {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async (): Promise<void> => {
    try {
      const loadedSettings = await window.api.getSettings()
      setSettings(loadedSettings)
    } catch (error) {
      toast.error('Failed to load settings')
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsUpdate = async (updates: Partial<SettingsType>): Promise<void> => {
    if (!settings) return

    try {
      const updated = await window.api.updateSettings(updates)
      setSettings(updated)
      toast.success('Settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Error updating settings:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load settings</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences</p>
          </div>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="mt-6">
              <AppearanceSettings settings={settings} onUpdate={handleSettingsUpdate} />
            </TabsContent>

            <TabsContent value="application" className="mt-6">
              <ApplicationSettings settings={settings} onUpdate={handleSettingsUpdate} />
            </TabsContent>

            <TabsContent value="keyboard" className="mt-6">
              <KeyboardSettings settings={settings} onUpdate={handleSettingsUpdate} />
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <PrivacySettings settings={settings} onUpdate={handleSettingsUpdate} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationSettings settings={settings} onUpdate={handleSettingsUpdate} />
            </TabsContent>
          </Tabs>

          {isAuthenticated && (
            <>
              <Separator className="my-8" />
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and data</p>
              </div>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <ProfileSettings username={username} />
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                  <SecuritySettings username={username} />
                </TabsContent>

                <TabsContent value="data" className="mt-6">
                  <DataManagement username={username} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </div>
    </TooltipProvider>
  )
}

export default Settings

