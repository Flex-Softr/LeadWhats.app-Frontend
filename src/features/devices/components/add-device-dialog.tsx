"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddDeviceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void | Promise<void>;
  onPairingInstead?: () => void;
};

export function AddDeviceDialog({
  open,
  onOpenChange,
  onCreate,
  onPairingInstead,
}: AddDeviceDialogProps) {
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (open) setName("");
  }, [open]);

  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await Promise.resolve(onCreate(trimmed));
      onOpenChange(false);
    } catch {
      /* parent shows error toast */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 sm:max-w-md" showCloseButton>
        <DialogHeader className="gap-4 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Plus className="size-5" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-semibold sm:text-2xl">
                Add New Device
              </DialogTitle>
              <DialogDescription className="sr-only">
                Name your device and create a session to scan a QR code.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="device-name" className="text-slate-600 dark:text-slate-400">
              Device Name
            </Label>
            <Input
              id="device-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul"
              className="h-11 border-sky-200 focus-visible:border-sky-400 focus-visible:ring-sky-400/30 dark:border-sky-900"
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose a descriptive name for this device
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Alternative: Use Pairing Code
                </p>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90">
                  Connect using phone number instead of QR code
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                onClick={() => onPairingInstead?.()}
              >
                Use Pairing Code
              </Button>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="sm:w-auto" disabled={submitting}>
              {submitting ? "Creating…" : "Create Device (QR Code)"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
