import { Profile } from '../../../models/Profile'
import { Layer } from '../../../models/Layer'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { VisualKeyboard } from './VisualKeyboard/VisualKeyboard'
import { LayerComponent } from './LayerComponent'
import log from 'electron-log'
import { useNavigate } from 'react-router-dom'
import profileController from './VisualKeyboard/ProfileControler'
import { SuggestedRemapping } from '../pages/Insights'
import { RecommendationsSidebar } from './RecommendationsSidebar'
import { Sparkles } from 'lucide-react'
import { Input } from './ui/input'
import './profileEditor.css'

interface ProfileEditorProps {
  onBack: () => void
  fromInsights?: boolean
}

export const ProfileEditor = ({
  onBack,
  fromInsights = false
}: ProfileEditorProps): JSX.Element => {
  const [localProfile, setLocalProfile] = useState(profileController.getProfile())
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)
  const [useVisualKeyboard, setUseVisualKeyboard] = useState(true)
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false)
  const deleteButtonRef = useRef<HTMLDivElement>(null)
  const [editLayerName, setEditLayerName] = useState(false)
  const navigate = useNavigate()
  const [hoveredRemapping, setHoveredRemapping] = useState<SuggestedRemapping | null>(null)
  const [recommendations, setRecommendations] = useState<SuggestedRemapping[]>([])
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [autoshiftEnabledMap, setAutoshiftEnabledMap] = useState<Record<number, boolean>>({})
  const [isAutoshiftModalOpen, setIsAutoshiftModalOpen] = useState(false)
  const [autoshiftDelay, setAutoshiftDelay] = useState(150)

  // Load recommendations from main process storage on mount
  useEffect(() => {
    const loadRecommendations = async (): Promise<void> => {
      try {
        // Load from main process storage
        const stored = await window.api.getRecommendations()
        const storedId = await window.api.getSelectedRecommendationId()

        if (stored && stored.length > 0) {
          setRecommendations(stored)
          setSelectedRecommendationId(storedId)
          // Only auto-open sidebar if navigation came from Insights page
          if (fromInsights) {
            setSidebarOpen(true)
          }
        }
      } catch (error) {
        log.error('Failed to load recommendations:', error)
      }
    }

    loadRecommendations()
  }, [fromInsights])

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
    next.addLayer('Layer ' + (next.layers.length + 1))

    setSelectedLayerIndex(next.layers.length - 1)
    setLocalProfile(next)
    setIsDeleteConfirming(false)
  }

  useEffect(() => {
    profileController.profile = localProfile
    profileController.setLayer(selectedLayerIndex)
    setIsDeleteConfirming(false) // Reset confirmation when layer changes
  }, [localProfile, profileController, selectedLayerIndex])

  // Reset delete confirmation when clicking outside the button
  useEffect(() => {
    if (!isDeleteConfirming) return

    const handleClickOutside = (event: MouseEvent): void => {
      if (deleteButtonRef.current && !deleteButtonRef.current.contains(event.target as Node)) {
        setIsDeleteConfirming(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteConfirming])

  const handleDeleteLayer = (layerNumber: number): void => {
    log.debug('Deleting layer at index:', layerNumber)
    const prof = Profile.fromJSON(localProfile.toJSON())
    const was_successful = prof.removeLayer(layerNumber)

    if (!was_successful) {
      toast.error('Error deleting layer.')
      setIsDeleteConfirming(false)
      return
    }
    setSelectedLayerIndex(prof.layers.length - 1)
    setLocalProfile(prof)
    setIsDeleteConfirming(false)
  }

  const handleDeleteClick = (): void => {
    if (isDeleteConfirming) {
      handleDeleteLayer(selectedLayerIndex)
    } else {
      setIsDeleteConfirming(true)
    }
  }

  const handleDuplicateLayer = (layerNumber: number): void => {
    log.debug('Duplicating layer at index:', layerNumber)
    const prof = Profile.fromJSON(localProfile.toJSON())
    prof.duplicateLayer(layerNumber)
    setSelectedLayerIndex(prof.layers.length - 1)
    setLocalProfile(prof)
    setIsDeleteConfirming(false)
  }

  const toggleEditor = (): void => setUseVisualKeyboard((v) => !v)

  // Delete a recommendation
  const handleDeleteRecommendation = async (remappingId: string): Promise<void> => {
    const updatedRecommendations = recommendations.filter((r) => r.id !== remappingId)
    setRecommendations(updatedRecommendations)
    await window.api.saveRecommendations(updatedRecommendations)

    if (selectedRecommendationId === remappingId) {
      setSelectedRecommendationId(null)
      await window.api.saveSelectedRecommendationId(null)
    }

    // Clear hover state if the deleted recommendation was being hovered
    // or if there are no recommendations left
    if (updatedRecommendations.length === 0 || hoveredRemapping?.id === remappingId) {
      setHoveredRemapping(null)
    }

    toast.success('Recommendation removed')
  }

  return (
    <div className="space-y-6 relative">
      {/* Recommendations Sidebar */}
      <RecommendationsSidebar
        recommendations={recommendations}
        selectedRecommendationId={selectedRecommendationId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onHover={setHoveredRemapping}
        onLeave={() => setHoveredRemapping(null)}
        onDelete={handleDeleteRecommendation}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{localProfile.profile_name}</h2>
        <div className="flex items-center gap-2">
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
                state: {
                  profile: latest,
                  layer_index: selectedLayerIndex
                }
              })
            }}
          >
            Start Training
          </Button>
          {/* Recommendations toggle button - icon only */}
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8"
              title="Show Recommendations"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={selectedLayerIndex.toString()}
        onValueChange={(val) => setSelectedLayerIndex(Number(val))}
      >
        <div className="flex items-center justify-between">
          <div className="max-w-[60vw] overflow-x-auto whitespace-nowrap flex row layer-tabs">
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
          </div>
          <div className="flex gap-2">
            <div className="edit-layer-name ml-4">
              {editLayerName ? (
                <div className="flex gap-2 items-center">
                  <Input
                    autoFocus
                    defaultValue={profileController.activeLayer!.layer_name}
                    onChange={(e) => {
                      profileController.setLayerName(e.target.value)
                      setLocalProfile(Profile.fromJSON(profileController.getProfile().toJSON()))
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

              {/* Autoshift toggle button */}
              <Button
                size="sm"
                className="ml-2"
                onClick={() => {
                  if (autoshiftEnabledMap[selectedLayerIndex]) {
                    // Disable autoshift
                    profileController.disableAutoShift()
                    setAutoshiftEnabledMap((prev) => ({
                      ...prev,
                      [selectedLayerIndex]: false
                    }))
                  } else {
                    // Open modal to configure delay
                    setAutoshiftDelay(150)
                    setIsAutoshiftModalOpen(true)
                  }
                }}
              >
                {autoshiftEnabledMap[selectedLayerIndex] ? 'Disable Autoshift' : 'Enable Autoshift'}
              </Button>
            </div>
            <Button size="sm" onClick={handleAddLayer}>
              Add Layer
            </Button>
            <Button size="sm" onClick={() => handleDuplicateLayer(selectedLayerIndex)}>
              Duplicate Layer
            </Button>
            <div ref={deleteButtonRef}>
              <Button
                variant={isDeleteConfirming ? 'outline' : 'destructive'}
                size="sm"
                onClick={handleDeleteClick}
                className={
                  isDeleteConfirming
                    ? 'bg-red-600 hover:bg-red-400 text-white border-red-700 hover:border-red-800 transition-all duration-200 font-medium'
                    : ''
                }
              >
                {isDeleteConfirming ? 'Are you sure?' : 'Delete Layer'}
              </Button>
            </div>
          </div>
        </div>
        {useVisualKeyboard ? (
          <VisualKeyboard
            key={`${localProfile.profile_name}-${selectedLayerIndex}`}
            hoveredRemapping={hoveredRemapping}
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
      {isAutoshiftModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Set Autoshift Delay</h3>
            <input
              type="range"
              min={50}
              max={500}
              value={autoshiftDelay}
              onChange={(e) => setAutoshiftDelay(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-2 text-center">{autoshiftDelay} ms</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAutoshiftModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  profileController.enableAutoshiftOnLayer(autoshiftDelay)
                  setAutoshiftEnabledMap((prev) => ({
                    ...prev,
                    [selectedLayerIndex]: true
                  }))
                  setIsAutoshiftModalOpen(false)
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
