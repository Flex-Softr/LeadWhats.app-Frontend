import type { AdminResponseMeta } from "@/types/admin-meta";

type AdminNoDataBannerProps = {
  meta?: AdminResponseMeta | null;
};

/**
 * Shown when the API marks the view as empty (HTTP 200 with no primary rows / activity).
 */
export function AdminNoDataBanner({ meta }: AdminNoDataBannerProps) {
  if (!meta?.noData || !meta.message) return null;
  return (
    <div
      role="status"
      className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50"
    >
      {meta.message}
    </div>
  );
}
