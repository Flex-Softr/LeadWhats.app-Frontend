"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";

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

type AddContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onAdd: (input: { name: string; phone: string }) => Promise<void>;
};

export function AddContactDialog({
  open,
  onOpenChange,
  groupName,
  onAdd,
}: AddContactDialogProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setPhone("");
      setSaving(false);
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = phone.trim();
    if (!p || saving) return;
    setSaving(true);
    try {
      await onAdd({ name: name.trim() || "Contact", phone: p });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <UserPlus className="size-4" />
            </div>
            <DialogTitle>Add contact</DialogTitle>
          </div>
          <DialogDescription>
            Add one contact to <span className="font-medium">{groupName}</span>.
            Use international format (e.g. +1 234 567 8900).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-c-name">Name</Label>
            <Input
              id="add-c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-c-phone">Phone</Label>
            <Input
              id="add-c-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="font-mono"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!phone.trim() || saving}>
              {saving ? "Adding…" : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
