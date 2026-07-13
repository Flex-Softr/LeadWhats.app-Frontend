"use client";

import * as React from "react";
import { Check, CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeviceConnectedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCloseMs?: number;
};

export function DeviceConnectedDialog({
  open,
  onOpenChange,
  autoCloseMs = 2000,
}: DeviceConnectedDialogProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(
    Math.ceil(autoCloseMs / 1000)
  );

  React.useEffect(() => {
    if (!open) {
      setSecondsLeft(Math.ceil(autoCloseMs / 1000));
      return;
    }

    const totalSec = Math.ceil(autoCloseMs / 1000);
    setSecondsLeft(totalSec);
    const started = Date.now();

    const countdown = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const left = Math.max(0, Math.ceil((autoCloseMs - elapsed) / 1000));
      setSecondsLeft(left);
    }, 200);

    const closeTimer = window.setTimeout(() => {
      onOpenChange(false);
    }, autoCloseMs);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(closeTimer);
    };
  }, [open, autoCloseMs, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 overflow-hidden rounded-lg border-emerald-100 p-0 sm:max-w-md" showCloseButton>
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0 bg-gradient-to-br from-emerald-500 to-teal-500 px-6 py-5 pr-12 text-left text-white">
          <CircleCheck className="size-5 text-white" />
          <DialogTitle className="text-lg font-semibold text-white">
            Device connected
          </DialogTitle>
          <DialogDescription className="sr-only">
            Your WhatsApp session linked successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/50">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-8 ring-emerald-100 dark:ring-emerald-950">
              <Check className="size-6" strokeWidth={3} />
            </div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Successfully connected
            </p>
            <p className="mt-1 text-sm text-emerald-800/90 dark:text-emerald-300/90">
              This WhatsApp session is ready for campaigns and automation.
            </p>
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              Closing in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}...
            </p>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You can disconnect or remove this device later from the same
              device card.
            </p>
          </div>

          <Button
            type="button"
            className="h-11 w-full rounded-md bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            onClick={() => onOpenChange(false)}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
