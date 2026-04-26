import type { DeviceApiRecord, WhatsAppDevice } from "@/types/device";

export function deviceFromApi(record: DeviceApiRecord): WhatsAppDevice {
  return {
    id: record.id,
    name: record.name,
    sessionId: record.sessionId,
    status: record.status,
    phone: record.phone ?? undefined,
    profilePictureUrl: record.profilePictureUrl ?? undefined,
    createdAtLabel: formatDeviceCreatedAt(new Date(record.createdAt)),
  };
}

export function formatDeviceCreatedAt(d: Date): string {
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

