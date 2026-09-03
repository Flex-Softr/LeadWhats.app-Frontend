import { apiJson } from "@/lib/api";
import type { AppNotification, NotificationListResponse } from "@/types/notification";

export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<NotificationListResponse> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set("unreadOnly", "true");
  if (options?.page) params.set("page", String(options.page));
  if (options?.pageSize) params.set("pageSize", String(options.pageSize));

  const qs = params.toString();
  return apiJson<NotificationListResponse>(`/v1/notifications${qs ? `?${qs}` : ""}`);
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await apiJson<{ unreadCount: number }>("/v1/notifications/unread-count");
  return res.unreadCount;
}

export async function markNotificationAsRead(
  id: string
): Promise<AppNotification> {
  const res = await apiJson<{ notification: AppNotification }>(
    `/v1/notifications/${id}/read`,
    { method: "PATCH" }
  );
  return res.notification;
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  return apiJson<{ count: number }>("/v1/notifications/mark-all-read", {
    method: "POST",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiJson<void>(`/v1/notifications/${id}`, {
    method: "DELETE",
  });
}
