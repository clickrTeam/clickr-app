import React from 'react'
import { KeyTileModel } from './Model'

interface InspectPopoverProps {
  inspectedKey: KeyTileModel
  onClose: () => void
}

export const InspectPopover: React.FC<InspectPopoverProps> = ({ inspectedKey, onClose }) => {
  const rect = inspectedKey.keyRef?.getBoundingClientRect()
  // Assuming 'inspectedKey' has a 'binds' property; adjust as needed
  const binds = inspectedKey.mapped.map(([, bind]) => bind)
  if (!rect) return null
  return (
    <div
      style={{
        position: 'fixed',
        left: rect.left + rect.width + 8,
        top: rect.top,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
      onClick={onClose}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Bindings for {inspectedKey}</div>
      {binds.length === 0 ? (
        <div>No bindings</div>
      ) : (
        <ul style={{ fontSize: 13, margin: 0, padding: 0 }}>
          {binds.map((b, i) => (
            <li key={i}>{b.toString()}</li>
          ))}
        </ul>
      )}
      <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>(Click to close)</div>
    </div>
  )
}
