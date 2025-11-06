import { Profile } from '../../../models/Profile'
import { Layer } from '../../../models/Layer'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { VisualKeyboard } from './VisualKeyboard/VisualKeyboard'
import { LayerComponent } from './LayerComponent'
import log from 'electron-log'
import { useNavigate } from 'react-router-dom'
import profileController from './VisualKeyboard/ProfileControler'
import { Input } from './ui/input'
import './profileEditor.css'

interface ProfileEditorProps {
  onBack: () => void
}

export const ProfileEditor = ({ onBack }: ProfileEditorProps): JSX.Element => {
  const [localProfile, setLocalProfile] = useState(profileController.getProfile())
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)
  const [useVisualKeyboard, setUseVisualKeyboard] = useState(true)
  const [editLayerName, setEditLayerName] = useState(false)
  const navigate = useNavigate()

  profileController.setLayer(selectedLayerIndex) // Hack to keep the active layer on construct.

  const handleLayerUpdate = (layerIndex: number, updatedLayer: Layer): void => {
    log.debug('Updating layer at index:', layerIndex)
    const next = Profile.fromJSON(localProfile.toJSON())
    next.layers[layerIndex] = updatedLayer
    setLocalProfile(next)
  }

  const handleAddLayer = (): void => {
    log.debug('Adding new layer')
    const next = Profile.fromJSON(localProfile.toJSON())
    next.addLayer('Layer ' + next.layers.length)

    setSelectedLayerIndex(next.layers.length - 1)
    setLocalProfile(next)
  }

  useEffect(() => {
    profileController.profile = localProfile
    profileController.setLayer(selectedLayerIndex)
  }, [localProfile, profileController, selectedLayerIndex])

  const confirmDeleteLayer = (layerNumber: number): void => {
    toast('Are you sure you want to delete this layer?', {
      action: {
        label: 'Delete',
        onClick: () => handleDeleteLayer(layerNumber)
      },
      cancel: {
        label: 'Cancel',
        onClick: () => { }
      }
    })
  }

  const handleDeleteLayer = (layerNumber: number): void => {
    log.debug('Deleting layer at index:', layerNumber)
    const prof = Profile.fromJSON(localProfile.toJSON())
    const was_successful = prof.removeLayer(layerNumber)

    if (!was_successful) {
      toast.error('Error deleting layer.')
      return
    }
    setSelectedLayerIndex(prof.layers.length - 1)
    setLocalProfile(prof)
  }

  const handleDuplicateLayer = (layerNumber: number): void => {
    log.debug('Duplicating layer at index:', layerNumber)
    const prof = Profile.fromJSON(localProfile.toJSON())
    prof.duplicateLayer(layerNumber)
    setSelectedLayerIndex(prof.layers.length - 1)
    setLocalProfile(prof)
  }

  const toggleEditor = (): void => setUseVisualKeyboard((v) => !v)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{localProfile.profile_name}</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              profileController.onSave()
              onBack()
            }}
          >
            Back
          </Button>
          <Button onClick={toggleEditor}>
            {useVisualKeyboard ? 'Traditional Editor' : 'Visual Editor'}
          </Button>
          <Button
            onClick={() => {
              const latest = profileController.getProfile()
              navigate('/training', {
                state: { profile: latest, layer_index: selectedLayerIndex }
              })
            }}
          >
            Start Training
          </Button>
        </div>
      </div>

      <Tabs
        value={selectedLayerIndex.toString()}
        onValueChange={(val) => setSelectedLayerIndex(Number(val))}
      >
        <div className="flex items-center justify-between layer-control-bar">
          <div className="flex row layer-tabs">
            <TabsList>
              {localProfile.layers.map((layer: Layer, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  onClick={() => profileController.setLayer(index)}
                >
                  {layer.layer_name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="edit-layer-name ml-4">
              {editLayerName ? (
                <div className="flex gap-2 items-center">
                  <Input
                    autoFocus
                    defaultValue={profileController.activeLayer!.layer_name}
                    onChange={(e) => {
                      profileController.setLayerName(e.target.value);
                      setLocalProfile(Profile.fromJSON(profileController.getProfile().toJSON()));
                    }}
                    className="w-48"
                  />
                  <Button size="sm" onClick={() => setEditLayerName(false)}>
                    Done
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setEditLayerName(true)}>
                  Edit Layer Name
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddLayer}>
              Add Layer
            </Button>
            <Button size="sm" onClick={() => handleDuplicateLayer(selectedLayerIndex)}>
              Duplicate Layer
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
        {useVisualKeyboard ? (
          <VisualKeyboard
            key={`${localProfile.profile_name}-${selectedLayerIndex}`}
          />
        ) : (
          <div>
            {localProfile.layers.map((layer, index) => (
              <TabsContent key={index} value={index.toString()}>
                <LayerComponent
                  layer={layer}
                  maxLayer={profileController.getProfile().layers.length}
                  onUpdate={(updatedLayer) => handleLayerUpdate(index, updatedLayer)}
                />
              </TabsContent>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  )
}
