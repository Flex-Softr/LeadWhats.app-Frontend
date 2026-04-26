"use client";

import * as React from "react";
import { Loader2, QrCode, Plus } from "lucide-react";
import { toast } from "sonner";

import type {
  DeviceApiRecord,
  DeviceLinkStateResponse,
  DevicesListResponse,
  WhatsAppDevice,
} from "@/types/device";
import { AddDeviceDialog } from "@/features/devices/components/add-device-dialog";
import { DeviceCard } from "@/features/devices/components/device-card";
import { DeviceConnectedDialog } from "@/features/devices/components/device-connected-dialog";
import { ScanQrDialog } from "@/features/devices/components/scan-qr-dialog";
import { deviceFromApi } from "@/features/devices/lib/device-utils";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiFetch, apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function throwIfBad(res: Response): Promise<void> {
  if (res.ok || res.status === 204) return;
  let message = res.statusText;
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    message = body.error?.message ?? message;
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, message);
}

export function DevicesClient() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [devices, setDevices] = React.useState<WhatsAppDevice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [activeDevice, setActiveDevice] = React.useState<WhatsAppDevice | null>(
    null
  );
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [linkSnapshot, setLinkSnapshot] =
    React.useState<DeviceLinkStateResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<WhatsAppDevice | null>(
    null
  );
  const [disconnectTarget, setDisconnectTarget] =
    React.useState<WhatsAppDevice | null>(null);

  const loadDevices = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<DevicesListResponse>("/v1/devices");
      setDevices(data.devices.map(deviceFromApi));
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load devices.";
      toast.error("Failed to load devices", { description: msg });
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDevices();
  }, [loadDevices, userId, workspaceId, routeKey]);

  React.useEffect(() => {
    if (!qrOpen || !activeDevice) {
      setLinkSnapshot(null);
      return;
    }

    const deviceId = activeDevice.id;
    let cancelled = false;

    async function pollLink() {
      try {
        const s = await apiJson<DeviceLinkStateResponse>(
          `/v1/devices/${encodeURIComponent(deviceId)}/link`
        );
        if (cancelled) return;
        setLinkSnapshot(s);
        if (s.status === "connected") {
          setQrOpen(false);
          setActiveDevice(null);
          setSuccessOpen(true);
          await loadDevices();
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError ? err.message : "Could not load link state.";
        toast.error("Link status failed", { description: msg });
      }
    }

    void pollLink();
    const interval = setInterval(() => {
      void pollLink();
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [qrOpen, activeDevice, loadDevices]);

  async function handleCreate(name: string) {
    try {
      const created = await apiJson<DeviceApiRecord>("/v1/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setDevices((prev) => [deviceFromApi(created), ...prev]);
      toast.success("Device created", {
        description: "Open “Show QR Code” to link WhatsApp with your phone.",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not create device.";
      toast.error("Create failed", { description: msg });
      throw err;
    }
  }

  function handleShowQr(device: WhatsAppDevice) {
    setActiveDevice(device);
    setQrOpen(true);
  }

  function handlePairingCode(device?: WhatsAppDevice) {
    toast.message("Pairing code", {
      description: `Phone-number pairing for "${device?.name ?? "device"}" — add a pairing-code endpoint or WhatsApp Cloud API flow when your provider is ready.`,
    });
  }

  async function handleDemoConnected() {
    if (!activeDevice) {
      throw new Error("No device selected");
    }
    setPendingId(activeDevice.id);
    try {
      const updated = await apiJson<DeviceApiRecord>(
        `/v1/devices/${encodeURIComponent(activeDevice.id)}/simulate-connect`,
        { method: "POST" }
      );
      const mapped = deviceFromApi(updated);
      setDevices((prev) => prev.map((d) => (d.id === mapped.id ? mapped : d)));
      setActiveDevice(mapped);
      setSuccessOpen(true);
      toast.success("Device connected (demo)", {
        description: "Session marked connected on the server.",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Simulation failed.";
      toast.error("Could not update device", { description: msg });
      throw err;
    } finally {
      setPendingId(null);
    }
  }

  async function handleDisconnect(device: WhatsAppDevice) {
    setPendingId(device.id);
    try {
      const updated = await apiJson<DeviceApiRecord>(
        `/v1/devices/${encodeURIComponent(device.id)}/disconnect`,
        { method: "POST" }
      );
      const mapped = deviceFromApi(updated);
      setDevices((prev) => prev.map((d) => (d.id === mapped.id ? mapped : d)));
      toast.message("Disconnected", {
        description: `${device.name} is back to QR / pairing setup.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Disconnect failed.";
      toast.error("Disconnect failed", { description: msg });
      throw err;
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(device: WhatsAppDevice) {
    setPendingId(device.id);
    try {
      const res = await apiFetch(
        `/v1/devices/${encodeURIComponent(device.id)}`,
        { method: "DELETE" }
      );
      await throwIfBad(res);
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
      if (activeDevice?.id === device.id) {
        setActiveDevice(null);
        setQrOpen(false);
      }
      toast.message("Device removed", {
        description: `${device.name} was deleted.`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Delete failed.";
      toast.error("Delete failed", { description: msg });
      throw err;
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 py-24 text-slate-500 dark:text-slate-400">
        <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
        <p className="text-sm">Loading devices…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 lg:space-y-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            WhatsApp Devices
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Each device is a session you link from{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              your WhatsApp app
            </span>{" "}
            (WhatsApp or WhatsApp Business on your phone). We show the same kind
            of QR code as WhatsApp Web — scan it under Linked devices to connect
            FlexoWhats to that number.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 w-full shrink-0 gap-2 px-5 sm:w-auto"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          Add Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-200/90 bg-white/90 dark:border-slate-800 dark:bg-slate-950/80">
          <CardHeader className="sr-only">
            <CardTitle>Connected devices</CardTitle>
            <CardDescription>List of WhatsApp sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center sm:px-8 sm:py-24">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 sm:size-[4.75rem]">
              <QrCode className="size-8 text-slate-400 sm:size-10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                No devices connected
              </h3>
              <p className="max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
                Add your first WhatsApp device to connect a session and start
                sending automated messages.
              </p>
            </div>
            <Button
              type="button"
              className="gap-2"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Add Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-2">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              busy={pendingId === device.id}
              onShowQr={handleShowQr}
              onPairingCode={handlePairingCode}
              onDisconnect={(d) => setDisconnectTarget(d)}
              onDelete={(d) => setDeleteTarget(d)}
            />
          ))}
        </div>
      )}

      <AddDeviceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={async (name) => {
          await handleCreate(name);
        }}
        onPairingInstead={() => handlePairingCode()}
      />

      <ScanQrDialog
        open={qrOpen}
        onOpenChange={(open) => {
          setQrOpen(open);
          if (!open) setActiveDevice(null);
        }}
        qrValue={linkSnapshot?.qr ?? ""}
        bridgeEnabled={linkSnapshot?.bridgeEnabled ?? true}
        waConnecting={
          linkSnapshot === null ||
          (linkSnapshot.bridgeEnabled &&
            linkSnapshot.status === "qr_ready" &&
            !linkSnapshot.qr &&
            !linkSnapshot.startError)
        }
        startError={linkSnapshot?.startError ?? null}
        onPairingInstead={() =>
          activeDevice && handlePairingCode(activeDevice)
        }
        onDemoConnected={() => handleDemoConnected()}
        demoBusy={pendingId === activeDevice?.id}
      />

      <DeviceConnectedDialog open={successOpen} onOpenChange={setSuccessOpen} />

      <ConfirmDestructiveDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete this device?"
        description={
          <>
            Remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>{" "}
            and its WhatsApp session from FlexoWhats. This cannot be undone.
          </>
        }
        confirmLabel="Delete device"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await handleDelete(deleteTarget);
        }}
      />

      <ConfirmDestructiveDialog
        destructive={false}
        open={disconnectTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDisconnectTarget(null);
        }}
        title="Disconnect WhatsApp?"
        description={
          <>
            <span className="font-semibold text-foreground">
              {disconnectTarget?.name}
            </span>{" "}
            will go back to QR / pairing. You can link again when you are ready.
          </>
        }
        confirmLabel="Disconnect"
        onConfirm={async () => {
          if (!disconnectTarget) return;
          await handleDisconnect(disconnectTarget);
        }}
      />
    </div>
  );
}
