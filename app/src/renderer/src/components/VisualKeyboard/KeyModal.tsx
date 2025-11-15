import React, { useState } from 'react'
import './KeyModal.css'
import { KeyPressInfo } from './Model'
import {
  Letters,
  Digits,
  Modifier,
  Symbols,
  Navigation,
  Function,
  ShortcutAction,
  Numpad,
  Misc,
  os_keys,
  KeyedSymbols
} from '../../../../models/Keys.enum'
import { detectOS } from '../../../../models/Profile'
import { Layer } from '../../../../models/Layer'
import { ProfileController } from './ProfileControler'
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'

const current_OS = detectOS()

const keyGroupsBase: Record<string, string[]> = {
  Letters: Object.values(Letters),
  Digits: Object.values(Digits),
  Modifier: Object.values(Modifier),
  Navigation: Object.values(Navigation),
  Function: Object.values(Function),
  Numpad: Object.values(Numpad),
  Misc: Object.values(Misc),
  [current_OS + ' Keys']: Object.values(os_keys)
};


interface KeyModalProps {
  onClose: (as_cancel: boolean) => void
  onAddKey: (key: KeyPressInfo) => void
  keyOnly?: boolean
  onSelectLayer?: (layerIndex: number) => void
  onAddRunScriptBind?: (interpreter: string, script: string) => void
  profileController: ProfileController
}

export const KeyModal: React.FC<KeyModalProps> = ({
  onClose,
  onAddKey,
  keyOnly,
  onSelectLayer,
  onAddRunScriptBind,
  profileController,
}) => {
  const layers = profileController.getProfile().layers
  const currentLayerIndex = profileController.activeLayer!.layer_number

  const [interpretor, setInterpretor] = useState<string | undefined>()
  const [script, setScript] = useState<string | undefined>()

  const [keyCategory, setKeyCategory] = useState<string | null>(null)
  const resolvedActiveLayerIndex = ((): number => {
    if (typeof currentLayerIndex === 'number' && !Number.isNaN(currentLayerIndex)) {
      return currentLayerIndex
    }
    return 0
  })()

  const keyGroups: Record<string, string[]> = {
    ...keyGroupsBase,
    ...(keyOnly ? {} : { Shortcuts: Object.values(ShortcutAction) }),
    ...(keyOnly ? { Shortcuts: Object.values(KeyedSymbols) }
      : { Shortcuts: [...Object.values(Symbols), ...Object.values(KeyedSymbols)] })
  };

  // otherLayers excludes the resolved active layer
  const otherLayers = layers
    .map((l, idx) => ({ layer: l, idx }))
    .filter(({ idx }) => idx !== resolvedActiveLayerIndex)

  return (
    <div className="vk-key-modal">
      <div className="vk-key-modal-overlay" onClick={() => onClose(true)} />
      <div className="vk-key-modal-content">
        <h3>Select Key Category</h3>

        <div className="vk-key-modal-categories">
          {Object.keys(keyGroups).map((cat) => (
            <button
              key={cat}
              className={`vk-key-modal-category-btn bg-clickr-light-blue-90 text-white${
                keyCategory === cat ? ' active' : ''
              }`}
              onClick={() => setKeyCategory(cat)}
            >
              {cat}
            </button>
          ))}

          { !keyOnly && (
            <button
              key="Layers"
              className={`vk-key-modal-category-btn bg-clickr-light-blue-90 text-white${
                keyCategory === 'Layers' ? ' active' : ''
              }`}
              onClick={() => setKeyCategory('Layers')}
            >
              Layers
            </button>
          )}
          { !keyOnly && (
            <button
              key="RunScript"
              className={`vk-key-modal-category-btn bg-clickr-light-blue-90 text-white${
                keyCategory === 'RunScript' ? ' active' : ''
              }`}
              onClick={() => setKeyCategory('RunScript')}
            >
              Script
            </button>
          )}
        </div>

        {keyCategory && keyCategory !== 'Layers' && keyCategory !== 'RunScript' && (
          <div className="vk-key-modal-dropdown">
            {keyGroups[keyCategory].map((key) => (
              <button
                key={key}
                className="vk-footer-macro-dropdown-btn"
                onClick={() => {
                  onAddKey({ key, isDown: true })
                  onClose(false)
                  setKeyCategory(null)
                }}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {keyCategory === 'Layers' && (
          <div className="vk-key-modal-dropdown">
            {otherLayers.length === 0 ? (
              <div className="vk-key-modal-no-layers">No Layers to switch to.</div>
            ) : (
              otherLayers.map(({ layer, idx }) => {
                const label = (layer as Layer).layer_name ?? `Layer ${idx}`
                return (
                  <button
                    key={idx}
                    className="vk-footer-macro-dropdown-btn"
                    onClick={() => {
                      if (!!onSelectLayer) {
                        onSelectLayer(idx)
                      }
                      onClose(false)
                      setKeyCategory(null)
                    }}
                  >
                    {label}
                  </button>
                )
              })
            )}
          </div>
        )}

        {keyCategory === 'RunScript' && (
          <div className="vk-key-modal-dropdown">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Input placeholder="Interpretor Name" onChange={(e) => { setInterpretor(e.target.value) }} />
              <Textarea placeholder="Type your script here" onChange={(e) => { setScript(e.target.value) }} />
              <button onClick={() => {
                if (!!script && !!interpretor && !!onAddRunScriptBind) {
                  onAddRunScriptBind(script, interpretor)
                } else {
                  toast.warning("Run Script Bind missing script or language, please provide or add a diffrent bind.")
                }
              }}>Add this bind</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
