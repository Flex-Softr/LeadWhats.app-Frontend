"use client";

import * as React from "react";
import {
  CheckCircle2,
  Loader2,
  Phone,
  Plus,
  Send,
  Shield,
  Shuffle,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useSubscription } from "@/features/billing/subscription-context";
import { AiPanelErrorBoundary } from "@/features/bulk-messages/components/ai-panel-error-boundary";
import { MessageTypeCards } from "@/features/single-message/components/message-type-cards";
import type { MessageFormType } from "@/features/single-message/components/message-type-cards";
import { useContacts } from "@/features/contacts/contacts-provider";
import {
  aiSettingsDefaults,
  aiSettingsFormValid,
  buildAiSettingsPayload,
} from "@/features/bulk-messages/lib/ai-settings-form";
import { maxBulkMessageContentsForPlan } from "@/features/bulk-messages/lib/bulk-message-plan-limits";
import type {
  CreateBulkCampaignPayload,
  CreateBulkCampaignResponse,
} from "@/types/bulk-campaign-api";
import type {
  AiCredentialApi,
  AiCredentialsListResponse,
  AiSettingsForm,
} from "@/types/ai-credentials-api";
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

function deviceName(d: DeviceApiRecord): string {
  const name = (d.name ?? "").trim();
  return name || "Unnamed device";
}

export function CreateBulkCampaignDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBulkCampaignDialogProps) {
  const { groups, groupStats, globalStats, refreshGroups } = useContacts();
  const { planId } = useSubscription();
  const maxMessageContents = maxBulkMessageContentsForPlan(planId);

  const [contextLoading, setContextLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [allDevices, setAllDevices] = React.useState<DeviceApiRecord[]>([]);
  const [templates, setTemplates] = React.useState<MessageTemplateApiRecord[]>(
    []
  );
  const [credentials, setCredentials] = React.useState<AiCredentialApi[]>([]);

  const [campaignName, setCampaignName] = React.useState("");
  const [deviceMode, setDeviceMode] = React.useState<DeviceMode>("round_robin");
  const [singleDeviceId, setSingleDeviceId] = React.useState("");
  const [sessionIds, setSessionIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [messageType, setMessageType] = React.useState<MessageFormType>("text");
  const [bodyTexts, setBodyTexts] = React.useState<string[]>([""]);
  const [aiRewriteEnabled, setAiRewriteEnabled] = React.useState(false);
  const [aiRewriteCount, setAiRewriteCount] = React.useState("1");
  const [aiRewriteSettings, setAiRewriteSettings] =
    React.useState<AiSettingsForm>(() => aiSettingsDefaults());
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
  const [inactiveHoursStart, setInactiveHoursStart] = React.useState("");
  const [inactiveHoursEnd, setInactiveHoursEnd] = React.useState("");
  const g = globalStats();
  const fieldClass =
    "h-12 rounded-lg border-slate-200 bg-slate-50 px-3 shadow-inner shadow-violet-950/5 transition-colors hover:bg-slate-50 focus-visible:border-violet-400 focus-visible:ring-violet-500/20 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900/70";
  const textareaClass =
    "resize-y rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed shadow-inner shadow-violet-950/5 focus-visible:border-violet-400 focus-visible:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-900/70";
  const sectionClass =
    "rounded-lg border border-violet-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950";
  const helperClass = "text-xs leading-5 text-slate-500 dark:text-slate-400";

  const activeHoursEnabled =
  activeHoursStart.trim() !== "" &&
  activeHoursEnd.trim() !== "";


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
        const [devRes, tplRes, credRes] = await Promise.all([
          apiJson<DevicesListResponse>("/v1/devices"),
          apiJson<TemplatesListResponse>("/v1/templates"),
          apiJson<AiCredentialsListResponse>("/v1/ai-credentials").catch(
            () => ({ credentials: [] as AiCredentialApi[] })
          ),
        ]);
        if (cancelled) return;
        setAllDevices(devRes.devices);
        setTemplates(
          tplRes.templates.filter((tpl) => tpl.active !== false)
        );
        setCredentials(
          Array.isArray(credRes.credentials) ? credRes.credentials : []
        );
        const connected = devRes.devices.filter((d) => d.status === "connected");

        setCampaignName("");
        setDeviceMode("round_robin");
        setSessionIds(new Set(connected.map((d) => d.id)));
        setSingleDeviceId(connected[0]?.id ?? "");
        setMessageType("text");
        setBodyTexts([""]);
        setAiRewriteEnabled(false);
        setAiRewriteCount("1");
        setAiRewriteSettings(aiSettingsDefaults());
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
        setInactiveHoursStart("");
        setInactiveHoursEnd("");
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError
              ? err.message
              : "Could not load devices or templates.";
          toast.error("Load failed", { description: msg });
          setAllDevices([]);
          setTemplates([]);
          setCredentials([]);
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
    else setAiRewriteEnabled(false);
  }, [messageType]);

  const parsedAiRewriteCount = React.useMemo(() => {
    const n = Number.parseInt(aiRewriteCount, 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(20, n);
  }, [aiRewriteCount]);

  const customFilledCount = bodyTexts.filter((t) => t.trim().length > 0).length;
  // Custom message rows are capped by plan; AI count is validated separately on submit.
  const maxCustomSlots = maxMessageContents;
  const maxAiSlots = Math.max(0, maxMessageContents - Math.max(1, customFilledCount));
  const safeAiCount =
    maxAiSlots > 0 ? Math.min(parsedAiRewriteCount, maxAiSlots) : 0;
  const activeCredentials = React.useMemo(
    () => (Array.isArray(credentials) ? credentials.filter((c) => c.active) : []),
    [credentials]
  );

  function updateBodyTextAt(index: number, value: string) {
    setBodyTexts((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addBodyText() {
    setBodyTexts((prev) => {
      if (prev.length >= maxCustomSlots) return prev;
      return [...prev, ""];
    });
  }

  function removeBodyText(index: number) {
    setBodyTexts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function toggleAiRewrite() {
    if (aiRewriteEnabled) {
      setAiRewriteEnabled(false);
      return;
    }
    if (maxAiSlots < 1) {
      toast.error("AI rewrites unavailable", {
        description: `Your plan allows ${maxMessageContents} message content(s). Keep fewer custom messages or upgrade.`,
      });
      return;
    }
    if (parsedAiRewriteCount > maxAiSlots) {
      setAiRewriteCount(String(maxAiSlots));
    }
    setAiRewriteEnabled(true);
  }

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

  const connected = React.useMemo(
    () => allDevices.filter((d) => d.status === "connected"),
    [allDevices]
  );

  React.useEffect(() => {
    if (singleDeviceId && !connected.some((d) => d.id === singleDeviceId)) {
      setSingleDeviceId("");
    }
  }, [connected, singleDeviceId]);

  React.useEffect(() => {
    if (connected.length === 1 && singleDeviceId === "") {
      setSingleDeviceId(connected[0].id);
    }
  }, [connected, singleDeviceId]);

  const selectedDevice = React.useMemo(
    () => connected.find((d) => d.id === singleDeviceId),
    [connected, singleDeviceId]
  );

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
      ? customFilledCount > 0
      : templateId !== "" && templates.some((t) => t.id === templateId);

  const poolWithinPlan =
    messageType !== "text" ||
    customFilledCount + (aiRewriteEnabled ? safeAiCount : 0) <=
      maxMessageContents;

  const aiRewriteOk =
    messageType !== "text" ||
    !aiRewriteEnabled ||
    (aiSettingsFormValid(aiRewriteSettings) &&
      safeAiCount >= 1 &&
      poolWithinPlan);

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

  const inactiveHoursPairOk =
    (inactiveHoursStart.trim().length === 0 && inactiveHoursEnd.trim().length === 0) ||
    (inactiveHoursStart.trim().length > 0 && inactiveHoursEnd.trim().length > 0);

  const canSubmit =
    !contextLoading &&
    !submitting &&
    !attachmentUploading &&
    hasConnectedDevice &&
    campaignName.trim().length > 0 &&
    devicesOk &&
    messageOk &&
    aiRewriteOk &&
    poolWithinPlan &&
    recipientsOk &&
    scheduleOk &&
    activeHoursPairOk &&
    inactiveHoursPairOk;

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
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || null;

      const deviceIds =
        deviceMode === "single" ? [singleDeviceId] : [...sessionIds];

      const normalizedBodyTexts =
        messageType === "text"
          ? bodyTexts.map((t) => t.trim()).filter(Boolean)
          : [];

      const aiSettingsPayload = aiRewriteEnabled
        ? buildAiSettingsPayload(aiRewriteSettings)
        : null;

      const payload: CreateBulkCampaignPayload = {
        name: campaignName.trim(),
        deviceIds,
        deviceMode,
        kind: messageType,
        bodyText:
          messageType === "text" ? normalizedBodyTexts[0] : undefined,
        bodyTexts:
          messageType === "text" ? normalizedBodyTexts : undefined,
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
        aiRewrite:
          messageType === "text" &&
          aiRewriteEnabled &&
          aiSettingsPayload?.credentialId &&
          safeAiCount >= 1
            ? {
                enabled: true,
                count: safeAiCount,
                credentialId: aiSettingsPayload.credentialId,
                systemPrompt: aiSettingsPayload.systemPrompt,
                temperature: aiSettingsPayload.temperature,
                maxTokens: aiSettingsPayload.maxTokens,
              }
            : undefined,
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
          inactiveHoursStart: inactiveHoursStart.trim() || null,
          inactiveHoursEnd: inactiveHoursEnd.trim() || null,
          timezone,
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
        showCloseButton={false}
        className={cn(
          "max-h-[min(94vh,900px)] max-w-[calc(100%-.5rem)] gap-0 overflow-hidden rounded-lg p-0",
          "border border-violet-100 bg-white shadow-[0_22px_70px_rgba(72,43,132,0.18)]",
          "sm:max-w-6xl dark:border-slate-800 dark:bg-slate-950"
        )}
      >
        <AiPanelErrorBoundary label="Campaign dialog crashed while updating.">
        <DialogHeader className="relative border-b border-violet-100 bg-white px-6 pb-5 pt-6 text-left dark:border-slate-800 dark:bg-slate-950 sm:px-8 sm:pb-6 sm:pt-7">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
              <Send className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                Build message campaign
              </DialogTitle>
              <DialogDescription className="mt-1 text-[15px] leading-relaxed">
                Configure sender devices, message content, audience, schedule,
                and anti-block rules.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {contextLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500 dark:text-slate-400">
            <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
            <p className="text-sm">Loading devices and templates...</p>
          </div>
        ) : (
          <>
            <div className="max-h-[min(64vh,660px)] overflow-y-auto bg-slate-50/55 dark:bg-slate-950">
              <div className="flex w-full flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8 md:flex-row lg:items-start">
                <div className="w-full space-y-5 md:w-[65%]">
                  <div className={sectionClass}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Campaign setup
                        </h3>
                        <p className={helperClass}>
                          Name the campaign and choose how WhatsApp sessions
                          should share delivery.
                        </p>
                      </div>
                    </div>
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
                      className={`${fieldClass} text-[15px]`}
                    />
                  </div>

                  <div className="mt-5 space-y-3">
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
                              "flex min-h-24 flex-col items-start gap-2 rounded-lg border px-4 py-3.5 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-violet-500/20",
                              active
                                ? "border-violet-200 bg-violet-50 text-violet-950 ring-2 ring-violet-500/15 dark:border-violet-800 dark:bg-violet-950/40"
                                : "border-slate-100 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-10 items-center justify-center rounded-lg",
                                active
                                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                              )}
                            >
                              <Icon
                                className="size-5"
                              />
                            </span>
                            <span className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {opt.title}
                              </span>
                              <span className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {opt.description}
                              </span>
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
                  </div>

                  {deviceMode === "single" ? (
                    <div className={sectionClass}>
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
                    id="device"
                    size="default"
                    className={`${fieldClass} w-full min-w-0`}
                  >
                    <SelectValue placeholder="Choose a connected device…">
                      {selectedDevice ? deviceName(selectedDevice) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {connected.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {deviceName(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDevice ? (
                  <p className={helperClass}>
                    Outgoing messages will use this WhatsApp session (
                    {selectedDevice.phone ?? "number on file"}).
                  </p>
                ) : null}
                    </div>
                    </div>
                  ) : (
                    <div className={sectionClass}>
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
                      <div className="h-44 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 shadow-inner shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-900/70">
                        <ul className="space-y-2 p-2">
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
                                      "flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors",
                                      connected
                                        ? sessionIds.has(d.id)
                                          ? "cursor-pointer border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
                                          : "cursor-pointer border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-900"
                                        : "cursor-not-allowed border-slate-100 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-950"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={!connected}
                                      checked={sessionIds.has(d.id)}
                                      onChange={(e) =>
                                        toggleSession(d.id, e.target.checked)
                                      }
                                      className="size-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30 disabled:opacity-50"
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
                      </div>
                    </div>
                    </div>
                  )}

                  <div className={sectionClass}>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Message Type</Label>
                    <MessageTypeCards
                      value={messageType}
                      onChange={setMessageType}
                    />
                  </div>
                  </div>

                  {messageType === "text" ? (
                    <>
                    <div className={sectionClass}>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">
                            Message Content{" "}
                            <span className="font-normal text-red-600 dark:text-red-400">
                              *
                            </span>
                          </Label>
                          <p className={helperClass}>
                            Add multiple variants. One is picked at random per
                            recipient. Plan allows up to {maxMessageContents}{" "}
                            total (custom + AI).
                          </p>
                        </div>
                        <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/70 dark:text-violet-200">
                          {customFilledCount +
                            (aiRewriteEnabled ? safeAiCount : 0)}
                          /{maxMessageContents}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {bodyTexts.map((text, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <Label
                                htmlFor={`bulk-message-${index}`}
                                className="text-xs font-medium text-slate-600 dark:text-slate-300"
                              >
                                Variant {index + 1}
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-destructive hover:text-destructive"
                                disabled={bodyTexts.length <= 1}
                                onClick={() => removeBodyText(index)}
                              >
                                <Trash2 className="size-3.5" />
                                Remove
                              </Button>
                            </div>
                            <Textarea
                              id={`bulk-message-${index}`}
                              value={text}
                              onChange={(e) =>
                                updateBodyTextAt(index, e.target.value)
                              }
                              placeholder="Enter your message here..."
                              className={`${textareaClass} min-h-28`}
                            />
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        disabled={bodyTexts.length >= maxCustomSlots}
                        onClick={addBodyText}
                      >
                        <Plus className="size-3.5" />
                        Add message
                      </Button>
                      {!poolWithinPlan ? (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Custom messages + AI rewrites exceed your plan limit (
                          {maxMessageContents}). Reduce variants or upgrade.
                        </p>
                      ) : null}
                    </div>
                    </div>

                    <div
                      className={cn(
                        sectionClass,
                        "border-sky-200/80 bg-sky-50/40 dark:border-sky-900/60 dark:bg-sky-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Sparkles className="size-4 text-sky-600 dark:text-sky-400" />
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              AI message rewrites
                            </span>
                            <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/80 dark:text-sky-200">
                              AI Powered
                            </span>
                          </div>
                          <p className={helperClass}>
                            Generate extra paraphrases from your first message at
                            create time. Counts toward your plan limit.
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={aiRewriteEnabled}
                          onClick={toggleAiRewrite}
                          className={cn(
                            "relative h-7 w-12 shrink-0 rounded-full border transition-colors",
                            aiRewriteEnabled
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-200 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                              aiRewriteEnabled && "translate-x-5"
                            )}
                          />
                        </button>
                      </div>

                      {aiRewriteEnabled ? (
                        <div className="mt-4 space-y-4 border-t border-sky-200/70 pt-4 dark:border-sky-900/50">
                          <div className="space-y-2">
                            <label
                              htmlFor="bulk-ai-rewrite-count"
                              className="text-sm font-semibold"
                            >
                              Number of AI variants
                            </label>
                            <input
                              id="bulk-ai-rewrite-count"
                              type="number"
                              min={1}
                              max={Math.max(1, maxAiSlots)}
                              value={aiRewriteCount}
                              onChange={(e) => setAiRewriteCount(e.target.value)}
                              className={`${fieldClass} w-full`}
                            />
                            <p className={helperClass}>
                              Remaining slots after custom messages: {maxAiSlots}.
                            </p>
                          </div>

                          {activeCredentials.length === 0 ? (
                            <p className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                              No AI credentials yet. Open{" "}
                              <span className="font-semibold">AI Credentials</span>{" "}
                              in the sidebar and add a Gemini or OpenRouter key
                              first.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <label
                                htmlFor="bulk-ai-credential"
                                className="text-xs font-semibold"
                              >
                                Credential{" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <select
                                id="bulk-ai-credential"
                                value={aiRewriteSettings.credentialId}
                                onChange={(e) =>
                                  setAiRewriteSettings((prev) => ({
                                    ...prev,
                                    credentialId: e.target.value,
                                    model: "",
                                  }))
                                }
                                className={`${fieldClass} w-full`}
                              >
                                <option value="">Select credential…</option>
                                {activeCredentials.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ·{" "}
                                    {c.provider === "gemini"
                                      ? "Gemini"
                                      : "OpenRouter"}{" "}
                                    ({c.apiKeyMasked})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label
                              htmlFor="bulk-ai-system-prompt"
                              className="text-xs font-semibold"
                            >
                              System prompt (optional)
                            </label>
                            <textarea
                              id="bulk-ai-system-prompt"
                              value={aiRewriteSettings.systemPrompt}
                              onChange={(e) =>
                                setAiRewriteSettings((prev) => ({
                                  ...prev,
                                  systemPrompt: e.target.value,
                                }))
                              }
                              placeholder="Keep the same meaning; vary wording naturally…"
                              className={`${textareaClass} block w-full min-h-28`}
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="bulk-ai-temperature"
                                className="text-xs font-semibold"
                              >
                                Temperature
                              </label>
                              <input
                                id="bulk-ai-temperature"
                                type="number"
                                step="0.1"
                                min={0}
                                max={2}
                                value={aiRewriteSettings.temperature}
                                onChange={(e) =>
                                  setAiRewriteSettings((prev) => ({
                                    ...prev,
                                    temperature: e.target.value,
                                  }))
                                }
                                className={`${fieldClass} w-full`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="bulk-ai-max-tokens"
                                className="text-xs font-semibold"
                              >
                                Max tokens (optional)
                              </label>
                              <input
                                id="bulk-ai-max-tokens"
                                value={aiRewriteSettings.maxTokens}
                                onChange={(e) =>
                                  setAiRewriteSettings((prev) => ({
                                    ...prev,
                                    maxTokens: e.target.value,
                                  }))
                                }
                                placeholder="Leave empty for default"
                                className={`${fieldClass} w-full`}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    </>
                  ) : (
                    <div className={sectionClass}>
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
                        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900/60">
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
                            className={`${fieldClass} w-full`}
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
                    </div>
                  )}

                  <div className={sectionClass}>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Attachment
                        </h3>
                        <p className={helperClass}>
                          Optional media or document attached to each text send.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Attachment type
                      </Label>
                      <Select
                        value={attachmentType}
                        onValueChange={(v) =>
                          setAttachmentType(v as AttachmentType)
                        }
                      >
                        <SelectTrigger className={`${fieldClass} w-full`}>
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
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        File upload
                      </Label>
                      <label className="block">
                        <Input
                          id="bulk-file"
                          type="file"
                          disabled={attachmentUploading}
                          accept={acceptForAttachmentType(attachmentType)}
                          onChange={(e) => void handleAttachmentFile(e)}
                          className="sr-only"
                        />
                        <span className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-violet-100 bg-white px-4 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50 dark:border-violet-900 dark:bg-slate-950 dark:text-violet-200 dark:hover:bg-violet-950/20">
                          {attachmentUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                          {attachmentUploading ? "Uploading..." : "Upload file"}
                        </span>
                      </label>
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
                            className="h-7 text-xs text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                            onClick={() => {
                              setAttachmentAssetId("");
                              setAttachmentOriginalName("");
                            }}
                          >
                            <X className="size-3" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <p className={helperClass}>
                          Optional. File is stored and linked to this campaign (max
                          16 MB). Types above filter the file picker.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`${sectionClass} grid gap-5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5`}>
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
                        <SelectTrigger className={`${fieldClass} w-full`}>
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
                            className={`${fieldClass} w-24`}
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
                            className={`${fieldClass} w-24`}
                          />
                        </div>
                      </div>
                      <div
                        className={cn(
                          "rounded-md border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed",
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
                          className={`${fieldClass} max-w-md`}
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
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-inner shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-900/60 sm:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Label className="text-sm font-semibold">
                            Anti-block protection
                          </Label>
                          <p className={helperClass}>
                            Control pacing, filtering, and send windows.
                          </p>
                        </div>
                        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-violet-100 bg-white px-3 text-xs font-semibold text-violet-700 shadow-sm dark:border-violet-900 dark:bg-slate-950 dark:text-violet-200">
                          <input
                            type="checkbox"
                            checked={antiBlockEnabled}
                            onChange={(e) => setAntiBlockEnabled(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
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
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                              value
                                ? "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-100"
                                : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-900"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setter(e.target.checked)}
                              className="size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
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
                            <SelectTrigger className={`${fieldClass} h-10`}>
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
                              className={`${fieldClass} h-10 w-20`}
                            />
                            <span>msgs, wait</span>
                            <Input
                              type="number"
                              min={1}
                              value={batchPauseSec}
                              onChange={(e) => setBatchPauseSec(e.target.value)}
                              className={`${fieldClass} h-10 w-20`}
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
                            className={`${fieldClass} h-10 w-20`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Active hours</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={activeHoursStart}
                              onChange={(e) => setActiveHoursStart(e.target.value)}
                              className={`${fieldClass} h-10`}
                            />
                            <span className="text-xs text-slate-500">to</span>
                            <Input
                              type="time"
                              value={activeHoursEnd}
                              onChange={(e) => setActiveHoursEnd(e.target.value)}
                              className={`${fieldClass} h-10`}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Inactive hours</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={inactiveHoursStart}
                              onChange={(e) => setInactiveHoursStart(e.target.value)}
                              className={`${fieldClass} h-10 dark:text-white`}
                              disabled={!activeHoursEnabled}
                            />
                            <span className="text-xs text-slate-500">to</span>
                            <Input
                              type="time"
                              value={inactiveHoursEnd}
                              onChange={(e) => setInactiveHoursEnd(e.target.value)}
                              className={`${fieldClass} h-10 dark:text-white`}
                              disabled={!activeHoursEnabled}
                            />
                          </div>
                        </div>
                      </div>
                      {!activeHoursPairOk ? (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Set both active-hours start and end, or leave both empty.
                        </p>
                      ) : null}
                      {!inactiveHoursPairOk ? (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Set both inactive-hours start and end, or leave both empty.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-5 md:w-[35%] lg:sticky lg:top-0">
                  <div className={sectionClass}>
                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
                        <Users className="size-4" />
                      </span>
                      <div>
                        <Label className="text-sm font-semibold">
                          Audience
                        </Label>
                        <p className={helperClass}>
                          Choose who should receive this campaign.
                        </p>
                      </div>
                    </div>
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
                            "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 shadow-sm transition-colors",
                            selectionMode === opt.value
                              ? "border-violet-200 bg-violet-50 text-violet-950 ring-2 ring-violet-500/15 dark:border-violet-800 dark:bg-violet-950/40"
                              : "border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
                          )}
                        >
                          <input
                            type="radio"
                            name="bulk-selection"
                            className="size-4 shrink-0 text-violet-600 focus:ring-violet-500/30"
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
                    <div className={sectionClass}>
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold">
                        Select contact groups
                      </Label>
                      <div className="h-52 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 shadow-inner shadow-violet-950/5 dark:border-slate-800 dark:bg-slate-900/70">
                        <ul className="space-y-2 p-2">
                          {groups.length === 0 ? (
                            <li className="px-3 py-8 text-center text-sm text-slate-500">
                              No groups yet — create one under Contacts.
                            </li>
                          ) : (
                            groups.map((gr) => {
                              const st = groupStats(gr.id);
                              return (
                                <li key={gr.id}>
                                  <label
                                    className={cn(
                                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors",
                                      selectedGroupIds.has(gr.id)
                                        ? "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
                                        : "border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-900"
                                    )}
                                  >
                                    <span className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedGroupIds.has(gr.id)}
                                        onChange={(e) =>
                                          toggleGroup(gr.id, e.target.checked)
                                        }
                                        className="size-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
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
                      </div>
                    </div>
                    </div>
                  ) : null}

                  {selectionMode === "manual" ? (
                    <div className={sectionClass}>
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
                        className={`${textareaClass} min-h-36 font-mono text-sm`}
                      />
                    </div>
                    </div>
                  ) : null}

                  {selectionMode === "allVerified" ? (
                    <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      Every verified contact across all groups will be included.
                    </p>
                  ) : null}

                  <div
                    className={cn(
                      "rounded-lg border px-5 py-4 shadow-sm",
                      "border-violet-200 bg-violet-50 text-violet-950",
                      "dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-50"
                    )}
                  >
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="size-4" />
                      Campaign reach
                    </div>
                    {verifiedOnly ? (
                      <>
                        <p className="text-[15px] font-semibold leading-snug">
                          {recipientCount} verified{" "}
                          {recipientCount === 1 ? "contact" : "contacts"} will
                          receive this message
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-violet-900/80 dark:text-violet-100/85">
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
                        <p className="mt-1.5 text-sm leading-relaxed text-violet-900/80 dark:text-violet-100/85">
                          Numbers are validated at send time; invalid lines are
                          skipped.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-violet-100 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-violet-100 bg-white px-6 font-semibold text-violet-700 shadow-sm hover:bg-violet-50 dark:border-violet-900 dark:bg-slate-950 dark:text-violet-200 dark:hover:bg-violet-950/20 sm:w-auto"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSubmit}
                className="h-11 gap-2 rounded-lg bg-violet-600 px-6 font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
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
        </AiPanelErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
