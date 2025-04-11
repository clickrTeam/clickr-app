export type BindType = 'tap' | 'hold' | 'macro' | 'double tap'

/**
 * Represents a physical key on the keyboard
 */
export type Key = {
  /**
   * Shorthand for the key for displaying on the GUI. escape => esc
   */
  label: string

  /**
   * The actual key represented. 'Escape'
   */
  physical_key: string
}

/**
 * Represents the desired bind to be associated with a key
 */
export type Bind = {
  /**
   * The values that will be remapped. May be multiple. [Ctrl, Alt, Del]
   */
  values: string[]

  /**
   * Type of the bind. Tap, macro, double tap, etc.
   */
  bind_type: string

  /**
   * Delay in ms before activating the bind. Default to 0.
   */
  time_delay: number
}
