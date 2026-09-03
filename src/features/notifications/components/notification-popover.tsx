"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  Smartphone,
  Info,
  Loader2,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/features/notifications/lib/notifications-api";
import type { AppNotification, NotificationType } from "@/types/notification";

function formatTimeAgo(isoString: string): string {
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

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "CAMPAIGN_COMPLETED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
        </div>
      );
    case "PAYMENT_RECEIVED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <CreditCard className="size-4" />
        </div>
      );
    case "CAMPAIGN_PAUSED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <AlertTriangle className="size-4" />
        </div>
      );
    case "CAMPAIGN_FAILED":
    case "DEVICE_DISCONNECTED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
          <AlertCircle className="size-4" />
        </div>
      );
    case "DEVICE_CONNECTED":
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Smartphone className="size-4" />
        </div>
      );
    default:
      return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
          <Info className="size-4" />
        </div>
      );
  }
}

export function NotificationPopover() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filterUnread, setFilterUnread] = React.useState(false);

  // Poll unread count periodically
  const loadUnreadCount = React.useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Silently ignore network or polling errors
    }
  }, []);

  React.useEffect(() => {
    void loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 25_000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Load notification list when dropdown opens or filter changes
  const loadNotifications = React.useCallback(async (unreadOnly: boolean) => {
    setLoading(true);
    try {
      const res = await fetchNotifications({ unreadOnly, pageSize: 20 });
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      void loadNotifications(filterUnread);
    }
  }, [open, filterUnread, loadNotifications]);

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-10 rounded-full text-foreground hover:bg-muted"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-[20px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-bold text-white ring-2 ring-background animate-in fade-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[360px] max-w-[95vw] rounded-xl p-0 shadow-xl border border-border/80 bg-popover overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0.2 text-[11px] font-medium">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Check className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border/40 px-3 py-1.5 bg-muted/20 text-xs">
          <button
            type="button"
            onClick={() => setFilterUnread(false)}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              !filterUnread
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterUnread(true)}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filterUnread
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
                <Inbox className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filterUnread
                  ? "You have no unread notifications."
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => void handleNotificationClick(notif)}
                className={`group flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/50 ${
                  !notif.isRead ? "bg-primary/5" : ""
                }`}
              >
                {getNotificationIcon(notif.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`text-xs truncate ${
                        !notif.isRead
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground/85"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <span className="text-[10px] shrink-0 text-muted-foreground">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary opacity-90 group-hover:opacity-100">
                      <span>View details</span>
                      <ExternalLink className="size-3" />
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                  <span className="size-2 shrink-0 rounded-full bg-pink-500 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
