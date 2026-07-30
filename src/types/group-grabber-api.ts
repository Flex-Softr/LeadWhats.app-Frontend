export type WaGroupMemberApi = {
  jid: string;
  phone: string | null;
  name: string;
  isAdmin: boolean;
};

/** `GET /v1/group-grabber/devices/:deviceId/groups` */
export type GroupGrabberListResponse = {
  bridgeEnabled: boolean;
  deviceConnected: boolean;
  socketOpen: boolean;
  hint: string | null;
  groups: {
    id: string;
    jid: string;
    name: string;
    kind: "group" | "community";
    participants: number;
    role: "admin" | "member";
    createdAtLabel: string;
    linkedParentJid: string | null;
  }[];
};

/** `POST /v1/group-grabber/devices/:deviceId/scrape-members` */
export type GroupGrabberScrapeResponse = {
  members: WaGroupMemberApi[];
};

export type GroupGrabberExportFormat = "csv" | "xlsx";

/** Body for `POST /v1/group-grabber/export-members` */
export type GroupGrabberExportMembersBody = {
  format: GroupGrabberExportFormat;
  groupName?: string;
  /** When true, rows without a phone are omitted server-side. */
  onlyWithPhone?: boolean;
  members: {
    name?: string;
    phone?: string | null;
    jid?: string;
    isAdmin?: boolean;
  }[];
};

/** Body for `POST /v1/group-grabber/devices/:deviceId/export-members` */
export type GroupGrabberScrapeExportBody = {
  groupJid: string;
  format: GroupGrabberExportFormat;
  excludeAdmins?: boolean;
  onlyWithPhone?: boolean;
  groupName?: string;
};
