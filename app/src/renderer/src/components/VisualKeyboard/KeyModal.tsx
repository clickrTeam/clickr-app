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
}

export const KeyModal: React.FC<KeyModalProps> = ({ onClose, onAddKey }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="vk-key-modal">
      <div className="vk-key-modal-overlay" onClick={onClose} />
      <div className="vk-key-modal-content">
        <h3>Select Key Category</h3>
        <div className="vk-key-modal-categories">
          {Object.keys(keyGroups).map((cat) => (
            <button
              key={cat}
              className={`vk-key-modal-category-btn bg-clickr-light-blue-90 text-white${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {activeCategory && (
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
      </div>
    </div>
  )
}
