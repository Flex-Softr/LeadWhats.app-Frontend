"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
  Inbox,
  CheckCircle2,
  MailCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/table-pagination";
import { useControlledPagination } from "@/hooks/use-pagination";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/features/notifications/lib/notifications-api";
import {
  formatTimeAgo,
  formatDateTime,
  getNotificationIcon,
  getNotificationTypeLabel,
} from "@/features/notifications/lib/notification-ui-helpers";
import type { AppNotification } from "@/types/notification";

export function NotificationsClient() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [filterTab, setFilterTab] = React.useState<"all" | "unread">("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications({
        unreadOnly: filterTab === "unread",
        page,
        pageSize,
      });
      setNotifications(res.notifications);
      setTotalItems(res.pagination.total);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [filterTab, page, pageSize]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleTabChange = (tab: "all" | "unread") => {
    if (tab === filterTab) return;
    setFilterTab(tab);
    setPage(1);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    if (filterTab === "unread") {
      setTotalItems((prev) => Math.max(0, prev - 1));
    }
    try {
      await markNotificationAsRead(id);
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Failed to mark read:", err);
      toast.error("Failed to mark as read");
      void loadData();
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setActionLoading(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (filterTab === "unread") {
        setNotifications([]);
        setTotalItems(0);
      }
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Could not mark all as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotalItems((prev) => Math.max(0, prev - 1));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error("Could not delete notification");
      void loadData();
    }
  };

  const handleRowClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }

    if (notif.link) {
      router.push(notif.link);
    }
  };

  const pagination = useControlledPagination({
    page,
    pageSize,
    totalItems,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setPageSize(size);
      setPage(1);
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-16 lg:space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            <Bell className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Notifications
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Stay updated on campaign execution, device connection status, payments, and system notices.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={loading}
            onClick={() => void loadData()}
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            disabled={unreadCount === 0 || actionLoading}
            onClick={() => void handleMarkAllRead()}
          >
            {actionLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5 text-primary" />
            )}
            Mark all read
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <Bell className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {filterTab === "all" ? totalItems : totalItems + (unreadCount > 0 ? 0 : 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
            <Inbox className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Unread</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {unreadCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Read</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {Math.max(0, (filterTab === "all" ? totalItems : totalItems) - unreadCount)}
            </p>
          </div>
        </div>
      </div>

      {/* Main List Card */}
      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterTab === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
              <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                {filterTab === "all" ? totalItems : totalItems + unreadCount}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("unread")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterTab === "unread"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 px-1.5 py-0 text-[11px]">
                  {unreadCount}
                </Badge>
              )}
            </button>
          </div>
        </div>

        <CardContent className="p-0">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <Inbox className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No notifications</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {filterTab === "unread"
                  ? "You have no unread notifications at the moment."
                  : "You're all caught up! There are no notifications to display."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => void handleRowClick(notif)}
                  className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/40 ${
                    !notif.isRead ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {getNotificationIcon(notif.type)}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-sm ${
                            !notif.isRead
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/80"
                          }`}
                        >
                          {notif.title}
                        </span>

                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground"
                        >
                          {getNotificationTypeLabel(notif.type)}
                        </Badge>

                        {!notif.isRead && (
                          <span className="inline-flex size-2 rounded-full bg-pink-500" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                        <span>•</span>
                        <span>{formatDateTime(notif.createdAt)}</span>
                        {notif.link && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium text-primary hover:underline">
                              <span>Open related page</span>
                              <ExternalLink className="size-3" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    {!notif.isRead && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                        title="Mark as read"
                        onClick={(e) => void handleMarkAsRead(e, notif.id)}
                      >
                        <Check className="size-3.5" />
                        <span className="hidden sm:inline">Mark read</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-rose-500"
                      title="Delete notification"
                      aria-label="Delete notification"
                      onClick={(e) => void handleDelete(e, notif.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {totalItems > 0 && (
          <div className="border-t border-border/60 p-4">
            <TablePagination {...pagination} />
          </div>
        )}
      </Card>
    </div>
  );
}
