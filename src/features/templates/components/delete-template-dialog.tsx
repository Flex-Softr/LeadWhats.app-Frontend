"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import type { MessageTemplateRecord } from "@/types/template";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: MessageTemplateRecord | null;
  onDelete: () => Promise<void>;
};

export function DeleteTemplateDialog({
  open,
  onOpenChange,
  template,
  onDelete,
}: DeleteTemplateDialogProps) {
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
      // Parent shows toast
    } finally {
      setBusy(false);
    }
  }

  const isOpen = Boolean(open && template);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {template ? (
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <Trash2 className="size-4" />
              </div>
              <DialogTitle>Delete template</DialogTitle>
            </div>
            <DialogDescription>
              Remove{" "}
              <span className="font-medium text-foreground">{template.name}</span>{" "}
              (<span className="font-mono text-xs">{template.waTemplateName}</span>
              )? Campaigns and automations that reference it will no longer link
              to this template.
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
