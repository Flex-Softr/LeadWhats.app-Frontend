export type ContactStatusApi = "verified" | "unverified" | "invalid";

export type ContactRowApi = {
  id: string;
  name: string;
  phone: string;
  status: ContactStatusApi;
  createdAt: string;
  updatedAt: string;
};

export type GroupStatsApi = {
  total: number;
  verified: number;
  unverified: number;
  invalid: number;
};

export type ContactGroupListItemApi = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stats: GroupStatsApi;
};

export type ContactGroupsListResponse = {
  groups: ContactGroupListItemApi[];
};

export type CreateContactGroupResponse = {
  group: ContactGroupListItemApi;
};

export type ContactGroupDetailResponse = {
  group: ContactGroupListItemApi;
  contacts: ContactRowApi[];
};

export type CreateContactResponse = {
  contact: ContactRowApi;
};

export type BulkContactsResponse = {
  created: ContactRowApi[];
  skipped: { phone: string; reason: string }[];
};

export type RevalidatePhonesResponse = {
  updated: number;
  /** False when the WhatsApp bridge is off, no connected device, or the presence query failed. */
  whatsappChecked: boolean;
};

export type RemoveInvalidResponse = {
  removed: number;
};

export type UpdateContactGroupResponse = {
  group: ContactGroupListItemApi;
};

export type UpdateContactResponse = {
  contact: ContactRowApi;
};
