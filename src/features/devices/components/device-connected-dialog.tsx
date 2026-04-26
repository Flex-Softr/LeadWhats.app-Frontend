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
      <DialogContent className="gap-6 sm:max-w-md" showCloseButton>
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0 text-left">
          <CircleCheck className="size-5 text-emerald-600" />
          <DialogTitle className="text-lg font-semibold">Connected!</DialogTitle>
          <DialogDescription className="sr-only">
            Your WhatsApp session linked successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/50">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <Check className="size-6" strokeWidth={3} />
            </div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Connected!
            </p>
            <p className="mt-1 text-sm text-emerald-800/90 dark:text-emerald-300/90">
              Successfully connected!
            </p>
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              Closing in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}…
            </p>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Successfully Connected!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your WhatsApp session is now connected and ready to use.
            </p>
          </div>

          <Button
            type="button"
            className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            onClick={() => onOpenChange(false)}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
