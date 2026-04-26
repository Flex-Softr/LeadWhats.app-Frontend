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
