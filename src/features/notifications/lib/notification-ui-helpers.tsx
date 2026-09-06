import * as React from "react";
import {
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  Smartphone,
  Info,
} from "lucide-react";
import type { NotificationType } from "@/types/notification";

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "CAMPAIGN_COMPLETED":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
        </div>
      );
    case "PAYMENT_RECEIVED":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <CreditCard className="size-4" />
        </div>
      );
    case "CAMPAIGN_PAUSED":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <AlertTriangle className="size-4" />
        </div>
      );
    case "CAMPAIGN_FAILED":
    case "DEVICE_DISCONNECTED":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
          <AlertCircle className="size-4" />
        </div>
      );
    case "DEVICE_CONNECTED":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Smartphone className="size-4" />
        </div>
      );
    default:
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
          <Info className="size-4" />
        </div>
      );
  }
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case "CAMPAIGN_COMPLETED":
      return "Campaign Completed";
    case "CAMPAIGN_PAUSED":
      return "Campaign Paused";
    case "CAMPAIGN_FAILED":
      return "Campaign Failed";
    case "DEVICE_CONNECTED":
      return "Device Connected";
    case "DEVICE_DISCONNECTED":
      return "Device Disconnected";
    case "PAYMENT_RECEIVED":
      return "Payment";
    case "SUBSCRIPTION_EXPIRING":
      return "Subscription Expiring";
    case "SUBSCRIPTION_CANCELED":
      return "Subscription Canceled";
    case "USER_REGISTERED":
      return "User Registered";
    case "SYSTEM_ALERT":
      return "System Alert";
    default:
      return "Notification";
  }
}
