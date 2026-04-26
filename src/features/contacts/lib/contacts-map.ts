import type {
  ContactGroupListItemApi,
  ContactRowApi,
} from "@/types/contacts-api";
import type { ContactGroupRecord, ContactRow } from "@/types/contacts";

export function formatContactDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function groupApiToRecord(g: ContactGroupListItemApi): ContactGroupRecord {
  return {
    id: g.id,
    name: g.name,
    createdAtLabel: formatContactDate(g.createdAt),
    stats: g.stats,
  };
}

export function contactApiToRow(c: ContactRowApi): ContactRow {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    status: c.status,
  };
}
