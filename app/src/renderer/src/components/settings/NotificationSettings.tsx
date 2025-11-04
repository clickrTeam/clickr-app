import { Settings } from '../../../../models/Settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface NotificationSettingsProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
}

const NotificationSettings = ({ settings, onUpdate }: NotificationSettingsProps): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="systemNotificationsEnabled">System Notifications</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable system notifications for important events and updates</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Enable system notifications</CardDescription>
          </div>
          <Switch
            id="systemNotificationsEnabled"
            checked={settings.systemNotificationsEnabled}
            onCheckedChange={(checked) => onUpdate({ systemNotificationsEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="layerNotificationEnabled">Layer Switch Notification</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show a desktop overlay UI when switching between keyboard layers</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Enable UI on desktop for switching layers</CardDescription>
          </div>
          <Switch
            id="layerNotificationEnabled"
            checked={settings.layerNotificationEnabled}
            onCheckedChange={(checked) => onUpdate({ layerNotificationEnabled: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationSettings

