"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import type { AutoReplyRule } from "@/types/auto-reply";
import type { AutoReplyRuleMutationResponse } from "@/types/auto-reply-api";
import type { DeviceApiRecord, DevicesListResponse } from "@/types/device";
import type {
  MessageTemplateApiRecord,
  TemplateMediaListResponse,
  TemplatesListResponse,
} from "@/types/templates-api";
import { ApiError, apiFormJson, apiJson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
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

type CreateAutoReplyRuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: AutoReplyRule | null;
  onSaved: () => void;
};

const TRIGGER_OPTIONS: {
  value: AutoReplyRule["triggerType"];
  label: string;
}[] = [
  { value: "keyword", label: "Keyword" },
  { value: "exact", label: "Exact Match" },
  { value: "contains", label: "Contains" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
  { value: "regex", label: "Regex" },
];

const MESSAGE_MODES: {
  value: AutoReplyRule["messageMode"];
  label: string;
}[] = [
  { value: "text", label: "Text Message" },
  { value: "media", label: "Media Message" },
  { value: "template", label: "Template" },
];

function deviceOptionLabel(d: DeviceApiRecord): string {
  const bits = [deviceName(d)];
  if (d.phone) bits.push(d.phone);
  const status = d.status === "connected" ? "Connected" : "QR ready";
  return `${bits.join(" · ")} · ${status}`;
}

function deviceName(d: DeviceApiRecord): string {
  const name = (d.name ?? "").trim();
  return name || "Unnamed device";
}

function openAiDefaults() {
  return {
    apiKey: "",
    model: "gpt-3.5-turbo",
    baseUrl: "https://api.openai.com/v1",
    systemPrompt: "",
    temperature: "0.7",
    maxTokens: "",
    continuousChat: false,
  };
}

function parseOpenAiFromRule(
  settings: AutoReplyRule["openAiSettings"]
): ReturnType<typeof openAiDefaults> {
  const d = openAiDefaults();
  if (!settings) return d;
  const o = settings;
  return {
    apiKey: typeof o.apiKey === "string" ? o.apiKey : "",
    model: typeof o.model === "string" && o.model ? o.model : d.model,
    baseUrl:
      typeof o.baseUrl === "string" && o.baseUrl.length > 0
        ? o.baseUrl
        : d.baseUrl,
    systemPrompt:
      typeof o.systemPrompt === "string" ? o.systemPrompt : "",
    temperature:
      typeof o.temperature === "number"
        ? String(o.temperature)
        : d.temperature,
    maxTokens:
      typeof o.maxTokens === "number"
        ? String(o.maxTokens)
        : typeof o.maxTokens === "string"
          ? o.maxTokens
          : "",
    continuousChat:
      typeof o.continuousChat === "boolean" ? o.continuousChat : false,
  };
}

export function CreateAutoReplyRuleDialog({
  open,
  onOpenChange,
  editingRule,
  onSaved,
}: CreateAutoReplyRuleDialogProps) {
  const isEdit = editingRule != null;

  const [contextLoading, setContextLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [mediaUploading, setMediaUploading] = React.useState(false);
  const [devices, setDevices] = React.useState<DeviceApiRecord[]>([]);
  const [templates, setTemplates] = React.useState<MessageTemplateApiRecord[]>(
    []
  );
  const [mediaAssets, setMediaAssets] = React.useState<
    { id: string; originalName: string; mimeType: string }[]
  >([]);

  const [name, setName] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [triggerType, setTriggerType] =
    React.useState<AutoReplyRule["triggerType"]>("contains");
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [deviceId, setDeviceId] = React.useState("");
  const [priority, setPriority] = React.useState("0");
  const [cooldown, setCooldown] = React.useState("0");
  const [messageMode, setMessageMode] =
    React.useState<AutoReplyRule["messageMode"]>("text");
  const [templateId, setTemplateId] = React.useState("__none__");
  const [mediaAssetId, setMediaAssetId] = React.useState("");
  const [mediaCaption, setMediaCaption] = React.useState("");
  const [response, setResponse] = React.useState("");
  const [openAiEnabled, setOpenAiEnabled] = React.useState(false);
  const [openAi, setOpenAi] = React.useState(openAiDefaults);
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      try {
        const [devRes, tplRes, mediaRes] = await Promise.all([
          apiJson<DevicesListResponse>("/v1/devices"),
          apiJson<TemplatesListResponse>("/v1/templates"),
          apiJson<TemplateMediaListResponse>("/v1/templates/media").catch(
            () => ({ assets: [] })
          ),
        ]);
        if (cancelled) return;
        setDevices(devRes.devices);
        setTemplates(tplRes.templates.filter((tpl) => tpl.active !== false));
        setMediaAssets(mediaRes.assets);

        if (editingRule) {
          setName(editingRule.name);
          setKeyword(editingRule.keyword);
          setTriggerType(editingRule.triggerType);
          setCaseSensitive(editingRule.caseSensitive);
          setDeviceId(editingRule.deviceId);
          setPriority(String(editingRule.priority));
          setCooldown(String(editingRule.cooldownMinutes));
          setMessageMode(editingRule.messageMode);
          setTemplateId(editingRule.templateId ?? "__none__");
          setMediaAssetId(editingRule.mediaAssetId ?? "");
          setMediaCaption(editingRule.mediaCaption ?? "");
          setResponse(editingRule.response);
          setOpenAiEnabled(editingRule.openAiEnabled);
          setOpenAi(parseOpenAiFromRule(editingRule.openAiSettings));
          setActive(editingRule.active);
        } else {
          setName("");
          setKeyword("");
          setTriggerType("contains");
          setCaseSensitive(false);
          const connected = devRes.devices.filter((d) => d.status === "connected");
          setDeviceId(connected[0]?.id ?? devRes.devices[0]?.id ?? "");
          setPriority("0");
          setCooldown("0");
          setMessageMode("text");
          setTemplateId("__none__");
          setMediaAssetId("");
          setMediaCaption("");
          setResponse("");
          setOpenAiEnabled(false);
          setOpenAi(openAiDefaults());
          setActive(true);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError
              ? err.message
              : "Could not load devices or templates.";
          toast.error("Load failed", { description: msg });
          setDevices([]);
          setTemplates([]);
          setMediaAssets([]);
        }
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, editingRule]);

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMediaUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const meta = await apiFormJson<{
        id: string;
        originalName: string;
        mimeType: string;
      }>("/v1/templates/media", form);
      setMediaAssetId(meta.id);
      setMediaAssets((prev) => [
        {
          id: meta.id,
          originalName: meta.originalName,
          mimeType: meta.mimeType,
        },
        ...prev.filter((a) => a.id !== meta.id),
      ]);
      toast.success("File uploaded", { description: meta.originalName });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Upload failed.";
      toast.error("Upload failed", { description: msg });
    } finally {
      setMediaUploading(false);
    }
  }

  const contentOk = React.useMemo(() => {
    if (openAiEnabled) return true;
    if (messageMode === "text") return response.trim().length > 0;
    if (messageMode === "template")
      return templateId !== "__none__" && templateId.length > 0;
    if (messageMode === "media") return mediaAssetId.trim().length > 0;
    return false;
  }, [openAiEnabled, messageMode, response, templateId, mediaAssetId]);

  const openAiOk =
    !openAiEnabled ||
    (openAi.apiKey.trim().length > 0 &&
      (openAi.baseUrl.trim().length === 0 ||
        openAi.baseUrl.startsWith("http")));

  const canSubmit =
    !contextLoading &&
    !submitting &&
    !mediaUploading &&
    name.trim().length > 0 &&
    keyword.trim().length > 0 &&
    deviceId.length > 0 &&
    contentOk &&
    openAiOk;
  const selectedDevice = devices.find((d) => d.id === deviceId);

  async function handleSubmit() {
    if (!canSubmit) return;
    const priorityNum = Math.min(
      1_000_000,
      Math.max(0, Number.parseInt(priority, 10) || 0)
    );
    const cooldownNum = Math.min(
      10_080,
      Math.max(0, Number.parseInt(cooldown, 10) || 0)
    );
    const tpl =
      messageMode === "template" && templateId !== "__none__" && templateId
        ? templateId
        : null;
    const media =
      messageMode === "media" && mediaAssetId.trim()
        ? mediaAssetId.trim()
        : null;
    const cap =
      messageMode === "media" && mediaCaption.trim()
        ? mediaCaption.trim()
        : null;

    const maxTok = openAi.maxTokens.trim();
    const openAiPayload = openAiEnabled
      ? {
          apiKey: openAi.apiKey.trim(),
          model: openAi.model.trim() || "gpt-3.5-turbo",
          baseUrl: openAi.baseUrl.trim() || undefined,
          systemPrompt: openAi.systemPrompt.trim() || undefined,
          temperature: Number.parseFloat(openAi.temperature) || 0.7,
          maxTokens:
            maxTok === ""
              ? null
              : Math.max(1, Number.parseInt(maxTok, 10) || 512),
          continuousChat: openAi.continuousChat,
        }
      : null;

    const body = {
      name: name.trim(),
      keyword: keyword.trim(),
      triggerType,
      caseSensitive,
      deviceId,
      priority: priorityNum,
      cooldownMinutes: cooldownNum,
      messageMode,
      templateId: tpl,
      mediaAssetId: media,
      mediaCaption: cap,
      response: response.trim(),
      openAiEnabled,
      openAiSettings: openAiPayload,
      active,
    };

    setSubmitting(true);
    try {
      if (isEdit && editingRule) {
        await apiJson<AutoReplyRuleMutationResponse>(
          `/v1/auto-reply-rules/${editingRule.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        toast.success("Rule updated", { description: `“${name.trim()}” saved.` });
      } else {
        await apiJson<AutoReplyRuleMutationResponse>("/v1/auto-reply-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Rule created", {
          description: `“${name.trim()}” is ${active ? "active" : "inactive"}.`,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not save rule.";
      toast.error("Save failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const triggerHint =
    triggerType === "regex"
      ? "One regex pattern per line. Invalid patterns are rejected on save."
      : "Separate values with commas, new lines, tabs, /, ; or |. You can also use two or more spaces between values. Any one match fires the rule.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,820px)] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-3xl p-0",
          "border border-white/70 bg-white/95 shadow-2xl shadow-violet-950/10 backdrop-blur-md",
          "dark:border-slate-800 dark:bg-slate-950/95 sm:max-w-2xl"
        )}
      >
        <DialogHeader className="space-y-2 border-b border-slate-200/80 px-6 pb-5 pt-6 text-left sm:px-8 sm:pb-6 sm:pt-7 dark:border-slate-800">
          <DialogTitle className="font-heading pr-8 text-xl font-semibold tracking-tight sm:text-2xl">
            {isEdit ? "Edit Auto-Reply Rule" : "Create Auto-Reply Rule"}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            Create a rule with one or more trigger values and choose how FlexoWhats
            should reply — plain text, a WhatsApp template (including media), or a
            direct media file. OpenAI can generate the reply with your text as
            fallback.
          </DialogDescription>
        </DialogHeader>

        {contextLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
            <p className="text-sm">Loading devices, templates, and media…</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[min(58vh,560px)]">
              <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="ar-device" className="text-sm font-semibold">
                      Device{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    {devices.length === 0 ? (
                      <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                        No devices — add one under Devices.
                      </p>
                    ) : (
                      <Select
                        value={deviceId}
                        onValueChange={(v) => setDeviceId(v ?? "")}
                      >
                        <SelectTrigger id="ar-device" className="h-11 w-full rounded-xl">
                          <SelectValue placeholder="Select device">
                            {selectedDevice ? deviceName(selectedDevice) : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {devices.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {deviceOptionLabel(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="ar-name" className="text-sm font-semibold">
                      Rule name{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    <Input
                      id="ar-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Welcome Message"
                      className="h-11 rounded-xl px-3.5"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Trigger type{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    <Select
                      value={triggerType}
                      onValueChange={(v) =>
                        setTriggerType((v ?? "contains") as AutoReplyRule["triggerType"])
                      }
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ar-trigger" className="text-sm font-semibold">
                      Trigger value{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    <Textarea
                      id="ar-trigger"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g., hello, hi, help"
                      className="min-h-[88px] resize-y rounded-xl text-[15px] leading-relaxed"
                    />
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {triggerHint}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Message type{" "}
                    <span className="font-normal text-red-600 dark:text-red-400">
                      *
                    </span>
                  </Label>
                  <Select
                    value={messageMode}
                    onValueChange={(v) =>
                      setMessageMode((v ?? "text") as AutoReplyRule["messageMode"])
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {messageMode === "template" ? (
                  <div className="space-y-2">
                    <Label htmlFor="ar-template" className="text-sm font-semibold">
                      Template{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    {templates.length === 0 ? (
                      <p className="rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">
                        No templates — create one under Templates (include media in
                        the template to send images).
                      </p>
                    ) : (
                      <>
                        <Select
                          value={templateId}
                          onValueChange={(v) => setTemplateId(v ?? "__none__")}
                        >
                          <SelectTrigger id="ar-template" className="h-11 w-full rounded-xl">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Select template</SelectItem>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select a template to use for the auto-reply. Media defined
                          on the template is sent with the message.
                        </p>
                      </>
                    )}
                  </div>
                ) : null}

                {messageMode === "media" ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Media file{" "}
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => void handleMediaUpload(e)}
                          disabled={mediaUploading}
                        />
                        <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
                          {mediaUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                          Upload new
                        </span>
                      </label>
                      {mediaAssets.length > 0 ? (
                        <Select
                          value={mediaAssetId || "__pick__"}
                          onValueChange={(v) => {
                            const x = v ?? "";
                            setMediaAssetId(x === "__pick__" ? "" : x);
                          }}
                        >
                          <SelectTrigger className="h-11 min-w-[200px] flex-1 rounded-xl">
                            <SelectValue placeholder="Or pick uploaded file" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__pick__">— Choose —</SelectItem>
                            {mediaAssets.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.originalName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ar-caption" className="text-sm font-semibold">
                        Caption (optional)
                      </Label>
                      <Textarea
                        id="ar-caption"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Optional caption for the media…"
                        className="min-h-20 resize-y rounded-xl"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="ar-response" className="text-sm font-semibold">
                    Reply message{" "}
                    {!openAiEnabled && messageMode === "text" ? (
                      <span className="font-normal text-red-600 dark:text-red-400">
                        *
                      </span>
                    ) : (
                      <span className="font-normal text-muted-foreground">
                        (fallback)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="ar-response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Message when AI is off, or fallback if OpenAI fails…"
                    className="min-h-28 resize-y rounded-xl text-[15px] leading-relaxed"
                  />
                  {openAiEnabled ? (
                    <p className="text-xs text-sky-700 dark:text-sky-300">
                      When OpenAI is enabled, this field is used if AI generation
                      fails.
                    </p>
                  ) : null}
                </div>

                <div
                  className={cn(
                    "rounded-2xl border border-sky-200/90 bg-sky-50/90 p-4 dark:border-sky-900/60 dark:bg-sky-950/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Sparkles className="size-4 text-sky-600 dark:text-sky-400" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Use OpenAI for Responses
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200"
                        >
                          AI Powered
                        </Badge>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        Generate AI-powered responses using an OpenAI-compatible API.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={openAiEnabled}
                        onChange={(e) => setOpenAiEnabled(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "relative h-7 w-12 shrink-0 rounded-full border border-slate-200 bg-slate-200 transition-colors dark:border-slate-600 dark:bg-slate-700",
                          openAiEnabled &&
                            "border-emerald-500 bg-emerald-500 dark:border-emerald-500"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                            openAiEnabled && "translate-x-5"
                          )}
                        />
                      </span>
                    </label>
                  </div>

                  {openAiEnabled ? (
                    <div className="mt-4 space-y-4 border-t border-sky-200/70 pt-4 dark:border-sky-900/50">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-xs font-semibold">
                            API key{" "}
                            <span className="text-red-600 dark:text-red-400">*</span>
                          </Label>
                          <Input
                            type="password"
                            autoComplete="off"
                            value={openAi.apiKey}
                            onChange={(e) =>
                              setOpenAi((p) => ({ ...p, apiKey: e.target.value }))
                            }
                            placeholder="sk-…"
                            className="rounded-xl font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Model</Label>
                          <Input
                            value={openAi.model}
                            onChange={(e) =>
                              setOpenAi((p) => ({ ...p, model: e.target.value }))
                            }
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">
                            Base URL (optional)
                          </Label>
                          <Input
                            value={openAi.baseUrl}
                            onChange={(e) =>
                              setOpenAi((p) => ({ ...p, baseUrl: e.target.value }))
                            }
                            placeholder="https://api.openai.com/v1"
                            className="rounded-xl text-sm"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Leave empty for OpenAI, or use your compatible endpoint.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                          System prompt (optional)
                        </Label>
                        <Textarea
                          value={openAi.systemPrompt}
                          onChange={(e) =>
                            setOpenAi((p) => ({ ...p, systemPrompt: e.target.value }))
                          }
                          placeholder="You are a helpful assistant…"
                          className="min-h-20 rounded-xl"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Temperature</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min={0}
                            max={2}
                            value={openAi.temperature}
                            onChange={(e) =>
                              setOpenAi((p) => ({
                                ...p,
                                temperature: e.target.value,
                              }))
                            }
                            className="rounded-xl"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            0.0 – 2.0 (default 0.7)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">
                            Max tokens (optional)
                          </Label>
                          <Input
                            value={openAi.maxTokens}
                            onChange={(e) =>
                              setOpenAi((p) => ({ ...p, maxTokens: e.target.value }))
                            }
                            placeholder="Leave empty for default"
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-xl border border-violet-200/80 bg-violet-50/60 p-3 dark:border-violet-900/50 dark:bg-violet-950/25"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Continuous AI chat
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Stored for future use: AI continues until a human sends a
                              message.
                            </p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={openAi.continuousChat}
                              onChange={(e) =>
                                setOpenAi((p) => ({
                                  ...p,
                                  continuousChat: e.target.checked,
                                }))
                              }
                              className="sr-only"
                            />
                            <span
                              className={cn(
                                "relative h-7 w-12 shrink-0 rounded-full border border-slate-200 bg-slate-200 transition-colors dark:border-slate-600 dark:bg-slate-700",
                                openAi.continuousChat &&
                                  "border-emerald-500 bg-emerald-500 dark:border-emerald-500"
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                                  openAi.continuousChat && "translate-x-5"
                                )}
                              />
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ar-priority" className="text-sm font-semibold">
                      Priority (0–100)
                    </Label>
                    <Input
                      id="ar-priority"
                      type="number"
                      min={0}
                      max={1_000_000}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower numbers are checked first when several rules match.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ar-cooldown" className="text-sm font-semibold">
                      Cooldown (minutes)
                    </Label>
                    <Input
                      id="ar-cooldown"
                      type="number"
                      min={0}
                      value={cooldown}
                      onChange={(e) => setCooldown(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Per sender and matched trigger (0 = none).
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="text-[15px] font-medium text-slate-800 dark:text-slate-200">
                    Case sensitive — match case exactly
                  </span>
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-blue-600"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="text-[15px] font-medium text-slate-800 dark:text-slate-200">
                    Rule is active
                  </span>
                </label>
              </div>
            </ScrollArea>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50/60 px-6 py-5 sm:flex-row sm:justify-end sm:gap-3 sm:px-8 sm:py-6 dark:border-slate-800 dark:bg-slate-900/50">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-6"
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
                ) : isEdit ? (
                  <Pencil className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {isEdit ? "Save changes" : "Create rule"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
