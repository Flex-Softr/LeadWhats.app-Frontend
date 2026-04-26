"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import type { ContactRow } from "@/types/contacts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  contact: ContactRow | null;
  onDelete: () => Promise<void>;
};

export function DeleteContactDialog({
  open,
  onOpenChange,
  groupName,
  contact,
  onDelete,
}: DeleteContactDialogProps) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) setBusy(false);
  }, [open]);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    try {
      await onDelete();
      onOpenChange(false);
    } catch {
      // Parent shows toast; keep dialog open so user can retry or cancel.
    } finally {
      setBusy(false);
    }
  }

  const isOpen = Boolean(open && contact);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {contact ? (
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <Trash2 className="size-4" />
            </div>
            <DialogTitle>Delete contact</DialogTitle>
          </div>
          <DialogDescription>
            Remove{" "}
            <span className="font-medium text-foreground">{contact.name}</span>{" "}
            (<span className="font-mono text-xs">{contact.phone}</span>) from{" "}
            <span className="font-medium">{groupName}</span>? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void confirm()}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
      ) : null}
    </Dialog>
  );
}
