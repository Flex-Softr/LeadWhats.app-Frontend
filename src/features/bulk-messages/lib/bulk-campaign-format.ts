import type { BulkCampaignListItemApi } from "@/types/bulk-campaign-api";

export function formatBulkCampaignWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function bulkSelectionLabel(
  m: BulkCampaignListItemApi["selectionMode"]
): string {
  switch (m) {
    case "all_verified":
      return "All verified contacts";
    case "manual":
      return "Manual phone list";
    default:
      return "Contact groups";
  }
}

export function deviceModeLabel(
  m: BulkCampaignListItemApi["deviceMode"]
): string {
  switch (m) {
    case "single":
      return "Single device";
    case "failover":
      return "Failover";
    default:
      return "Round robin";
  }
}
