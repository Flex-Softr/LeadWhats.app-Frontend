"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import type { ContactRow, ContactRowStatus } from "@/types/contacts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  contact: ContactRow | null;
  onSave: (input: {
    name: string;
    phone: string;
    status: ContactRowStatus;
  }) => Promise<void>;
};

export function EditContactDialog({
  open,
  onOpenChange,
  groupName,
  contact,
  onSave,
}: EditContactDialogProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<ContactRowStatus>("unverified");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && contact) {
      setName(contact.name);
      setPhone(contact.phone);
      setStatus(contact.status);
      setSaving(false);
    }
  }, [open, contact]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = phone.trim();
    const n = name.trim();
    if (!p || !n || saving) return;
    setSaving(true);
    try {
      await onSave({ name: n || "Contact", phone: p, status });
      onOpenChange(false);
    } catch {
      // Parent shows toast; keep dialog open.
    } finally {
      setSaving(false);
    }
  }

  const isOpen = Boolean(open && contact);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {contact ? (
      <DialogContent className="rounded-lg border-violet-100 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
              <Pencil className="size-4" />
            </div>
            <DialogTitle>Edit contact</DialogTitle>
          </div>
          <DialogDescription>
            Update this contact in{" "}
            <span className="font-medium">{groupName}</span>. Phone is
            normalized to E.164 on save.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-c-name">Name</Label>
            <Input
              id="edit-c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
              className="h-10 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-c-phone">Phone</Label>
            <Input
              id="edit-c-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="h-10 rounded-md font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-c-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus((v ?? "unverified") as ContactRowStatus)
              }
            >
              <SelectTrigger id="edit-c-status" className="h-10 w-full rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={!phone.trim() || !name.trim() || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      ) : null}
    </Dialog>
  );
}
