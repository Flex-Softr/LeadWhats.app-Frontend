export type ContactRowStatus = "verified" | "unverified" | "invalid";

export type ContactRow = {
  id: string;
  name: string;
  phone: string;
  status: ContactRowStatus;
};

export type ContactGroupStats = {
  total: number;
  verified: number;
  unverified: number;
  invalid: number;
};

export type ContactGroupRecord = {
  id: string;
  name: string;
  createdAtLabel: string;
  stats: ContactGroupStats;
};
