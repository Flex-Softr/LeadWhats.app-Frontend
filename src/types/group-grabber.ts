export type GrabbedGroupKind = "group" | "community";

export type GrabbedGroupRole = "admin" | "member";

export type GrabbedGroup = {
  id: string;
  name: string;
  kind: GrabbedGroupKind;
  participants: number;
  role: GrabbedGroupRole;
  /** WhatsApp group JID */
  jid: string;
  createdAtLabel: string;
  /** Parent community JID when this chat is linked to a community */
  linkedParentJid?: string | null;
};

export type GrabbedMember = {
  jid: string;
  phone: string | null;
  name: string;
  isAdmin: boolean;
};
