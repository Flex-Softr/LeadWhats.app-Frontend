"use client";

import * as React from "react";
import { FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void | Promise<void>;
};

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateGroupDialogProps) {
  const [name, setName] = React.useState("");
  const [working, setWorking] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setWorking(false);
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = name.trim();
    if (!t || working) return;
    setWorking(true);
    try {
      await onCreate(t);
      onOpenChange(false);
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg border-violet-100 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
              <FolderPlus className="size-4" />
            </div>
            <DialogTitle>New contact group</DialogTitle>
          </div>
          <DialogDescription>
            Groups help you segment imports and campaigns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., VIP customers"
              className="h-10 rounded-md"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="rounded-md"
              onClick={() => onOpenChange(false)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700"
              disabled={!name.trim() || working}
            >
              {working ? "Creating..." : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
