"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateBulkCampaignDialog } from "@/features/bulk-messages/components/create-bulk-campaign-dialog";
import {
  bulkSelectionLabel,
  deviceModeLabel,
  formatBulkCampaignWhen,
} from "@/features/bulk-messages/lib/bulk-campaign-format";
import type {
  BulkCampaignListItemApi,
  BulkCampaignsListResponse,
} from "@/types/bulk-campaign-api";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { StatCard } from "@/features/shared/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";

// function statusBadge(status: BulkCampaignListItemApi["status"]) {
//   if (status === "completed") {
//     return (
//       <Badge className="border-emerald-200 bg-emerald-50 font-normal text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
//         Completed
//       </Badge>
//     );
//   }
//   if (status === "failed") {
//     return (
//       <Badge className="border-red-200 bg-red-50 font-normal text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
//         Failed
//       </Badge>
//     );
//   }
//   return (
//     <Badge className="border-amber-200 bg-amber-50 font-normal text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
//       Scheduled
//     </Badge>
//   );
// }

function statusBadge(status: BulkCampaignListItemApi["status"]) {
  if (status === "completed") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 font-normal text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Completed
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge className="border-red-200 bg-red-50 font-normal text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        Failed
      </Badge>
    );
  }

  if (status === "running") {
    return (
      <Badge className="border-blue-200 bg-blue-50 font-normal text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        Running
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge className="border-orange-200 bg-orange-50 font-normal text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200">
        Pending
      </Badge>
    );
  }

  return (
    <Badge className="border-amber-200 bg-amber-50 font-normal text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Scheduled
    </Badge>
  );
}



export function BulkMessagesClient() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [campaigns, setCampaigns] = React.useState<BulkCampaignListItemApi[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("all");

  const loadCampaigns = React.useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await apiJson<BulkCampaignsListResponse>("/v1/bulk-campaigns");
      setCampaigns(data.campaigns);
    } catch (err) {
      //console.error(err);
    
      const msg =
        err instanceof ApiError ? err.message : "Could not load campaigns.";
    
      toast.error("Load failed", { description: msg });
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns, userId, workspaceId, routeKey]);

  const stats = React.useMemo(() => {
    const totalRecipients = campaigns.reduce((a, c) => a + c.recipientCount, 0);
    const completed = campaigns.filter((c) => c.status === "completed").length;
    const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
    const failed = campaigns.filter((c) => c.status === "failed").length;
    return {
      totalRecipients,
      completed,
      scheduled,
      failed,
    };
  }, [campaigns]);

  const runningCampaigns = React.useMemo(
    () => campaigns.filter((c) => c.status === "running"),
    [campaigns]
  );
  
  const pendingCampaigns = React.useMemo(
    () =>
      campaigns.filter(
        (c) => c.status === "pending" || c.status === "scheduled"
      ),
    [campaigns]
  );
  
  const historyCampaigns = React.useMemo(() => {
    let data = campaigns.filter(
      (c) =>
        c.status !== "running" &&
        c.status !== "pending"
    );
  
    if (statusFilter !== "all") {
      data = data.filter((c) => c.status === statusFilter);
    }
  
    return data;
  }, [campaigns, statusFilter]);

  const pagination = usePagination({
    totalItems: historyCampaigns.length,
    initialPageSize: 10,
  });
  const pagedCampaigns = pagination.slice(historyCampaigns);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-8 lg:space-y-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              Bulk Messages
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              Compose campaigns, rotate across WhatsApp sessions, and target
              verified contacts or groups. Campaigns are stored and queued;
              delivery uses your connected devices.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-11 gap-2 px-5"
              disabled={loading || refreshing}
              onClick={() => void loadCampaigns({ silent: true })}
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              type="button"
              className="h-11 gap-2 px-5 sm:w-auto"
              disabled={loading}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Create bulk campaign
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          <StatCard
            label="Campaigns"
            value={campaigns.length}
            icon={Megaphone}
            accent="violet"
          />
          <StatCard
            label="Recipients (total sends)"
            value={stats.totalRecipients}
            icon={Users}
            accent="blue"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            accent="green"
          />
          <StatCard
            label="Scheduled / failed"
            value={stats.scheduled + stats.failed}
            icon={CalendarClock}
            accent="amber"
          />
        </div>


        {(runningCampaigns.length > 0 || pendingCampaigns.length > 0) && (
  <Card className="rounded-lg border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
    <CardContent className="p-0">
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-semibold">
          Active Campaigns
        </h3>
        <p className="text-sm text-muted-foreground">
          Running and queued campaigns
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead className="hidden md:table-cell">
              Schedule
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              Created
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {[...runningCampaigns, ...pendingCampaigns].map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link
                  href={`/bulk-messages/${c.id}`}
                  className="block w-full rounded-md text-left transition-colors hover:bg-muted/50"
                >
                  <div className="font-medium text-primary underline-offset-4 hover:underline">
                    {c.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {c.kind === "text" ? "Text" : "Template"} ·{" "}
                    {deviceModeLabel(c.deviceMode)}
                  </div>
                </Link>
              </TableCell>

              <TableCell>{statusBadge(c.status)}</TableCell>

              <TableCell>{c.recipientCount}</TableCell>

              <TableCell className="hidden md:table-cell text-muted-foreground">
                {c.scheduleType === "scheduled" && c.scheduledAt
                  ? formatBulkCampaignWhen(c.scheduledAt)
                  : "Immediate"}
              </TableCell>

              <TableCell className="hidden sm:table-cell text-muted-foreground">
                {formatBulkCampaignWhen(c.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)}


        <Card className="rounded-lg border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
          <CardContent className="p-0 sm:rounded-3xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
                <Loader2 className="size-9 animate-spin text-violet-600 dark:text-violet-400" />
                <p className="text-sm">Loading campaigns…</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-6 sm:p-8 lg:p-10">
                <ListEmptyState
                  icon={Megaphone}
                  title="No campaigns yet"
                  description="Create a bulk campaign to reach your audience. Pull sessions from Devices, templates from Templates, and verified contacts from Contacts."
                />
              </div>
            ) : (
              <>
              <div className="flex items-center justify-between border-b px-6 py-4">
  <div>
    <h3 className="text-lg font-semibold">
      Campaign History
    </h3>
    <p className="text-sm text-muted-foreground">
      Completed, failed and archived campaigns
    </p>
  </div>

  <Select
    value={statusFilter}
    onValueChange={(value) => setStatusFilter(value ?? "all")}
  >
    <SelectTrigger className="w-[180px] rounded-sm">
      <SelectValue placeholder="Filter status" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="completed">Completed</SelectItem>
      <SelectItem value="failed">Failed</SelectItem>
      <SelectItem value="scheduled">Scheduled</SelectItem>
    </SelectContent>
  </Select>
</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Recipients</TableHead>
                    <TableHead className="hidden md:table-cell">Audience</TableHead>
                    <TableHead className="hidden lg:table-cell">Schedule</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedCampaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          href={`/bulk-messages/${c.id}`}
                          className="block w-full rounded-md text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="font-medium text-primary underline-offset-4 hover:underline">
                            {c.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.kind === "text" ? "Text" : "Template"} ·{" "}
                            {deviceModeLabel(c.deviceMode)} · {c.delayMinSec}–
                            {c.delayMaxSec}s random · retries {c.maxRetries}
                            {c.antiBlock.enabled ? (
                              <>
                                {" "}
                                · anti-block on
                                {c.antiBlock.repliedOnly ? " · replied-only" : ""}
                                {c.antiBlock.recent24hOnly ? " · 24h-window" : ""}
                              </>
                            ) : null}
                            {c.attachmentType ? (
                              <>
                                {" "}
                                ·{" "}
                                <span className="capitalize">
                                  {c.attachmentType}
                                </span>
                                {c.attachmentFileName
                                  ? ` (${c.attachmentFileName})`
                                  : ""}
                              </>
                            ) : null}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell className="hidden tabular-nums sm:table-cell">
                        {c.recipientCount}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {bulkSelectionLabel(c.selectionMode)}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {c.scheduleType === "scheduled" && c.scheduledAt
                          ? formatBulkCampaignWhen(c.scheduledAt)
                          : "Immediate"}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {formatBulkCampaignWhen(c.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </>
            )}
            {!loading && campaigns.length > 0 ? (
              <TablePagination {...pagination} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <CreateBulkCampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void loadCampaigns({ silent: true })}
      />
    </>
  );
}
