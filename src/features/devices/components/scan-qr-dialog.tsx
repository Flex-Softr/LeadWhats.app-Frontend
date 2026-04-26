"use client";

import { Loader2 } from "lucide-react";
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
      <DialogContent className="gap-6 sm:max-w-md" showCloseButton>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold">
            Link your WhatsApp app
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-slate-600 dark:text-slate-400">
            Use the official{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              WhatsApp
            </span>{" "}
            or{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              WhatsApp Business
            </span>{" "}
            app on your phone — the same way you link WhatsApp Web on a computer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="flex min-h-[232px] min-w-[232px] items-center justify-center rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200/80 dark:bg-slate-50 dark:ring-slate-300">
            {showQr ? (
              <QRCodeSVG value={qrValue} size={200} level="M" />
            ) : showSpinner ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connecting to WhatsApp… your scannable code will appear here.
                </p>
              </div>
            ) : !bridgeEnabled ? (
              <div className="max-w-[220px] px-2 text-center text-sm text-slate-600 dark:text-slate-400">
                The WhatsApp bridge is turned off on the server (
                <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">
                  WHATSAPP_BRIDGE_ENABLED=false
                </code>
                ). Use the demo action below or enable the bridge in{" "}
                <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">
                  .env
                </code>
                .
              </div>
            ) : (
              <p className="max-w-[220px] px-2 text-center text-sm text-slate-600 dark:text-slate-400">
                No QR yet. Check the server logs or try again in a moment.
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              On your phone
            </p>
            <ol className="mt-2 max-w-xs list-decimal space-y-1 pl-5 text-left text-sm text-slate-500 dark:text-slate-400">
              <li>Open the WhatsApp or WhatsApp Business app.</li>
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Android:
                </span>{" "}
                ⋮ More → Linked devices → Link a device.
              </li>
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  iPhone:
                </span>{" "}
                Settings → Linked devices → Link a device.
              </li>
              <li>Point the camera at this screen to scan.</li>
            </ol>
            {startError ? (
              <p className="mt-3 max-w-xs text-sm text-red-600 dark:text-red-400">
                {startError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
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
            className="flex cursor-pointer items-center justify-center gap-2 text-center text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-slate-300"
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
                Connecting…
              </>
            ) : (
              "Demo: simulate successful scan"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
