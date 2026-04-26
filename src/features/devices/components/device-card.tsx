"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
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
    <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
      <CardHeader className="space-y-3 pb-4">
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
                  <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  {device.name}
                </h3>
                {isReady ? (
                  <Badge className="border-amber-200 bg-amber-100 font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    Link with phone app
                  </Badge>
                ) : (
                  <Badge className="border-emerald-200 bg-emerald-100 font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    Connected
                  </Badge>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
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

      <CardContent className="space-y-2 pb-4 text-sm">
        <div className="flex justify-between gap-4">
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
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Phone</span>
            <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">
              {device.phone}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Created</span>
          <span className="text-slate-800 dark:text-slate-200">
            {device.createdAtLabel}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        {isReady ? (
          <>
            <Button
              type="button"
              className="w-full gap-2"
              disabled={busy}
              onClick={() => onShowQr(device)}
            >
              <QrCode className="size-4" />
              Show QR for WhatsApp app
            </Button>
            <Button
              type="button"
              className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
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
              className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500"
              disabled={busy}
              onClick={() => void onDisconnect(device)}
            >
              <Unplug className="size-4" />
              Disconnect
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2"
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
