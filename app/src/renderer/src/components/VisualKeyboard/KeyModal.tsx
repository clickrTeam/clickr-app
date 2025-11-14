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
} from '../../../../models/Keys'
import { detectOS } from '../../../../models/Profile'
import { Layer } from '../../../../models/Layer'
import { ProfileController } from './ProfileControler'

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
  profileController: ProfileController
}

export const KeyModal: React.FC<KeyModalProps> = ({
  onClose,
  onAddKey,
  keyOnly,
  onSelectLayer,
  profileController,
}) => {
  const layers = profileController.getProfile().layers
  const currentLayerIndex = profileController.activeLayer!.layer_number

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
        </div>

        {keyCategory && keyCategory !== 'Layers' && (
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
      </div>
    </div>
  )
}
