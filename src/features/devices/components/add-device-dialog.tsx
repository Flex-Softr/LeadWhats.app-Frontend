"use client";

import * as React from "react";
import { MessageCircleMore, Plus, QrCode } from "lucide-react";

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
      <DialogContent className="gap-6 overflow-hidden rounded-lg border-violet-100 p-0 sm:max-w-md" showCloseButton>
        <DialogHeader className="gap-4 bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-6 text-left text-white">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white shadow-sm ring-1 ring-white/20">
              <MessageCircleMore className="size-5" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-semibold text-white sm:text-2xl">
                Add New Device
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/80">
                Create a WhatsApp session. You will scan a QR code from your
                phone after this step.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label
              htmlFor="device-name"
              className="text-slate-700 dark:text-slate-300"
            >
              Device Name
            </Label>
            <Input
              id="device-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main sales WhatsApp"
              className="h-11 rounded-md border-violet-200 bg-white focus-visible:border-violet-400 focus-visible:ring-violet-400/25 dark:border-violet-900"
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use a name your team can recognize later.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm dark:bg-emerald-950 dark:text-emerald-200">
                  <QrCode className="size-4" />
                </div>
                <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Prefer phone pairing?
                </p>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90">
                  Use this only when your provider enables pairing codes.
                </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-md border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
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
              className="rounded-md sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700 sm:w-auto"
              disabled={submitting}
            >
              <Plus className="size-4" />
              {submitting ? "Creating..." : "Create QR Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
