import React from 'react'
import { Key }

const qwertyLayout: Key[][] = [
  [
    { mapping: 'Esc', physical_key: 'Escape', time_delay: 0, bind_type: 'tap' },
    { mapping: '1', physical_key: 'Digit1', time_delay: 0, bind_type: 'tap' },
    { mapping: '2', physical_key: 'Digit2', time_delay: 0, bind_type: 'tap' },
    { mapping: '3', physical_key: 'Digit3', time_delay: 0, bind_type: 'tap' },
    { mapping: '4', physical_key: 'Digit4', time_delay: 0, bind_type: 'tap' },
    { mapping: '5', physical_key: 'Digit5', time_delay: 0, bind_type: 'tap' },
    { mapping: '6', physical_key: 'Digit6', time_delay: 0, bind_type: 'tap' },
    { mapping: '7', physical_key: 'Digit7', time_delay: 0, bind_type: 'tap' },
    { mapping: '8', physical_key: 'Digit8', time_delay: 0, bind_type: 'tap' },
    { mapping: '9', physical_key: 'Digit9', time_delay: 0, bind_type: 'tap' },
    { mapping: '0', physical_key: 'Digit0', time_delay: 0, bind_type: 'tap' },
    { mapping: '-', physical_key: 'Minus', time_delay: 0, bind_type: 'tap' },
    { mapping: '=', physical_key: 'Equal', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Backspace', physical_key: 'Backspace', time_delay: 0, bind_type: 'tap' }
  ],
  [
    { mapping: 'Tab', physical_key: 'Tab', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Q', physical_key: 'KeyQ', time_delay: 0, bind_type: 'tap' },
    { mapping: 'W', physical_key: 'KeyW', time_delay: 0, bind_type: 'tap' },
    { mapping: 'E', physical_key: 'KeyE', time_delay: 0, bind_type: 'tap' },
    { mapping: 'R', physical_key: 'KeyR', time_delay: 0, bind_type: 'tap' },
    { mapping: 'T', physical_key: 'KeyT', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Y', physical_key: 'KeyY', time_delay: 0, bind_type: 'tap' },
    { mapping: 'U', physical_key: 'KeyU', time_delay: 0, bind_type: 'tap' },
    { mapping: 'I', physical_key: 'KeyI', time_delay: 0, bind_type: 'tap' },
    { mapping: 'O', physical_key: 'KeyO', time_delay: 0, bind_type: 'tap' },
    { mapping: 'P', physical_key: 'KeyP', time_delay: 0, bind_type: 'tap' },
    { mapping: '[', physical_key: 'BracketLeft', time_delay: 0, bind_type: 'tap' },
    { mapping: ']', physical_key: 'BracketRight', time_delay: 0, bind_type: 'tap' },
    { mapping: '\\', physical_key: 'Backslash', time_delay: 0, bind_type: 'tap' }
  ],
  [
    { mapping: 'Caps', physical_key: 'CapsLock', time_delay: 0, bind_type: 'tap' },
    { mapping: 'A', physical_key: 'KeyA', time_delay: 0, bind_type: 'tap' },
    { mapping: 'S', physical_key: 'KeyS', time_delay: 0, bind_type: 'tap' },
    { mapping: 'D', physical_key: 'KeyD', time_delay: 0, bind_type: 'tap' },
    { mapping: 'F', physical_key: 'KeyF', time_delay: 0, bind_type: 'tap' },
    { mapping: 'G', physical_key: 'KeyG', time_delay: 0, bind_type: 'tap' },
    { mapping: 'H', physical_key: 'KeyH', time_delay: 0, bind_type: 'tap' },
    { mapping: 'J', physical_key: 'KeyJ', time_delay: 0, bind_type: 'tap' },
    { mapping: 'K', physical_key: 'KeyK', time_delay: 0, bind_type: 'tap' },
    { mapping: 'L', physical_key: 'KeyL', time_delay: 0, bind_type: 'tap' },
    { mapping: ';', physical_key: 'Semicolon', time_delay: 0, bind_type: 'tap' },
    { mapping: "'", physical_key: 'Quote', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Enter', physical_key: 'Enter', time_delay: 0, bind_type: 'tap' }
  ],
  [
    { mapping: 'Shift', physical_key: 'ShiftLeft', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Z', physical_key: 'KeyZ', time_delay: 0, bind_type: 'tap' },
    { mapping: 'X', physical_key: 'KeyX', time_delay: 0, bind_type: 'tap' },
    { mapping: 'C', physical_key: 'KeyC', time_delay: 0, bind_type: 'tap' },
    { mapping: 'V', physical_key: 'KeyV', time_delay: 0, bind_type: 'tap' },
    { mapping: 'B', physical_key: 'KeyB', time_delay: 0, bind_type: 'tap' },
    { mapping: 'N', physical_key: 'KeyN', time_delay: 0, bind_type: 'tap' },
    { mapping: 'M', physical_key: 'KeyM', time_delay: 0, bind_type: 'tap' },
    { mapping: ',', physical_key: 'Comma', time_delay: 0, bind_type: 'tap' },
    { mapping: '.', physical_key: 'Period', time_delay: 0, bind_type: 'tap' },
    { mapping: '/', physical_key: 'Slash', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Shift', physical_key: 'ShiftRight', time_delay: 0, bind_type: 'tap' }
  ],
  [
    { mapping: 'Ctrl', physical_key: 'ControlLeft', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Meta', physical_key: 'MetaLeft', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Alt', physical_key: 'AltLeft', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Space', physical_key: 'Space', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Alt', physical_key: 'AltRight', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Fn', physical_key: 'Fn', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Menu', physical_key: 'ContextMenu', time_delay: 0, bind_type: 'tap' },
    { mapping: 'Ctrl', physical_key: 'ControlRight', time_delay: 0, bind_type: 'tap' }
  ]
]

// const Layer: React.FC = () => {
//   const [remappings, setRemappings] = React.useState<Record<string, string>>({})

//   return (
//     <div className="p-4 bg-gray-900 text-white space-y-2 font-mono">
//       {keyboardRows.map((row, rowIdx) => (
//         <div key={rowIdx} className="flex gap-1 justify-center">
//           {row.map((key) => (
//             <button
//               key={key.physical_key}
//               className="bg-gray-700 hover:bg-gray-600 text-sm rounded px-3 py-2 w-fit min-w-[48px]"
//               onClick={() => {
//                 // Do something with key.code
//               }}
//             >
//               {key.label}
//             </button>
//           ))}
//         </div>
//       ))}
//     </div>
//   )
// }
