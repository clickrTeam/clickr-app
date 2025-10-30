import { Settings } from '../../../../models/Settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface KeyboardSettingsProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
}

const KeyboardSettings = ({ settings, onUpdate }: KeyboardSettingsProps): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard & Daemon</CardTitle>
        <CardDescription>Configure keyboard daemon behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="autoStartKeybinder">Auto-start Keybinder</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Automatically start the keybinder daemon when the application launches</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Automatically start keybinder daemon on app launch</CardDescription>
          </div>
          <Switch
            id="autoStartKeybinder"
            checked={settings.autoStartKeybinder}
            onCheckedChange={(checked) => onUpdate({ autoStartKeybinder: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="keybinderAutoRestart">Keybinder Auto-restart</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Automatically restart the keybinder daemon if it crashes or stops unexpectedly</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Automatically restart keybinder if it crashes</CardDescription>
          </div>
          <Switch
            id="keybinderAutoRestart"
            checked={settings.keybinderAutoRestart}
            onCheckedChange={(checked) => onUpdate({ keybinderAutoRestart: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="showKeybinderStatus">Show Keybinder Status</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Display the keybinder daemon status indicator in the navigation bar</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Display keybinder status in UI</CardDescription>
          </div>
          <Switch
            id="showKeybinderStatus"
            checked={settings.showKeybinderStatus}
            onCheckedChange={(checked) => onUpdate({ showKeybinderStatus: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default KeyboardSettings

