"use client";

import { Loader2, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ScanQrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Raw QR string from WhatsApp / Baileys — must not be a custom JSON payload */
  qrValue: string;
  bridgeEnabled: boolean;
  /** Waiting for Baileys to emit a QR string */
  waConnecting: boolean;
  startError: string | null;
  onPairingInstead: () => void;
  onDemoConnected: () => void | Promise<void>;
  demoBusy?: boolean;
};

export function ScanQrDialog({
  open,
  onOpenChange,
  qrValue,
  bridgeEnabled,
  waConnecting,
  startError,
  onPairingInstead,
  onDemoConnected,
  demoBusy = false,
}: ScanQrDialogProps) {
  const showQr = bridgeEnabled && qrValue.length > 0;
  const showSpinner = bridgeEnabled && !startError && waConnecting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-lg border-violet-100 p-0 sm:max-w-2xl" showCloseButton>
        <DialogHeader className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-6 pr-12 text-left text-white">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/20">
              <QrCode className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Link your WhatsApp app
              </DialogTitle>
              <DialogDescription className="mt-1 text-left text-sm leading-6 text-white/80">
                Open WhatsApp Linked devices on your phone and scan this code.
                The screen updates automatically after the session connects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-0 bg-violet-50/50 dark:bg-slate-950 sm:grid-cols-[280px_1fr]">
          <div className="flex items-center justify-center p-6 sm:p-7">
            <div className="flex min-h-[236px] w-full max-w-[236px] items-center justify-center rounded-lg bg-white p-4 shadow-sm ring-1 ring-violet-100 dark:bg-slate-50 dark:ring-violet-200">
              {showQr ? (
                <QRCodeSVG value={qrValue} size={196} level="M" />
              ) : showSpinner ? (
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-500" />
                  <p className="text-sm font-medium text-slate-600">
                    Waiting for WhatsApp QR...
                  </p>
                </div>
              ) : !bridgeEnabled ? (
                <div className="max-w-[210px] px-2 text-center text-sm text-slate-600">
                  WhatsApp bridge is off. Enable{" "}
                  <code className="rounded bg-slate-100 px-1 text-xs">
                    WHATSAPP_BRIDGE_ENABLED
                  </code>{" "}
                  or use demo connect.
                </div>
              ) : (
                <p className="max-w-[210px] px-2 text-center text-sm text-slate-600">
                  No QR yet. Check the server logs or try again in a moment.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5 border-t border-violet-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 sm:border-l sm:border-t-0">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Scan from your phone
              </p>
              <div className="mt-4 space-y-3">
                <StepBadge
                  icon={<Smartphone className="size-4" />}
                  text="Open WhatsApp or WhatsApp Business."
                />
                <StepBadge
                  icon={<QrCode className="size-4" />}
                  text="Go to Linked devices and choose Link a device."
                />
                <StepBadge
                  icon={<ShieldCheck className="size-4" />}
                  text="Point the camera at this QR code."
                />
              </div>
              <p className="mt-4 rounded-md bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200">
                Android: More options - Linked devices. iPhone: Settings -
                Linked devices.
              </p>
            </div>
            {startError ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {startError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="h-10 w-full rounded-md bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                onClick={() => {
                  onPairingInstead();
                  onOpenChange(false);
                }}
              >
                Use Pairing Code Instead
              </Button>
              <button
                type="button"
                disabled={demoBusy}
                className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md text-center text-xs font-medium text-slate-400 underline-offset-2 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-900 dark:hover:text-slate-300"
                onClick={() => {
                  void (async () => {
                    try {
                      await Promise.resolve(onDemoConnected());
                      onOpenChange(false);
                    } catch {
                      /* parent toast; keep dialog open */
                    }
                  })();
                }}
              >
                {demoBusy ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Demo: simulate successful scan"
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type StepBadgeProps = {
  icon: React.ReactNode;
  text: string;
};

function StepBadge({ icon, text }: StepBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-violet-600 shadow-sm dark:bg-slate-950 dark:text-violet-300">
        {icon}
      </span>
      <span className="leading-5">{text}</span>
    </div>
  );
}
