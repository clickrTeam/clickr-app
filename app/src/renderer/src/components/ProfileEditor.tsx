import { Profile } from '../../../models/Profile'
import { Layer } from '../../../models/Layer'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useState } from 'react'
import { toast } from 'sonner'
import { VisualKeyboard } from './VisualKeyboard/VisualKeyboard'
import { LayerComponent } from './LayerComponent'
import { useNavigate } from 'react-router-dom'

interface ProfileEditorProps {
  profile: Profile
  onSave: (updatedProfile: Profile) => void
  onBack: () => void
}

export const ProfileEditor = ({ profile, onSave, onBack }: ProfileEditorProps): JSX.Element => {
  const [localProfile, setLocalProfile] = useState(profile)
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)
  const [useVisualKeyboard, setUseVisualKeyboard] = useState(true)
  const navigate = useNavigate()

  const handleLayerUpdate = (layerIndex: number, updatedLayer: Layer): void => {
    const next = Profile.fromJSON(localProfile.toJSON())
    next.layers[layerIndex] = updatedLayer
    setLocalProfile(next)
  }

  const handleAddLayer = (): void => {
    const next = Profile.fromJSON(localProfile.toJSON())
    next.addLayer('Layer ' + next.layer_count)

    setLocalProfile(next)
  }

  const confirmDeleteLayer = (layerNumber: number): void => {
    toast('Are you sure you want to delete this layer?', {
      action: {
        label: 'Delete',
        onClick: () => handleDeleteLayer(layerNumber)
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    })
  }

  const handleDeleteLayer = (layerNumber: number): void => {
    const prof = Profile.fromJSON(localProfile.toJSON())
    const was_successful = prof.removeLayer(layerNumber)

    if (!was_successful) {
      toast.error('Error deleting layer.')
      return
    }
    setLocalProfile(prof)
  }
  const toggleEditor = (): void => setUseVisualKeyboard((v) => !v)

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Tabs for Layers */}
      <Tabs
        defaultValue="0"
        value={selectedLayerIndex.toString()}
        onValueChange={(val) => setSelectedLayerIndex(Number(val))}
      >
        {/* Tabs List and Layer Controls */}
        <div className="flex items-center justify-between">
          <TabsList>
            {localProfile.layers.map((layer: Layer, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {layer.layer_name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddLayer}>
              Add Layer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDeleteLayer(selectedLayerIndex)}
            >
              Delete Layer
            </Button>
          </div>
        </div>

        {/* Layer Content */}
        {localProfile.layers.map((layer, index) => (
          <TabsContent key={index} value={index.toString()}>
            {useVisualKeyboard ? (
              <VisualKeyboard layer={layer} onSave={() => onSave(localProfile)} />
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

      {/* Start Training Button */}
      <div className="flex justify-end mt-4">
        <Button
          size="sm"
          onClick={() =>
            navigate('/training', {
              state: {
                profile: localProfile,
                layer_index: selectedLayerIndex
              }
            })
          }
        >
          Start Training
        </Button>
      </div>
    </div>
  )
}
