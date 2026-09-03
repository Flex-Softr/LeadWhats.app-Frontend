export type NotificationAudience = "CUSTOMER" | "ADMIN" | "ALL";

export type NotificationType =
  | "CAMPAIGN_COMPLETED"
  | "CAMPAIGN_PAUSED"
  | "CAMPAIGN_FAILED"
  | "DEVICE_DISCONNECTED"
  | "DEVICE_CONNECTED"
  | "SUBSCRIPTION_EXPIRING"
  | "PAYMENT_RECEIVED"
  | "SUBSCRIPTION_CANCELED"
  | "USER_REGISTERED"
  | "SYSTEM_ALERT";

export type AppNotification = {
  id: string;
  audience: NotificationAudience;
  workspaceId: string | null;
  userId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  notifications: AppNotification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
};
