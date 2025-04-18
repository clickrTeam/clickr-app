import React from 'react'
import * as TB from '../../../models/Trigger_and_Bind'
import { Layer } from '../../../models/Layer'
import { Bind } from '../../../models/Trigger_and_Bind'
import { defaultQwertyLayout } from '../../../models/DefaultLayout'

interface LayerProps {
  layer: Layer
}
//TODO: Rework this class. This implementation is not complete and not working.

const LayerUI: React.FC<LayerProps> = ({ layer }) => {
  const findBindForKey = (keyTrigger: TB.Trigger): Bind | undefined => {
    return layer.getRemapping(keyTrigger)
  }

  return (
    <div className="flex flex-col gap-2">
      {defaultQwertyLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((trigger, colIndex) => {
            const bind = findBindForKey(trigger)
            return (
              <div
                key={colIndex}
                className="border border-gray-500 px-3 py-2 rounded-md bg-gray-100 text-sm"
              >
                {trigger.value}
                <br />
                {bind ? bind.constructor.name : 'No bind'}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default LayerUI