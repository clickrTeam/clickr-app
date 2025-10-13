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
  os_keys
} from '../../../../models/Keys'
import { detectOS } from '../../../../models/Profile'
import { Layer } from '../../../../models/Layer'

const current_OS = detectOS()

const keyGroups: Record<string, string[]> = {
  Letters: Object.values(Letters),
  Digits: Object.values(Digits),
  Modifier: Object.values(Modifier),
  Symbols: Object.values(Symbols),
  Navigation: Object.values(Navigation),
  Function: Object.values(Function),
  Shortcuts: Object.values(ShortcutAction),
  Numpad: Object.values(Numpad),
  Misc: Object.values(Misc),
  [current_OS + ' Keys']: Object.values(os_keys)
}

interface KeyModalProps {
  onClose: () => void
  onAddKey: (key: KeyPressInfo) => void
  onSelectLayer?: (layerIndex: number) => void
  layers: Layer[]
  activeLayer: Layer
  currentLayerIndex: number
}

export const KeyModal: React.FC<KeyModalProps> = ({
  onClose,
  onAddKey,
  onSelectLayer,
  layers,
  currentLayerIndex
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const resolvedActiveLayerIndex = ((): number => {
    if (typeof currentLayerIndex === 'number' && !Number.isNaN(currentLayerIndex)) {
      return currentLayerIndex
    }
    return 0
  })()

  // otherLayers excludes the resolved active layer
  const otherLayers = layers
    .map((l, idx) => ({ layer: l, idx }))
    .filter(({ idx }) => idx !== resolvedActiveLayerIndex)

  return (
    <div className="vk-key-modal">
      <div className="vk-key-modal-overlay" onClick={onClose} />
      <div className="vk-key-modal-content">
        <h3>Select Key Category</h3>

        <div className="vk-key-modal-categories">
          {Object.keys(keyGroups).map((cat) => (
            <button
              key={cat}
              className={`vk-key-modal-category-btn bg-clickr-light-blue-90 text-white${
                activeCategory === cat ? ' active' : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}

          <button
            key="Layers"
            className={`vk-key-modal-category-btn bg-clickr-light-blue-90 text-white${
              activeCategory === 'Layers' ? ' active' : ''
            }`}
            onClick={() => setActiveCategory('Layers')}
          >
            Layers
          </button>
        </div>

        {activeCategory && activeCategory !== 'Layers' && (
          <div className="vk-key-modal-dropdown">
            {keyGroups[activeCategory].map((key) => (
              <button
                key={key}
                className="vk-footer-macro-dropdown-btn"
                onClick={() => {
                  onAddKey({ key, isDown: true })
                  onClose()
                  setActiveCategory(null)
                }}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {activeCategory === 'Layers' && (
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
                      if (typeof onSelectLayer === 'function') {
                        onSelectLayer(idx)
                      } else {
                        onAddKey({ key: label, isDown: true })
                      }
                      onClose()
                      setActiveCategory(null)
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
