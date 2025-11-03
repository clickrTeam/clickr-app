import { Settings } from '../../../../models/Settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface PrivacySettingsProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
}

const PrivacySettings = ({ settings, onUpdate }: PrivacySettingsProps): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Data</CardTitle>
        <CardDescription>Manage your privacy preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="analyticsEnabled">Analytics</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send anonymous usage data to help improve Clickr. No personal information is collected</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Enable anonymous usage analytics to help improve the app</CardDescription>
          </div>
          <Switch
            id="analyticsEnabled"
            checked={settings.analyticsEnabled}
            onCheckedChange={(checked) => onUpdate({ analyticsEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="aiAnalyticsEnabled">AI Analytics</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable AI analysis of keystrokes to provide optimal remapping suggestions</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Enable AI analytics of keystrokes for optimal remappings</CardDescription>
          </div>
          <Switch
            id="aiAnalyticsEnabled"
            checked={settings.aiAnalyticsEnabled}
            onCheckedChange={(checked) => onUpdate({ aiAnalyticsEnabled: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default PrivacySettings

