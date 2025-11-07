import React, {useEffect, useMemo, useState} from 'react'
import { getShortLabel } from './Util'
import { KeyTileModel } from './Model'
import { getTriggerColor } from './Colors'
import './KeyTile.css'
import { Bind } from 'src/models/Bind'
import { Trigger } from 'src/models/Trigger'

interface KeyTileProps {
  keyModel: KeyTileModel
  onClick: () => void
  onInspect: (keyModel: KeyTileModel | null) => void
}

export const KeyTile: React.FC<KeyTileProps> = ({ keyModel, onClick, onInspect }) => {
  const [mounted, setMounted] = useState(false)

  // Stable-ish per-key delay so tiles don't all animate at once
  const delay = useMemo(() => {
    const s = keyModel.key || ''
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
    const d = Math.abs(h) % 300
    return d
  }, [keyModel.key])

  useEffect(() => {
    // small timeout ensures mount transition is applied
    const t = setTimeout(() => setMounted(true), 20)
    return () => clearTimeout(t)
  }, [])

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
    <span className="flex items-center" style={{ transform: `translateY(${((keyModel.gridRowSpan - 1) * 22)}px)` }}>
      <button
        ref={(el) => {
          keyModel.keyRef = el
        }}
        type="button"
  className={`${keyModel.className} vk-wiggle-hover`}
        style={{
          width: keyModel.displayWidth,
          background: getTriggerColor(keyModel.mapped),
          opacity: mounted ? 1 : 0,
          transform: `translateY(${(mounted ? 0 : 6)}px)`,
          transition: `opacity 360ms ease ${delay}ms, transform 360ms cubic-bezier(.2,.9,.2,1) ${delay}ms`,
          minHeight: `calc(${keyModel.gridRowSpan}00% + ${(keyModel.gridRowSpan - 1) * 4}px)`,
          overflow: 'clip'
        }}
        onClick={onClick}
        onMouseEnter={() => onInspect(keyModel)}
        onMouseLeave={() => onInspect(null)}
      >
        {keyModel.displayKey ? (
          <b>{getShortLabel(keyModel.displayKey)}</b>
        ) : (
          getShortLabel(keyModel.key)
        )}
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
