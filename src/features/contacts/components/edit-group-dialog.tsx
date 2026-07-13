"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import type { ContactGroupRecord } from "@/types/contacts";
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

type EditGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ContactGroupRecord | null;
  onSave: (groupId: string, name: string) => Promise<void>;
};

export function EditGroupDialog({
  open,
  onOpenChange,
  group,
  onSave,
}: EditGroupDialogProps) {
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && group) {
      setName(group.name);
      setSaving(false);
    }
  }, [open, group]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    const t = name.trim();
    if (!t || saving) return;
    setSaving(true);
    try {
      await onSave(group.id, t);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg border-violet-100 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
              <Pencil className="size-4" />
            </div>
            <DialogTitle>Rename group</DialogTitle>
          </div>
          <DialogDescription>
            Update how this group appears in lists and campaigns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-group-name">Group name</Label>
            <Input
              id="edit-group-name"
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
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700"
              disabled={!name.trim() || saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
