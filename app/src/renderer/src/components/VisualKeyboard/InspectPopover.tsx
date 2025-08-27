import React from 'react'
import { KeyTileModel } from './Model'
import './InspectPopover.css'

interface InspectPopoverProps {
  inspectedKey: KeyTileModel
  onClose: () => void
}

export const InspectPopover: React.FC<InspectPopoverProps> = ({ inspectedKey, onClose }) => {
  const rect = inspectedKey.keyRef?.getBoundingClientRect()
  const binds = inspectedKey.mapped.map(([, bind]) => bind)
  if (!rect) return null
  return (
    <div
      className="inspect-popover"
      style={{
        left: rect.left + rect.width + 8,
        top: rect.top
      }}
      onClick={onClose}
    >
      <div className="inspect-popover-title">Bindings for {inspectedKey.key}</div>
      {binds.length === 0 ? (
        <div>No bindings</div>
      ) : (
        <ul className="inspect-popover-list">
          {binds.map((b, i) => (
            <li key={i}>{b.toString()}</li>
          ))}
        </ul>
      )}
      <div className="inspect-popover-close">(Click to close)</div>
    </div>
  )
}
