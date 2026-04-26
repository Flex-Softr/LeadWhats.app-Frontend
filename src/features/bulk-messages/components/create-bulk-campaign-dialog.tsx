"use client";

import * as React from "react";
import { Loader2, Phone, Send, Shield, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { MessageTypeCards } from "@/features/single-message/components/message-type-cards";
import type { MessageFormType } from "@/features/single-message/components/message-type-cards";
import { useContacts } from "@/features/contacts/contacts-provider";
import type { CreateBulkCampaignResponse } from "@/types/bulk-campaign-api";
import type { DeviceApiRecord, DevicesListResponse } from "@/types/device";
import type {
  MessageTemplateApiRecord,
  TemplatesListResponse,
} from "@/types/templates-api";
import { ApiError, apiFormJson, apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ATTACHMENT_TYPES = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "audio", label: "Audio" },
] as const;

type AttachmentType = (typeof ATTACHMENT_TYPES)[number]["value"];
type SelectionMode = "groups" | "allVerified" | "manual";
type ScheduleType = "immediate" | "scheduled";
type DeviceMode = "single" | "failover" | "round_robin";
type UniquenessMode = "none" | "campaign" | "workspace_window";

const DEVICE_MODE_OPTIONS: {
  value: DeviceMode;
  title: string;
  description: string;
  icon: typeof Phone;
}[] = [
  {
    value: "single",
    title: "Single",
    description: "One device",
    icon: Phone,
  },
  {
    value: "failover",
    title: "Failover",
    description: "Sequential backup",
    icon: Shield,
  },
  {
    value: "round_robin",
    title: "Round Robin",
    description: "Rotate devices",
    icon: Shuffle,
  },
];

function acceptForAttachmentType(t: AttachmentType): string {
  switch (t) {
    case "image":
      return "image/jpeg,image/png,image/gif,image/webp";
    case "video":
      return "video/*";
    case "audio":
      return "audio/*";
    case "document":
      return ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,application/pdf";
    default:
      return "*/*";
  }
}

type CreateBulkCampaignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

function useRecipientSummary(
  mode: SelectionMode,
  selectedGroupIds: Set<string>,
  manualNumbers: string,
  groupStats: (id: string) => { verified: number; total: number },
  globalVerified: number
) {
  return React.useMemo(() => {
    if (mode === "allVerified") {
      return {
        count: globalVerified,
        verifiedOnly: true,
      };
    }
    if (mode === "groups") {
      let n = 0;
      for (const id of selectedGroupIds) {
        n += groupStats(id).verified;
      }
      return { count: n, verifiedOnly: true };
    }
    const lines = manualNumbers
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return { count: lines.length, verifiedOnly: false };
  }, [mode, selectedGroupIds, manualNumbers, groupStats, globalVerified]);
}

export function CreateBulkCampaignDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBulkCampaignDialogProps) {
  const { groups, groupStats, globalStats, refreshGroups } = useContacts();

  const [contextLoading, setContextLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [allDevices, setAllDevices] = React.useState<DeviceApiRecord[]>([]);
  const [templates, setTemplates] = React.useState<MessageTemplateApiRecord[]>(
    []
  );

  const [campaignName, setCampaignName] = React.useState("");
  const [deviceMode, setDeviceMode] = React.useState<DeviceMode>("round_robin");
  const [singleDeviceId, setSingleDeviceId] = React.useState("");
  const [sessionIds, setSessionIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [messageType, setMessageType] = React.useState<MessageFormType>("text");
  const [messageText, setMessageText] = React.useState("");
  const [templateId, setTemplateId] = React.useState("");
  const [attachmentType, setAttachmentType] =
    React.useState<AttachmentType>("image");
  const [attachmentAssetId, setAttachmentAssetId] = React.useState("");
  const [attachmentOriginalName, setAttachmentOriginalName] =
    React.useState("");
  const [attachmentUploading, setAttachmentUploading] = React.useState(false);
  const [scheduleType, setScheduleType] =
    React.useState<ScheduleType>("immediate");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [delayMinSec, setDelayMinSec] = React.useState("15");
  const [delayMaxSec, setDelayMaxSec] = React.useState("45");
  const [maxRetries, setMaxRetries] = React.useState("3");
  const [selectionMode, setSelectionMode] =
    React.useState<SelectionMode>("groups");
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [manualNumbers, setManualNumbers] = React.useState("");
  const [antiBlockEnabled, setAntiBlockEnabled] = React.useState(true);
  const [spintaxEnabled, setSpintaxEnabled] = React.useState(false);
  const [verifyNumbers, setVerifyNumbers] = React.useState(false);
  const [repliedOnly, setRepliedOnly] = React.useState(false);
  const [recent24hOnly, setRecent24hOnly] = React.useState(false);
  const [uniquenessMode, setUniquenessMode] =
    React.useState<UniquenessMode>("none");
  const [batchPauseEvery, setBatchPauseEvery] = React.useState("30");
  const [batchPauseSec, setBatchPauseSec] = React.useState("30");
  const [failLimitInRow, setFailLimitInRow] = React.useState("5");
  const [activeHoursStart, setActiveHoursStart] = React.useState("");
  const [activeHoursEnd, setActiveHoursEnd] = React.useState("");

  const g = globalStats();
  const { count: recipientCount, verifiedOnly } = useRecipientSummary(
    selectionMode,
    selectedGroupIds,
    manualNumbers,
    groupStats,
    g.verified
  );

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      try {
        const loadedGroups = await refreshGroups();
        const [devRes, tplRes] = await Promise.all([
          apiJson<DevicesListResponse>("/v1/devices"),
          apiJson<TemplatesListResponse>("/v1/templates"),
        ]);
        if (cancelled) return;
        setAllDevices(devRes.devices);
        setTemplates(
          tplRes.templates.filter((tpl) => tpl.active !== false)
        );
        const connected = devRes.devices.filter((d) => d.status === "connected");

        setCampaignName("");
        setDeviceMode("round_robin");
        setSessionIds(new Set(connected.map((d) => d.id)));
        setSingleDeviceId(connected[0]?.id ?? "");
        setMessageType("text");
        setMessageText("");
        setTemplateId("");
        setAttachmentType("image");
        setAttachmentAssetId("");
        setAttachmentOriginalName("");
        setScheduleType("immediate");
        setScheduledAt("");
        setDelayMinSec("15");
        setDelayMaxSec("45");
        setMaxRetries("3");
        setSelectionMode("groups");
        setSelectedGroupIds(new Set(loadedGroups.map((x) => x.id)));
        setManualNumbers("");
        setAntiBlockEnabled(true);
        setSpintaxEnabled(false);
        setVerifyNumbers(false);
        setRepliedOnly(false);
        setRecent24hOnly(false);
        setUniquenessMode("none");
        setBatchPauseEvery("30");
        setBatchPauseSec("30");
        setFailLimitInRow("5");
        setActiveHoursStart("");
        setActiveHoursEnd("");
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError
              ? err.message
              : "Could not load devices or templates.";
          toast.error("Load failed", { description: msg });
          setAllDevices([]);
          setTemplates([]);
          setSessionIds(new Set());
        }
      } finally {
        if (!cancelled) {
          setContextLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, refreshGroups]);

  React.useEffect(() => {
    if (messageType === "text") setTemplateId("");
  }, [messageType]);

  React.useEffect(() => {
    setAttachmentAssetId("");
    setAttachmentOriginalName("");
  }, [attachmentType]);

  function toggleSession(id: string, checked: boolean) {
    const dev = allDevices.find((d) => d.id === id);
    if (dev && dev.status !== "connected") return;
    setSessionIds((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  async function handleAttachmentFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachmentUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const meta = await apiFormJson<{
        id: string;
        originalName: string;
      }>("/v1/templates/media", form);
      setAttachmentAssetId(meta.id);
      setAttachmentOriginalName(meta.originalName);
      toast.success("File uploaded", { description: meta.originalName });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Upload failed.";
      toast.error("Upload failed", { description: msg });
      setAttachmentAssetId("");
      setAttachmentOriginalName("");
    } finally {
      setAttachmentUploading(false);
    }
  }

  function toggleGroup(id: string, checked: boolean) {
    setSelectedGroupIds((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  const messageOk =
    messageType === "text"
      ? messageText.trim().length > 0
      : templateId !== "" && templates.some((t) => t.id === templateId);

  const recipientsOk =
    selectionMode === "groups"
      ? selectedGroupIds.size > 0
      : selectionMode === "allVerified"
        ? g.verified > 0
        : manualNumbers
            .split("\n")
            .map((l) => l.trim())
            .some(Boolean);

  const scheduleOk =
    scheduleType === "immediate" ||
    (scheduleType === "scheduled" && scheduledAt.trim().length > 0);

  const hasConnectedDevice = allDevices.some((d) => d.status === "connected");

  const devicesOk =
    deviceMode === "single"
      ? Boolean(
          singleDeviceId &&
            allDevices.some(
              (d) => d.id === singleDeviceId && d.status === "connected"
            )
        )
      : sessionIds.size > 0;

  const activeHoursPairOk =
    (activeHoursStart.trim().length === 0 && activeHoursEnd.trim().length === 0) ||
    (activeHoursStart.trim().length > 0 && activeHoursEnd.trim().length > 0);

  const canSubmit =
    !contextLoading &&
    !submitting &&
    !attachmentUploading &&
    hasConnectedDevice &&
    campaignName.trim().length > 0 &&
    devicesOk &&
    messageOk &&
    recipientsOk &&
    scheduleOk &&
    activeHoursPairOk;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const rawLo = parseInt(delayMinSec, 10) || 0;
      const rawHi = parseInt(delayMaxSec, 10) || 0;
      const delayLo = Math.min(3600, Math.max(0, Math.min(rawLo, rawHi)));
      const delayHi = Math.min(3600, Math.max(0, Math.max(rawLo, rawHi)));
      const retries = Math.min(10, Math.max(0, parseInt(maxRetries, 10) || 0));
      const batchEvery = Math.min(
        5000,
        Math.max(1, parseInt(batchPauseEvery, 10) || 1)
      );
      const batchSec = Math.min(
        3600,
        Math.max(1, parseInt(batchPauseSec, 10) || 1)
      );
      const failLimit = Math.min(
        1000,
        Math.max(1, parseInt(failLimitInRow, 10) || 1)
      );

      const deviceIds =
        deviceMode === "single" ? [singleDeviceId] : [...sessionIds];

      const payload = {
        name: campaignName.trim(),
        deviceIds,
        deviceMode,
        kind: messageType,
        bodyText:
          messageType === "text" ? messageText.trim() : undefined,
        templateId:
          messageType === "template" && templateId
            ? templateId
            : undefined,
        attachmentAssetId: attachmentAssetId.trim() || null,
        selectionMode:
          selectionMode === "groups"
            ? "groups"
            : selectionMode === "allVerified"
              ? "all_verified"
              : "manual",
        groupIds:
          selectionMode === "groups"
            ? [...selectedGroupIds]
            : undefined,
        manualPhones:
          selectionMode === "manual"
            ? manualNumbers
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
            : undefined,
        attachmentType,
        scheduleType:
          scheduleType === "immediate" ? "immediate" : "scheduled",
        scheduledAt:
          scheduleType === "scheduled"
            ? new Date(scheduledAt).toISOString()
            : null,
        delayMinSec: delayLo,
        delayMaxSec: delayHi,
        maxRetries: retries,
        antiBlock: {
          enabled: antiBlockEnabled,
          spintax: spintaxEnabled,
          verifyNumbers,
          repliedOnly,
          recent24hOnly,
          uniquenessMode,
          batchPauseEvery: batchEvery,
          batchPauseSec: batchSec,
          failLimitInRow: failLimit,
          activeHoursStart: activeHoursStart.trim() || null,
          activeHoursEnd: activeHoursEnd.trim() || null,
        },
      };

      const out = await apiJson<CreateBulkCampaignResponse>(
        "/v1/bulk-campaigns",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      toast.success("Campaign created", {
        description:
          out.dispatchedMessages > 0
            ? `“${out.campaign.name}” — ${out.dispatchedMessages} message(s) recorded (${out.campaign.recipientCount} recipients).`
            : `“${out.campaign.name}” is scheduled (${out.campaign.recipientCount} recipients).`,
      });
      if (out.note) {
        toast.message("Note", { description: out.note });
      }
      onCreated?.();
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not create campaign.";
      toast.error("Create failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  function deviceLabel(d: DeviceApiRecord): string {
    const bits = [d.name];
    if (d.phone) bits.push(d.phone);
    return bits.join(" · ");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(94vh,900px)] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-3xl p-0",
          "border border-white/70 bg-white/95 shadow-2xl shadow-violet-950/10",
          "backdrop-blur-md sm:max-w-6xl",
          "dark:border-slate-800 dark:bg-slate-950/95"
        )}
      >
        <DialogHeader className="space-y-2 border-b border-slate-200/80 px-6 pb-5 pt-6 text-left sm:px-8 sm:pb-6 sm:pt-7 dark:border-slate-800">
          <DialogTitle className="font-heading pr-8 text-xl font-semibold tracking-tight sm:text-2xl">
            Build message campaign
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            Choose how devices share load, set random delays between sends, and
            pick verified recipients.
          </DialogDescription>
        </DialogHeader>

        {contextLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500 dark:text-slate-400">
            <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
            <p className="text-sm">Loading devices and templates…</p>
          </div>
        ) : (
          <>
            <div className="max-h-[min(62vh,640px)] overflow-y-auto">
              <div className="grid gap-8 px-6 py-7 sm:gap-10 sm:px-8 sm:py-8 lg:grid-cols-2 lg:items-start">
                <div className="space-y-7">
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="bulk-campaign-name"
                      className="text-sm font-semibold"
                    >
                      Campaign Name{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    <Input
                      id="bulk-campaign-name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g., Product Launch Announcement"
                      className="h-11 rounded-xl px-3.5 text-[15px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Device mode</Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {DEVICE_MODE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = deviceMode === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDeviceMode(opt.value)}
                            className={cn(
                              "flex flex-col items-start gap-1.5 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors",
                              active
                                ? "border-emerald-500 bg-emerald-50/90 dark:border-emerald-500 dark:bg-emerald-950/40"
                                : "border-slate-200/90 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <Icon
                                className={cn(
                                  "size-4",
                                  active
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "text-slate-500"
                                )}
                              />
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {opt.title}
                              </span>
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {opt.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        Single:
                      </span>{" "}
                      all sends use one session.{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        Failover:
                      </span>{" "}
                      try the next device if the previous is offline.{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        Round robin:
                      </span>{" "}
                      spread recipients across selected devices.
                    </p>
                  </div>

                  {deviceMode === "single" ? (
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="bulk-single-device"
                        className="text-sm font-semibold"
                      >
                        Device{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      <Select
                        value={singleDeviceId}
                        onValueChange={(v) => setSingleDeviceId(v ?? "")}
                      >
                        <SelectTrigger
                          id="bulk-single-device"
                          className="h-11 w-full rounded-xl"
                        >
                          <SelectValue placeholder="Select a device" />
                        </SelectTrigger>
                        <SelectContent>
                          {allDevices
                            .filter((d) => d.status === "connected")
                            .map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {deviceLabel(d)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold">
                        WhatsApp sessions{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                        <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
                          (select one or more)
                        </span>
                      </Label>
                      <ScrollArea className="h-40 rounded-xl border border-slate-200/90 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40">
                        <ul className="divide-y divide-slate-200/80 p-2 dark:divide-slate-800">
                          {allDevices.length === 0 ? (
                            <li className="px-3 py-8 text-center text-sm text-slate-500">
                              No devices yet — add a session under Devices.
                            </li>
                          ) : (
                            allDevices.map((d) => {
                              const connected = d.status === "connected";
                              return (
                                <li key={d.id}>
                                  <label
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                                      connected
                                        ? "cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/50"
                                        : "cursor-not-allowed opacity-60"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={!connected}
                                      checked={sessionIds.has(d.id)}
                                      onChange={(e) =>
                                        toggleSession(d.id, e.target.checked)
                                      }
                                      className="size-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 disabled:opacity-50"
                                    />
                                    <span className="text-[15px] text-slate-800 dark:text-slate-200">
                                      {deviceLabel(d)}
                                      {!connected ? (
                                        <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-400">
                                          (connect to use)
                                        </span>
                                      ) : null}
                                    </span>
                                  </label>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Message Type</Label>
                    <MessageTypeCards
                      value={messageType}
                      onChange={setMessageType}
                    />
                  </div>

                  {messageType === "text" ? (
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="bulk-message"
                        className="text-sm font-semibold"
                      >
                        Message Content{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      <Textarea
                        id="bulk-message"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Enter your message here..."
                        className="min-h-36 resize-y rounded-xl text-[15px] leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="bulk-template"
                        className="text-sm font-semibold"
                      >
                        Template{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      {templates.length === 0 ? (
                        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                          No templates — create one under Templates.
                        </p>
                      ) : (
                        <Select
                          value={templateId || "__none__"}
                          onValueChange={(v) =>
                            setTemplateId(
                              v === "__none__" || v == null ? "" : v
                            )
                          }
                        >
                          <SelectTrigger
                            id="bulk-template"
                            className="h-11 w-full rounded-xl"
                          >
                            <SelectValue placeholder="Choose a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              Choose a template…
                            </SelectItem>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/30">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Attachment (Optional)
                    </h3>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Attachment type (metadata)
                      </Label>
                      <Select
                        value={attachmentType}
                        onValueChange={(v) =>
                          setAttachmentType(v as AttachmentType)
                        }
                      >
                        <SelectTrigger className="h-11 w-full rounded-xl bg-white dark:bg-slate-950">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTACHMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="bulk-file"
                        className="text-xs font-medium text-slate-600 dark:text-slate-400"
                      >
                        File upload
                      </Label>
                      <Input
                        id="bulk-file"
                        type="file"
                        disabled={attachmentUploading}
                        accept={acceptForAttachmentType(attachmentType)}
                        onChange={(e) => void handleAttachmentFile(e)}
                        className="h-11 cursor-pointer rounded-xl bg-white px-3 dark:bg-slate-950"
                      />
                      {attachmentOriginalName ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-medium">Selected:</span>{" "}
                            {attachmentOriginalName}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="h-7 text-xs"
                            onClick={() => {
                              setAttachmentAssetId("");
                              setAttachmentOriginalName("");
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          Optional. File is stored and linked to this campaign (max
                          16 MB). Types above filter the file picker.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Schedule type
                      </Label>
                      <Select
                        value={scheduleType}
                        onValueChange={(v) =>
                          setScheduleType((v ?? "immediate") as ScheduleType)
                        }
                      >
                        <SelectTrigger className="h-11 w-full rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">
                            Send immediately
                          </SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm font-semibold">
                        Random delay between messages (seconds)
                      </Label>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="bulk-delay-min"
                            className="text-xs font-medium text-slate-500 dark:text-slate-400"
                          >
                            Min
                          </Label>
                          <Input
                            id="bulk-delay-min"
                            type="number"
                            min={0}
                            max={3600}
                            value={delayMinSec}
                            onChange={(e) => setDelayMinSec(e.target.value)}
                            className="h-11 w-24 rounded-xl"
                          />
                        </div>
                        <span className="pb-2.5 text-sm text-slate-400">to</span>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="bulk-delay-max"
                            className="text-xs font-medium text-slate-500 dark:text-slate-400"
                          >
                            Max
                          </Label>
                          <Input
                            id="bulk-delay-max"
                            type="number"
                            min={0}
                            max={3600}
                            value={delayMaxSec}
                            onChange={(e) => setDelayMaxSec(e.target.value)}
                            className="h-11 w-24 rounded-xl"
                          />
                        </div>
                      </div>
                      <div
                        className={cn(
                          "rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed",
                          "text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100"
                        )}
                      >
                        WhatsApp guideline: minimum 12s is enforced server-side
                        between sends (about 5 msgs/min max). Recommended:
                        15–45s for established accounts, 30–60s for new
                        accounts.
                      </div>
                    </div>
                    {scheduleType === "scheduled" ? (
                      <div className="space-y-2 sm:col-span-2">
                        <Label
                          htmlFor="bulk-when"
                          className="text-sm font-medium"
                        >
                          Send at
                        </Label>
                        <Input
                          id="bulk-when"
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="h-11 max-w-md rounded-xl"
                        />
                      </div>
                    ) : null}
                    <div className="space-y-2 sm:col-span-2">
                      <Label
                        htmlFor="bulk-retries"
                        className="text-sm font-medium"
                      >
                        Max retries for failed messages
                      </Label>
                      <Input
                        id="bulk-retries"
                        type="number"
                        min={0}
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2 rounded-2xl border border-slate-200/90 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-sm font-semibold">
                          Anti-Block Protection
                        </Label>
                        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={antiBlockEnabled}
                            onChange={(e) => setAntiBlockEnabled(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-blue-600"
                          />
                          Enabled
                        </label>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(
                          [
                            ["spintax", "Spintax", spintaxEnabled, setSpintaxEnabled],
                            ["verify", "Verify Numbers", verifyNumbers, setVerifyNumbers],
                            ["replied", "Replied Only", repliedOnly, setRepliedOnly],
                            ["window24", "24h Window", recent24hOnly, setRecent24hOnly],
                          ] as const
                        ).map(([key, title, value, setter]) => (
                          <label
                            key={key}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setter(e.target.checked)}
                              className="size-4 rounded border-slate-300 text-blue-600"
                            />
                            {title}
                          </label>
                        ))}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Uniqueness</Label>
                          <Select
                            value={uniquenessMode}
                            onValueChange={(v) =>
                              setUniquenessMode((v ?? "none") as UniquenessMode)
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="campaign">Campaign</SelectItem>
                              <SelectItem value="workspace_window">
                                Workspace (24h)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">
                            Batch pause
                          </Label>
                          <div className="flex items-center gap-2 text-sm">
                            <Input
                              type="number"
                              min={1}
                              value={batchPauseEvery}
                              onChange={(e) => setBatchPauseEvery(e.target.value)}
                              className="h-10 w-24 rounded-xl"
                            />
                            <span>msgs, wait</span>
                            <Input
                              type="number"
                              min={1}
                              value={batchPauseSec}
                              onChange={(e) => setBatchPauseSec(e.target.value)}
                              className="h-10 w-24 rounded-xl"
                            />
                            <span>sec</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">
                            Fail limit in a row
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={failLimitInRow}
                            onChange={(e) => setFailLimitInRow(e.target.value)}
                            className="h-10 w-24 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Active hours</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={activeHoursStart}
                              onChange={(e) => setActiveHoursStart(e.target.value)}
                              className="h-10 rounded-xl"
                            />
                            <span className="text-xs text-slate-500">to</span>
                            <Input
                              type="time"
                              value={activeHoursEnd}
                              onChange={(e) => setActiveHoursEnd(e.target.value)}
                              className="h-10 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                      {!activeHoursPairOk ? (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Set both active-hours start and end, or leave both empty.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 lg:sticky lg:top-0">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Selection method
                    </Label>
                    <div className="flex flex-col gap-2.5">
                      {(
                        [
                          {
                            value: "groups" as const,
                            title: "Contact Groups (Recommended)",
                          },
                          {
                            value: "allVerified" as const,
                            title: "All Verified Contacts",
                          },
                          {
                            value: "manual" as const,
                            title: "Manual Selection",
                          },
                        ] satisfies { value: SelectionMode; title: string }[]
                      ).map((opt) => (
                        <label
                          key={opt.value}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-colors",
                            selectionMode === opt.value
                              ? "border-blue-500 bg-blue-50/90 dark:border-blue-400 dark:bg-blue-950/35"
                              : "border-slate-200/90 bg-white/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                          )}
                        >
                          <input
                            type="radio"
                            name="bulk-selection"
                            className="size-4 shrink-0 text-blue-600 focus:ring-blue-500/30"
                            checked={selectionMode === opt.value}
                            onChange={() => setSelectionMode(opt.value)}
                          />
                          <span className="text-[15px] font-medium text-slate-800 dark:text-slate-100">
                            {opt.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectionMode === "groups" ? (
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold">
                        Select contact groups
                      </Label>
                      <ScrollArea className="h-48 rounded-xl border border-slate-200/90 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40">
                        <ul className="divide-y divide-slate-200/80 p-2 dark:divide-slate-800">
                          {groups.length === 0 ? (
                            <li className="px-3 py-8 text-center text-sm text-slate-500">
                              No groups yet — create one under Contacts.
                            </li>
                          ) : (
                            groups.map((gr) => {
                              const st = groupStats(gr.id);
                              return (
                                <li key={gr.id}>
                                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/80 dark:hover:bg-slate-800/50">
                                    <span className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedGroupIds.has(gr.id)}
                                        onChange={(e) =>
                                          toggleGroup(gr.id, e.target.checked)
                                        }
                                        className="size-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                                      />
                                      <span className="text-[15px] font-medium text-slate-800 dark:text-slate-200">
                                        {gr.name}
                                      </span>
                                    </span>
                                    <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                                      {st.verified} verified / {st.total} total
                                    </span>
                                  </label>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </ScrollArea>
                    </div>
                  ) : null}

                  {selectionMode === "manual" ? (
                    <div className="space-y-2.5">
                      <Label
                        htmlFor="bulk-manual"
                        className="text-sm font-semibold"
                      >
                        Phone numbers
                      </Label>
                      <Textarea
                        id="bulk-manual"
                        value={manualNumbers}
                        onChange={(e) => setManualNumbers(e.target.value)}
                        placeholder={
                          "One number per line (E.164, e.g. +1234567890)"
                        }
                        className="min-h-32 resize-y rounded-xl font-mono text-sm"
                      />
                    </div>
                  ) : null}

                  {selectionMode === "allVerified" ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                      Every verified contact across all groups will be included.
                    </p>
                  ) : null}

                  <div
                    className={cn(
                      "rounded-2xl border px-5 py-4 shadow-sm",
                      "border-blue-200/90 bg-blue-50/90 text-blue-950",
                      "dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-50"
                    )}
                  >
                    {verifiedOnly ? (
                      <>
                        <p className="text-[15px] font-semibold leading-snug">
                          {recipientCount} verified{" "}
                          {recipientCount === 1 ? "contact" : "contacts"} will
                          receive this message
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-blue-900/80 dark:text-blue-100/85">
                          Only WhatsApp verified contacts will be included.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[15px] font-semibold leading-snug">
                          {recipientCount}{" "}
                          {recipientCount === 1 ? "recipient" : "recipients"}{" "}
                          from your manual list
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-blue-900/80 dark:text-blue-100/85">
                          Numbers are validated at send time; invalid lines are
                          skipped.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6 dark:border-slate-800 dark:bg-slate-900/50">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-6 sm:w-auto"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSubmit}
                className="h-11 gap-2 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                onClick={() => void handleSubmit()}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Create &amp; send
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
