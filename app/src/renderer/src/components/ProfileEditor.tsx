import { Profile } from '../../../models/Profile'
import { Layer } from '../../../models/Layer'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useState } from 'react'
import { VisualKeyboard } from './VisualKeyboard/VisualKeyboard'
import { LayerComponent } from './LayerComponent'

interface ProfileEditorProps {
  profile: Profile
  onSave: (updatedProfile: Profile) => void
  onBack: () => void
}

export const ProfileEditor = ({ profile, onSave, onBack }: ProfileEditorProps): JSX.Element => {
  const [localProfile, setLocalProfile] = useState(profile)
  const [useVisualKeyboard, setUseVisualKeyboard] = useState(true)

  const handleLayerUpdate = (layerIndex: number, updatedLayer: Layer): void => {
    const next = Profile.fromJSON(localProfile.toJSON())
    next.layers[layerIndex] = updatedLayer
    setLocalProfile(next)
  }

  const handleAddLayer = (): void => {
    const next = Profile.fromJSON(localProfile.toJSON())
    next.layers.push(new Layer(`Layer ${next.layers.length}`, next.layers.length, new Map()))
    setLocalProfile(next)
  }

  const toggleEditor = () => setUseVisualKeyboard((v) => !v)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{localProfile.profile_name}</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={toggleEditor} className="mb-4">
            {useVisualKeyboard ? 'Traditional Editor' : 'Visual Editor'}
          </Button>
          <Button onClick={() => onSave(localProfile)}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="0">
        <div className="flex items-center justify-between">
          <TabsList>
            {localProfile.layers.map((layer: Layer, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {layer.layer_name}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button size="sm" onClick={handleAddLayer}>
            Add Layer
          </Button>
        </div>

        {localProfile.layers.map((layer, index) => (
          <TabsContent key={index} value={index.toString()}>
            {useVisualKeyboard ? (
              <VisualKeyboard layer={layer} />
            ) : (
              <LayerComponent
                layer={layer}
                maxLayer={profile.layers.length}
                onUpdate={(updatedLayer) => handleLayerUpdate(index, updatedLayer)}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
