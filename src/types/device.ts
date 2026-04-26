export type DeviceConnectionStatus = "qr_ready" | "connected";

export type WhatsAppDevice = {
  id: string;
  name: string;
  sessionId: string;
  status: DeviceConnectionStatus;
  createdAtLabel: string;
  phone?: string;
  profilePictureUrl?: string;
};

/** API shape from `GET/POST /v1/devices` */
export type DeviceApiRecord = {
  id: string;
  workspaceId: string;
  name: string;
  sessionId: string;
  status: DeviceConnectionStatus;
  phone: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DevicesListResponse = {
  devices: DeviceApiRecord[];
};

/** `GET /v1/devices/:deviceId/link` — real WhatsApp Web QR from Baileys when bridge is enabled */
export type DeviceLinkStateResponse = {
  bridgeEnabled: boolean;
  qr: string | null;
  connection: "connecting" | "open" | "close" | null;
  status: DeviceConnectionStatus;
  startError: string | null;
};
