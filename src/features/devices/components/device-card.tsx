"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  QrCode,
  Trash2,
  Unplug,
} from "lucide-react";

import type { WhatsAppDevice } from "@/types/device";
import { DeviceProfileAvatar } from "@/features/devices/components/device-profile-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type DeviceCardProps = {
  device: WhatsAppDevice;
  busy?: boolean;
  onShowQr: (device: WhatsAppDevice) => void;
  onPairingCode: (device: WhatsAppDevice) => void;
  onDisconnect: (device: WhatsAppDevice) => void | Promise<void>;
  onDelete: (device: WhatsAppDevice) => void | Promise<void>;
};

export function DeviceCard({
  device,
  busy = false,
  onShowQr,
  onPairingCode,
  onDisconnect,
  onDelete,
}: DeviceCardProps) {
  const isReady = device.status === "qr_ready";
  const isConnected = device.status === "connected";

  const initials = useMemo(() => {
    const parts = device.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }, [device.name]);

  return (
    <Card className="overflow-hidden rounded-lg border-violet-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-br from-white to-violet-50/80 pb-4 dark:border-slate-800 dark:from-slate-950 dark:to-violet-950/20">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0">
              {isConnected ? (
                <DeviceProfileAvatar
                  deviceId={device.id}
                  ringClassName="ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                  fallback={initials}
                />
              ) : (
                <Avatar
                  size="lg"
                  className="ring-2 ring-amber-400/70 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                >
                  <AvatarFallback className="bg-violet-100 font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-200">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <span
                className={
                  isConnected
                    ? "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950"
                    : "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-amber-500 dark:border-slate-950"
                }
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="max-w-[190px] truncate font-semibold text-slate-900 dark:text-slate-50">
                  {device.name}
                </h3>
                {isReady ? (
                  <Badge className="rounded-md border-amber-200 bg-amber-100 font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    QR ready
                  </Badge>
                ) : (
                  <Badge className="rounded-md border-emerald-200 bg-emerald-100 font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    Connected
                  </Badge>
                )}
              </div>
              <p className="mt-1 max-w-[230px] truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                {device.sessionId}
              </p>
            </div>
          </div>
          {isReady ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              aria-label={`Remove ${device.name}`}
              disabled={busy}
              onClick={() => void onDelete(device)}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5 py-5 text-sm">
        <div className="flex justify-between gap-4 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900/70">
          <span className="text-slate-500 dark:text-slate-400">Status</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
            {isReady ? (
              <>
                <Clock className="size-3.5 text-amber-600" />
                QR Code Ready
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Connected
              </>
            )}
          </span>
        </div>
        {isConnected && device.phone ? (
          <div className="flex justify-between gap-4 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900/70">
            <span className="text-slate-500 dark:text-slate-400">Phone</span>
            <span className="truncate font-medium tabular-nums text-slate-800 dark:text-slate-200">
              {device.phone}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900/70">
          <span className="text-slate-500 dark:text-slate-400">Created</span>
          <span className="truncate text-slate-800 dark:text-slate-200">
            {device.createdAtLabel}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
        {isReady ? (
          <>
            <Button
              type="button"
              className="h-10 w-full rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700"
              disabled={busy}
              onClick={() => onShowQr(device)}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
              Show QR Code
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-md border-emerald-200 bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              disabled={busy}
              onClick={() => onPairingCode(device)}
            >
              Use Pairing Code Instead
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              className="h-10 w-full rounded-md bg-amber-500 font-semibold text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
              disabled={busy}
              onClick={() => void onDisconnect(device)}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Unplug className="size-4" />}
              Disconnect
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 w-full rounded-md"
              disabled={busy}
              onClick={() => void onDelete(device)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
