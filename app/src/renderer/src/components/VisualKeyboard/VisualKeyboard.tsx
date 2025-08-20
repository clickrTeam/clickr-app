import { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/card'
import { Layer } from '../../../../models/Layer'
import { mainRows, specialtyRows, numpadRows } from './VisualKeyboardLayout'
import { getShortLabel, normalizeKey, getKeyBackground, getKeyClass } from './VisualKeyboardUtil'
import { InspectPopover } from './InspectPopover'
import { VisualKeyboardFooter } from './VisualKeyboardFooter'
import { BindType } from '../../../../models/Bind'

interface VisualKeyboardProps {
  layer: Layer
  maxLayer: number
  onUpdate: (updatedLayer: Layer) => void
}

interface MacroItem {
  key: string
  type: BindType
}

export const VisualKeyboard = ({ layer }: VisualKeyboardProps): JSX.Element => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const [clickedKeys, setClickedKeys] = useState<string[]>([])
  const [inspectedKey, setInspectedKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [macro, setMacro] = useState<MacroItem[]>([])
  const keyRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect((): (() => void) => {
    const handleDown = (e: KeyboardEvent): void => {
      const norm = normalizeKey(e)
      setPressedKeys((prev: string[]) => (prev.includes(norm) ? prev : [...prev, norm]))
    }
    const handleUp = (e: KeyboardEvent): void => {
      const norm = normalizeKey(e)
      setPressedKeys((prev: string[]) => prev.filter((k) => k !== norm))
    }
    const handleBlur = (): void => {
      setPressedKeys((prev: string[]) => prev.filter((k) => k !== 'Win'))
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    window.addEventListener('blur', handleBlur)
    return (): void => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Remove inspect popover on any click
  useEffect((): (() => void) => {
    const handleAnyClick = (): void => setInspectedKey(null)
    window.addEventListener('mousedown', handleAnyClick)
    return (): void => {
      window.removeEventListener('mousedown', handleAnyClick)
    }
  }, [])

  // Listen for keydown to build macro if a key is selected
  useEffect((): (() => void) => {
    if (!selectedKey) return () => {}
    const handleDown = (e: KeyboardEvent): void => {
      const norm = normalizeKey(e)
      setMacro((prev) => [...prev, { key: norm, type: BindType.TapKey }])
    }
    window.addEventListener('keydown', handleDown)
    return (): void => {
      window.removeEventListener('keydown', handleDown)
    }
  }, [selectedKey])

  // Context menu inspect
  const handleContextMenu = (key: string): ((e: React.MouseEvent) => void) => {
    return (e: React.MouseEvent): void => {
      e.preventDefault()
      setInspectedKey(key)
    }
  }
  const handleCloseInspect = (): void => setInspectedKey(null)

  const handleKeyClick = (key: string): void => {
    setClickedKeys([key])
    setSelectedKey(key)
    setMacro([])
  }

  // Helper to render a row of keys
  const renderRow = (
    row: { key: string; width?: number; gapAfter?: boolean }[],
    rowIdx: number
  ): JSX.Element => {
    return (
      <div key={rowIdx} className="flex flex-row mb-1" style={{ gap: '0.25rem' }}>
        {row.map(({ key, width, gapAfter }, idx) => (
          <span key={key || `empty-${idx}`} className="flex items-center">
            <button
              ref={(el) => {
                if (key) keyRefs.current[key] = el
              }}
              type="button"
              disabled={!key}
              className={getKeyClass(key, pressedKeys, clickedKeys)}
              style={{
                minWidth: `${width || 2.25}rem`,
                background: getKeyBackground(key, layer)
              }}
              onClick={key ? (): void => handleKeyClick(key) : undefined}
              onContextMenu={key ? handleContextMenu(key) : undefined}
              tabIndex={key ? 0 : -1}
            >
              {key ? getShortLabel(key) : ''}
            </button>
            {gapAfter && (
              <span
                className="inline-block"
                style={{
                  minWidth: `${width || 0.25 + (2 * 2.25) / 3}rem`
                }}
              />
            )}
          </span>
        ))}
      </div>
    )
  }

  // Render inspect popover
  const renderInspectPopover = (): JSX.Element | null => {
    if (!inspectedKey || !keyRefs.current[inspectedKey]) return null
    // Find all binds for this key
    const binds = Array.from(layer.remappings.entries())
      .filter(([trigger]) => {
        // @ts-expect-error: value is not in base Trigger, but is in subclasses
        return typeof trigger.value === 'string' && trigger.value === inspectedKey
      })
      .map(([, bind]) => bind)
    return (
      <InspectPopover
        inspectedKey={inspectedKey}
        keyRef={keyRefs.current[inspectedKey]}
        binds={binds}
        onClose={handleCloseInspect}
      />
    )
  }

  // Render footer
  const renderFooter = (): JSX.Element | null => {
    return (
      <VisualKeyboardFooter
        selectedKey={selectedKey}
        macro={macro}
        onMacroChange={setMacro}
        onClose={() => {
          setSelectedKey(null)
          setClickedKeys([])
          setMacro([])
        }}
      />
    )
  }

  return (
    <Card
      className="p-4 bg-neutral-100 overflow-auto flex flex-row items-start"
      style={{ position: 'relative' }}
    >
      {renderInspectPopover()}
      <div className="flex flex-col">{mainRows.map(renderRow)}</div>
      <div className="flex flex-col">{specialtyRows.map(renderRow)}</div>
      <div className="flex flex-col">{numpadRows.map(renderRow)}</div>
      {renderFooter()}
    </Card>
  )
}
