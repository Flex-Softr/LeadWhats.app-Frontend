"use client";

import * as React from "react";
import { Clipboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PasteContactsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onPaste: (lines: string[]) => Promise<void>;
};

export function PasteContactsDialog({
  open,
  onOpenChange,
  groupName,
  onPaste,
}: PasteContactsDialogProps) {
  const [text, setText] = React.useState("");
  const [working, setWorking] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setText("");
      setWorking(false);
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0 || working) return;
    setWorking(true);
    try {
      await onPaste(lines);
      onOpenChange(false);
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Clipboard className="size-4" />
            </div>
            <DialogTitle>Paste contacts</DialogTitle>
          </div>
          <DialogDescription>
            One entry per line for <span className="font-medium">{groupName}</span>.
            Use a phone only, or <code className="text-xs">Name, +phone</code>, or{" "}
            <code className="text-xs">Name{"\t"}phone</code> (tab-separated).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paste-lines">Lines</Label>
            <Textarea
              id="paste-lines"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"+12025550123\nJane Doe, +447911123456"}
              className="min-h-40 font-mono text-sm"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!text.trim() || working}>
              {working ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
