import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

// Props for the dialog
export type CreateMappingDialogProps = {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Called when the user cancels or closes the dialog */
  onCancel: () => void
  /** Called with name & description when "Create" is clicked */
  onCreate: (name: string, description: string) => void
}

export default function CreateMappingDialog({
  isOpen,
  onCancel,
  onCreate
}: CreateMappingDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Reset inputs when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
    }
  }, [isOpen])

  const handleCreate = () => {
    onCreate(name.trim(), description.trim())
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Mapping</DialogTitle>
          <DialogDescription>
            Give your mapping a name and description to help you identify it later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mapping-name" className="text-right">
              Name
            </Label>
            <Input
              id="mapping-name"
              placeholder="My Custom Mapping"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mapping-desc" className="text-right">
              Description
            </Label>
            <Input
              id="mapping-desc"
              placeholder="Optional description"
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
