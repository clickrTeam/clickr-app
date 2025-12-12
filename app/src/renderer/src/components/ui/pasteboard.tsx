import React from 'react'
import { Button } from './button'

/// # Example usage:
// <PasteToClipboard text={JSON.stringify(profileController.activeLayer!.toJSON())} />
// <PasteFromClipboard onPaste={(text: string) => {
//   log.debug("Pasting from clipboard: ", text)
//   profileController.importFromString(text)
// }} />

interface PasteToClipboardProps {
  text: string
  children?: React.ReactNode
  onClick?: () => void
}

export const PasteToClipboard: React.FC<PasteToClipboardProps> = ({ text, children, onClick }) => {
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
      onClick?.()
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <Button onClick={handleClick}>
      {children}
    </Button>
  )
}

interface PasteFromClipboardProps {
  onPaste: (text: string) => void
  children?: React.ReactNode
}

export const PasteFromClipboard: React.FC<PasteFromClipboardProps> = ({ onPaste, children }) => {
  const handleClick = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onPaste(text)
    } catch (err) {
      console.error('Failed to read from clipboard:', err)
    }
  }

  return (
    <Button onClick={handleClick}>
      {children}
    </Button>
  )
}
