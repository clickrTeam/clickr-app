import { Layer } from '../../../models/Layer'
import { Button } from './ui/button'
import { Card, CardHeader, CardContent } from './ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import CreateMappingDialog from './CreateModification'
import { useState } from 'react'
import { Input } from './ui/input'
import { Trigger } from '../../../models/Trigger'
import { Bind } from '../../../models/Bind'

interface LayerComponentProps {
  layer: Layer,
  maxLayer: number,
  onUpdate: (updatedLayer: Layer) => void
}

export const LayerComponent = ({ layer, maxLayer, onUpdate }: LayerComponentProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddMapping = (trigger: Trigger, bind: Bind) => {
    const newLayer = new Layer(layer.layer_name, layer.layer_number, new Map(layer.remappings))
    newLayer.addRemapping(trigger, bind)
    onUpdate(newLayer)
    setIsDialogOpen(false)
  }

  const handleDeleteMapping = (trigger: Trigger) => {
    const newLayer = new Layer(layer.layer_name, layer.layer_number, new Map(layer.remappings))
    newLayer.deleteRemapping(trigger)
    onUpdate(newLayer)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-4">
          <Input
            value={layer.layer_name}
            onChange={(e) => {
              const newLayer = new Layer(e.target.value, layer.layer_number, new Map(layer.remappings))
              onUpdate(newLayer)
            }}
            className="w-48"
          />
          <span className="text-sm text-muted-foreground">
            Layer {layer.layer_number}
          </span>
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
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteMapping(trigger)}
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
