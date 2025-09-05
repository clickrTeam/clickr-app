import { Layer } from '../../../models/Layer'
import { Button } from './ui/button'
import { Card, CardHeader, CardContent } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import CreateMappingDialog from './CreateModification'
import { useState } from 'react'
import { Input } from './ui/input'
import { Trigger } from '../../../models/Trigger'
import { Bind } from '../../../models/Bind'
import { Modification } from '../../../models/Modification'
import { AdvancedModificaiton } from 'src/models/Modification'

interface LayerComponentProps {
  layer: Layer
  maxLayer: number
  onUpdate: (updatedLayer: Layer) => void
}

export const LayerComponent = ({ layer, maxLayer, onUpdate }: LayerComponentProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddMapping = (trigger: Trigger, bind: Bind) => {
    const newLayer = new Layer(layer.layer_name, [...layer.remappings])
    newLayer.remappings.push(new AdvancedModificaiton(trigger, bind))
    onUpdate(newLayer)
    setIsDialogOpen(false)
  }

  const handleDeleteMapping = (index: number) => {
    const newLayer = new Layer(layer.layer_name, [...layer.remappings])
    newLayer.deleteRemapping(index)
    onUpdate(newLayer)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-4">
          <Input
            value={layer.layer_name}
            onChange={(e) => {
              const newLayer = new Layer(
                e.target.value,
                [...layer.remappings]
              )
              onUpdate(newLayer)
            }}
            className="w-48"
          />
          <span className="text-sm text-muted-foreground">Layer {layer.layer_name}</span>
        </div>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          Add Mapping
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {Array.from(layer.remappings.entries()).map(([trigger, bind], index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">
              {trigger.toString()} → {bind.toString()}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="sm">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteMapping(index)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>

      <CreateMappingDialog
        isOpen={isDialogOpen}
        maxLayer={maxLayer}
        onCancel={() => setIsDialogOpen(false)}
        onCreate={handleAddMapping}
      />
    </Card>
  )
}
