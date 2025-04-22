import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { useEffect, useState } from "react";
import { Bind } from "../../../models/Bind";
import { Trigger } from "../../../models/Trigger";
import { Button } from "./ui/button";
import TriggerSelector from "./CreateTrigger";
import { BindSelector } from "./CreateBind";

export type CreateModificationDialogProps = {
  isOpen: boolean;
  maxLayer: number;
  onCancel: () => void;
  onCreate: (trigger: Trigger, bind: Bind) => void;
};

export default function CreateMappingDialog({
  isOpen,
  maxLayer,
  onCancel,
  onCreate,
}: CreateModificationDialogProps) {
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [bind, setBind] = useState<Bind | null>(null);

  // Reset inputs when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTrigger(null);
      setBind(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Modification</DialogTitle>
          <DialogDescription>
            Configure a trigger and its corresponding action
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <TriggerSelector onTriggerSelected={setTrigger} />
          </div>

          <div className="space-y-4">
            <BindSelector maxLayer={maxLayer} onBindSelected={setBind} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onCreate(trigger!, bind!)}
            disabled={!trigger || !bind}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
