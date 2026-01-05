import React from 'react'

interface MacroButtonProps {
  label?: string | React.ReactNode
  onClick: () => void
  background?: string
  className?: string
  isSelected?: boolean
  disabled?: boolean
  variant?: 'default' | 'danger' | 'small'
}

export const MacroButton: React.FC<MacroButtonProps> = ({
  label = '+',
  onClick,
  background,
  className = '',
  isSelected = false,
  disabled = false,
  variant = 'default'
}) => {
  const baseClasses = 'vk-footer-macro-btn'
  const selectedClass = isSelected ? 'selected' : ''

  let variantClasses = ''
  let variantStyles: React.CSSProperties = {}

  if (variant === 'small') {
    variantStyles = {
      fontWeight: 'bold',
      fontSize: 18,
      padding: '0 0.7rem'
    }
  } else if (variant === 'danger') {
    variantClasses = 'bg-red-500 hover:bg-red-600'
  }

  return (
    <button
      className={`${baseClasses} ${selectedClass} ${variantClasses} ${className}`.trim()}
      style={background ? { background, ...variantStyles } : variantStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
