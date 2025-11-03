import { Settings } from '../../../../models/Settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

interface AppearanceSettingsProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
}

const AppearanceSettings = ({ settings, onUpdate }: AppearanceSettingsProps): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel of the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme">Theme</Label>
            <CardDescription>Choose your preferred color scheme</CardDescription>
          </div>
          <Select
            value={settings.theme}
            onValueChange={(value) => onUpdate({ theme: value as 'light' | 'dark' | 'system' })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppearanceSettings

