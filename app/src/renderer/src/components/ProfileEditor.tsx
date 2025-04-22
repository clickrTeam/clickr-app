import { Profile } from '../../../models/Profile'
import { Layer } from '../../../models/Layer'
import { LayerComponent } from './LayerComponent'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useState } from 'react'

interface ProfileEditorProps {
  profile: Profile
  onSave: (updatedProfile: Profile) => void
  onBack: () => void
}

export const ProfileEditor = ({ profile, onSave, onBack }: ProfileEditorProps) => {
  const [localProfile, setLocalProfile] = useState(profile)

  const handleLayerUpdate = (layerIndex: number, updatedLayer: Layer) => {
    const newProfile = new Profile(localProfile.profile_name)
    newProfile.layers = [...localProfile.layers]
    newProfile.layers[layerIndex] = updatedLayer
    setLocalProfile(newProfile)
  }

  const handleAddLayer = () => {
    const newProfile = new Profile(localProfile.profile_name)
    newProfile.layers = [...localProfile.layers]
    newProfile.addLayer(`Layer ${newProfile.layers.length}`)
    setLocalProfile(newProfile)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{localProfile.profile_name}</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={() => onSave(localProfile)}>
            Save Changes
          </Button>
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
            <LayerComponent
              layer={layer}
              onUpdate={(updatedLayer) => handleLayerUpdate(index, updatedLayer)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
