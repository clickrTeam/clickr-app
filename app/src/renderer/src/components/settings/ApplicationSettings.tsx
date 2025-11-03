import { Settings } from '../../../../models/Settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface ApplicationSettingsProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
}

const ApplicationSettings = ({ settings, onUpdate }: ApplicationSettingsProps): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Behavior</CardTitle>
        <CardDescription>Configure how the application behaves</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="startOnBoot">Start on System Boot</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>When enabled, Clickr will automatically launch when your computer starts up</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Launch Clickr when your system starts</CardDescription>
          </div>
          <Switch
            id="startOnBoot"
            checked={settings.startOnBoot}
            onCheckedChange={(checked) => onUpdate({ startOnBoot: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="minimizeToTray">Minimize to Tray</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>When enabled, closing the window will minimize Clickr to the system tray instead of quitting</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Keep app running in system tray when closed</CardDescription>
          </div>
          <Switch
            id="minimizeToTray"
            checked={settings.minimizeToTray}
            onCheckedChange={(checked) => onUpdate({ minimizeToTray: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ApplicationSettings

