import React from 'react'
import { getShortLabel } from './Util'
import { KeyTileModel } from './Model'
import { getBindColor } from './Colors'
import './KeyTile.css'

interface KeyTileProps {
  keyModel: KeyTileModel
  onClick: () => void
  onInspect: (keyModel: KeyTileModel | null) => void
}

export const KeyTile: React.FC<KeyTileProps> = ({ keyModel, onClick, onInspect }) => {
  if (keyModel.key === '') {
    return (
      <span className="flex items-center">
        <span
          className="inline-block"
          style={{
            minWidth: keyModel.displayWidth
          }}
        />
        {keyModel.gapAfter !== '0rem' && (
          <span
            className="inline-block"
            style={{
              minWidth: keyModel.gapAfter
            }}
          />
        )}
      </span>
    )
  }

  return (
    <span className="flex items-center">
      <button
        ref={(el) => {
          keyModel.keyRef = el
        }}
        type="button"
        className={keyModel.className}
        style={{
          minWidth: keyModel.displayWidth,
          background: getBindColor(keyModel.mapped)
        }}
        onClick={onClick}
        onMouseEnter={() => onInspect(keyModel)}
        onMouseLeave={() => onInspect(null)}
      >
        {getShortLabel(keyModel.key)}
      </button>
      {keyModel.gapAfter !== '0rem' && (
        <span
          className="inline-block"
          style={{
            minWidth: keyModel.gapAfter
          }}
        />
      )}
    </span>
  )
}
