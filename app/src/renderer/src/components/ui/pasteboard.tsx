import React from 'react'

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
    <button onClick={handleClick}>
      {children}
    </button>
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
    <button onClick={handleClick}>
      {children}
    </button>
  )
}
