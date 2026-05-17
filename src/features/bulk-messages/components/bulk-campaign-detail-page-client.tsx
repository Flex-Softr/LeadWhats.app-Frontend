"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  EyeOff,
  FlaskConical,
  Loader2,
  MessageSquare,
  Phone,
  Server,
  Smartphone,
  XCircle,
} from "lucide-react";

import { dashboardPath } from "@/config/app-routes";
import { StatCard } from "@/features/shared/components/stat-card";
import {
  bulkSelectionLabel,
  deviceModeLabel,
  formatBulkCampaignWhen,
} from "@/features/bulk-messages/lib/bulk-campaign-format";
import type { BulkCampaignDetailApi } from "@/types/bulk-campaign-api";
import { usePathname } from "next/navigation";

import { ApiError, apiFetch, apiJson } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type BulkCampaignDetailPageClientProps = {
  campaignId: string;
};

function statusBadgeClass(
  status: BulkCampaignDetailApi["campaign"]["status"]
) {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
  }
  if (status === "failed") {
    return "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200";
  }
  return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200";
}

function statusLabel(status: BulkCampaignDetailApi["campaign"]["status"]) {
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  return "Scheduled";
}

function outboundStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "sent") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 font-normal text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Sent
      </Badge>
    );
  }
  if (s === "failed") {
    return (
      <Badge className="border-red-200 bg-red-50 font-normal text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        Failed
      </Badge>
    );
  }
  if (s === "queued") {
    return (
      <Badge className="border-amber-200 bg-amber-50 font-normal text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Queued
      </Badge>
    );
  }
  if (s === "simulated") {
    return (
      <Badge variant="secondary" className="font-normal">
        Simulated
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="font-normal">
      {status}
    </Badge>
  );
}

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function BulkCampaignDetailPageClient({
  campaignId,
}: BulkCampaignDetailPageClientProps) {
  const pathname = usePathname();
  const [downloading, setDownloading] = React.useState(false);
  const [detail, setDetail] = React.useState<BulkCampaignDetailApi | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void apiJson<BulkCampaignDetailApi>(`/v1/bulk-campaigns/${campaignId}`)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err instanceof ApiError ? err.message : "Could not load campaign.";
          setLoadError(msg);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, pathname]);

  async function downloadAttachment() {
    const c = detail?.campaign;
    if (!c?.attachmentAssetId || !c.attachmentFileName) return;
    setDownloading(true);
    try {
      const res = await apiFetch(`/v1/templates/media/${c.attachmentAssetId}`);
      if (!res.ok) {
        toast.error("Download failed", {
          description: "Could not load the attachment.",
        });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = c.attachmentFileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download saved", {
        description: c.attachmentFileName,
      });
    } finally {
      setDownloading(false);
    }
  }

  const campaign = detail?.campaign;
  const stats = detail?.stats;
  const target = stats?.targetRecipients ?? campaign?.recipientCount ?? 0;
  const sent = stats?.sent ?? 0;
  const deliveryPct =
    target > 0 ? Math.min(100, Math.round((sent / target) * 100)) : 0;
  const rowsPct =
    target > 0 && stats
      ? Math.min(100, Math.round((stats.totalOutboundRows / target) * 100))
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-16 lg:space-y-10">
        <Button variant="ghost" className="-ml-2 gap-2">
          <Link href={dashboardPath("/bulk-messages")} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to bulk messages
          </Link>
        </Button>

        {loading && !campaign ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
            <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
            <p className="text-sm">Loading campaign…</p>
          </div>
        ) : loadError ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="px-6 py-8 text-center">
              <p className="text-destructive">{loadError}</p>
              <Button className="mt-6" variant="outline">
                <Link href={dashboardPath("/bulk-messages")}>Return to list</Link>
              </Button>
            </CardContent>
          </Card>
        ) : campaign && stats && detail ? (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                {campaign.name}
              </h1>
              <p className="max-w-3xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
                Delivery breakdown, devices, message content, and recent
                outbound rows for this campaign.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusBadgeClass(campaign.status)}>
                {statusLabel(campaign.status)}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {campaign.kind === "text" ? "Text" : "Template"}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {deviceModeLabel(campaign.deviceMode)}
              </Badge>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Delivery progress
              </h2>
              <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex flex-wrap items-end justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    WhatsApp delivered (sent)
                  </span>
                  <span className="tabular-nums font-semibold">
                    {sent} / {target}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({deliveryPct}%)
                    </span>
                  </span>
                </div>
                <ProgressBar value={sent} max={target} />
                <div className="flex flex-wrap items-end justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Outbound rows created
                  </span>
                  <span className="tabular-nums font-medium">
                    {stats.totalOutboundRows} / {target}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({rowsPct}%)
                    </span>
                  </span>
                </div>
                <ProgressBar
                  value={stats.totalOutboundRows}
                  max={target}
                  className="opacity-80"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Delivered (sent)"
                value={stats.sent}
                icon={CheckCircle2}
                accent="green"
              />
              <StatCard
                label="Failed"
                value={stats.failed}
                icon={XCircle}
                accent="red"
              />
              <StatCard
                label="In queue"
                value={stats.pendingInQueue}
                icon={Clock}
                accent="amber"
              />
              <StatCard
                label="Simulated"
                value={stats.simulated}
                icon={FlaskConical}
                accent="slate"
              />
              <StatCard
                label="Not dispatched yet"
                value={stats.notDispatchedYet}
                icon={Server}
                accent="indigo"
              />
              <StatCard
                label="Read / seen"
                value="—"
                icon={EyeOff}
                accent="slate"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Read receipts are not stored on outbound messages yet, so
              &quot;seen&quot; counts are unavailable. Failed rows include the
              error on each recipient below.
            </p>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-2">
              <Card size="sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="size-4" />
                    Schedule &amp; dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-right font-medium">
                      {formatBulkCampaignWhen(campaign.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-right font-medium">
                      {formatBulkCampaignWhen(campaign.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Send</span>
                    <span className="text-right font-medium">
                      {campaign.scheduleType === "scheduled" &&
                      campaign.scheduledAt
                        ? formatBulkCampaignWhen(campaign.scheduledAt)
                        : "Immediate"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Audience</span>
                    <span className="text-right font-medium">
                      {bulkSelectionLabel(campaign.selectionMode)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Delay</span>
                    <span className="text-right tabular-nums">
                      {campaign.delayMinSec}–{campaign.delayMaxSec}s random
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Retries</span>
                    <span className="text-right tabular-nums">
                      up to {campaign.maxRetries}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Anti-block</span>
                    <span className="text-right font-medium">
                      {campaign.antiBlock.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {campaign.antiBlock.enabled ? (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Uniqueness</span>
                        <span className="text-right font-medium">
                          {campaign.antiBlock.uniquenessMode.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Batch pause</span>
                        <span className="text-right tabular-nums">
                          every {campaign.antiBlock.batchPauseEvery} msgs,{" "}
                          {campaign.antiBlock.batchPauseSec}s wait
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Fail limit</span>
                        <span className="text-right tabular-nums">
                          {campaign.antiBlock.failLimitInRow} in a row
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Active hours</span>
                        <span className="text-right tabular-nums">
                          {campaign.antiBlock.activeHoursStart &&
                          campaign.antiBlock.activeHoursEnd
                            ? `${campaign.antiBlock.activeHoursStart} - ${campaign.antiBlock.activeHoursEnd}`
                            : "Any time"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Inactive time</span>
                        <span className="text-right tabular-nums">
                          {campaign.antiBlock.inactiveHoursStart &&
                          campaign.antiBlock.inactiveHoursEnd
                            ? `${campaign.antiBlock.inactiveHoursStart} - ${campaign.antiBlock.inactiveHoursEnd}`
                            : "None"}
                        </span>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="size-4" />
                    Message content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-sm">
                  {campaign.kind === "template" ? (
                    detail.template ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Template
                        </p>
                        <p className="mt-1 font-medium">{detail.template.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Type: {detail.template.typeId.replace(/_/g, " ")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Template metadata unavailable.
                      </p>
                    )
                  ) : (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Text body
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                        {detail.messagePreview?.trim() || "—"}
                      </p>
                    </div>
                  )}
                  {campaign.attachmentType ? (
                    <div className="rounded-lg border bg-muted/40 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Attachment
                      </p>
                      <p className="mt-1 capitalize">
                        {campaign.attachmentType}
                        {campaign.attachmentFileName
                          ? ` · ${campaign.attachmentFileName}`
                          : ""}
                      </p>
                      {campaign.attachmentAssetId &&
                      campaign.attachmentFileName ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-2"
                          disabled={downloading}
                          onClick={() => void downloadAttachment()}
                        >
                          {downloading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4" />
                          )}
                          Download
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <Card size="sm">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="size-4" />
                  Devices in campaign
                </CardTitle>
                <CardDescription>
                  Sessions selected when the campaign was created. Stats show
                  sends per device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <ul className="flex flex-wrap gap-2">
                  {detail.devices.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{d.name}</span>
                      {d.phone ? (
                        <span className="text-muted-foreground">· {d.phone}</span>
                      ) : null}
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        {d.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
                {detail.deviceSendStats.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device</TableHead>
                          <TableHead className="text-right">Sent</TableHead>
                          <TableHead className="text-right">Failed</TableHead>
                          <TableHead className="text-right">Queued</TableHead>
                          <TableHead className="text-right">Sim.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.deviceSendStats.map((r) => (
                          <TableRow key={r.deviceId}>
                            <TableCell className="font-medium">
                              <div>{r.deviceName}</div>
                              {r.phone ? (
                                <div className="text-xs text-muted-foreground">
                                  {r.phone}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.sent}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.failed}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.queued}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.simulated}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {r.total}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-base">
                  Recent messages
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (last {detail.recentMessages.length})
                  </span>
                </CardTitle>
                <CardDescription>
                  One row per outbound attempt. Errors appear under the
                  recipient for failed sends.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-0">
                {detail.recentMessages.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No outbound rows yet (e.g. scheduled campaign not started,
                    or still queuing).
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Device
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Time
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.recentMessages.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="align-top font-mono text-xs">
                              {m.toPhone}
                              {m.errorMessage ? (
                                <div className="mt-1 max-w-[220px] text-[11px] font-sans text-destructive sm:max-w-md">
                                  {m.errorMessage}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="align-top">
                              {outboundStatusBadge(m.status)}
                            </TableCell>
                            <TableCell className="hidden align-top text-sm sm:table-cell">
                              <div>{m.deviceName}</div>
                              {m.devicePhone ? (
                                <div className="text-xs text-muted-foreground">
                                  {m.devicePhone}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="hidden align-top text-xs text-muted-foreground md:table-cell">
                              {formatBulkCampaignWhen(m.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
    </div>
  );
}
