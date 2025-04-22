import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import React, { useEffect, useState } from "react";
import { Bind } from "src/models/Bind"
import { Trigger } from "src/models/Trigger"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


export type CreateModificationDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onCreate: (trigger: Trigger, bind: Bind) => void;
};

export default function CreateMappingDialog({
  isOpen,
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


  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Modification</DialogTitle>
          <DialogDescription>
            Match up a trigger and an effect
          </DialogDescription>
        </DialogHeader>
        {/*TODO: */}
        {/* <div className="grid gap-4 py-4"> */}
        {/*   <div className="grid grid-cols-4 items-center gap-4"> */}
        {/*     <Label htmlFor="mapping-name" className="text-right"> */}
        {/*       Name */}
        {/*     </Label> */}
        {/*     <Input */}
        {/*       id="mapping-name" */}
        {/*       placeholder="My Custom Mapping" */}
        {/*       className="col-span-3" */}
        {/*       value={name} */}
        {/*       onChange={(e) => setName(e.target.value)} */}
        {/*     /> */}
        {/*   </div> */}
        {/**/}
        {/*   <div className="grid grid-cols-4 items-center gap-4"> */}
        {/*     <Label htmlFor="mapping-desc" className="text-right"> */}
        {/*       Description */}
        {/*     </Label> */}
        {/*     <Input */}
        {/*       id="mapping-desc" */}
        {/*       placeholder="Optional description" */}
        {/*       className="col-span-3" */}
        {/*       value={description} */}
        {/*       onChange={(e) => setDescription(e.target.value)} */}
        {/*     /> */}
        {/*   </div> */}
        {/* </div> */}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onCreate(trigger as Trigger, bind as Bind)} disabled={trigger != null && bind != null}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
