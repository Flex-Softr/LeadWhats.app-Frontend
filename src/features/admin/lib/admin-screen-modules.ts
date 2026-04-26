/** Admin nav modules backed by `GET /v1/admin/screen/:moduleId` */
export const ADMIN_SCREEN_DATA_MODULES = [
  "feature-flags",
  "integrations",
  "system",
  "audit",
  "support",
  "announcements",
  "reports",
  "settings",
] as const;

export type AdminScreenDataModuleId = (typeof ADMIN_SCREEN_DATA_MODULES)[number];

export function isAdminScreenDataModule(
  id: string
): id is AdminScreenDataModuleId {
  return (ADMIN_SCREEN_DATA_MODULES as readonly string[]).includes(id);
}
