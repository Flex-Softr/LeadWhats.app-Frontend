"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Loader2,
  MessageSquare,
  Music,
  Paperclip,
  Send,
  SendHorizontal,
  Smartphone,
  Upload,
  X,
} from "lucide-react";

import type { DeviceApiRecord, DevicesListResponse } from "@/types/device";
import type {
  SingleMessageTemplatesResponse,
  SingleSendResponse,
  ValidatePhoneResponse,
} from "@/types/single-message-api";
import { DeviceConnectionAlert } from "@/features/shared/components/device-connection-alert";
import { MessageTypeCards } from "@/features/single-message/components/message-type-cards";
import type { SingleMessageFormType } from "@/features/single-message/components/message-type-cards";
import { cn } from "@/lib/utils";
import { PhoneNumberWithCountryInput } from "@/features/shared/components/phone-number-with-country-input";
import {
  buildE164Phone,
  DEFAULT_PHONE_COUNTRY_ISO2,
  findCountryByIso2,
  splitE164Phone,
} from "@/features/shared/lib/phone-country-prefixes";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function deviceName(d: DeviceApiRecord): string {
  const name = (d.name ?? "").trim();
  return name || "Unnamed device";
}

export function SingleMessageClient() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [loading, setLoading] = React.useState(true);
  const [devices, setDevices] = React.useState<DeviceApiRecord[]>([]);
  const [templates, setTemplates] = React.useState<
    SingleMessageTemplatesResponse["templates"]
  >([]);

  const [deviceId, setDeviceId] = React.useState<string>("");
  const [phoneCountryIso2, setPhoneCountryIso2] = React.useState(
    DEFAULT_PHONE_COUNTRY_ISO2
  );
  const [localPhoneNumber, setLocalPhoneNumber] = React.useState("");
  const [messageType, setMessageType] = React.useState<SingleMessageFormType>("text");
  const [messageText, setMessageText] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string>("");
  const [checking, setChecking] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  // Media attachment states
  const [mediaMode, setMediaMode] = React.useState<"upload" | "url">("upload");
  const [mediaFile, setMediaFile] = React.useState<File | null>(null);
  const [mediaFileName, setMediaFileName] = React.useState("");
  const [mediaMimeType, setMediaMimeType] = React.useState("");
  const [mediaFileSize, setMediaFileSize] = React.useState(0);
  const [mediaFileBase64, setMediaFileBase64] = React.useState("");
  const [mediaFileUrl, setMediaFileUrl] = React.useState("");
  const [mediaPreviewUrl, setMediaPreviewUrl] = React.useState("");
  const mediaInputRef = React.useRef<HTMLInputElement>(null);

  const clearMediaFile = React.useCallback(() => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(null);
    setMediaFileName("");
    setMediaMimeType("");
    setMediaFileSize(0);
    setMediaFileBase64("");
    setMediaPreviewUrl("");
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  }, [mediaPreviewUrl]);

  React.useEffect(() => {
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl]);

  const handleMediaFileChange = (file: File) => {
    if (file.size > 16 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size for WhatsApp attachment is 16 MB.",
      });
      return;
    }
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaFile(file);
    setMediaFileName(file.name);
    setMediaMimeType(file.type || "application/octet-stream");
    setMediaFileSize(file.size);
    setMediaPreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setMediaFileBase64(result);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file", {
        description: "Could not encode the chosen file for sending.",
      });
      clearMediaFile();
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (messageType === "text") {
      setTemplateId("");
    }
  }, [messageType]);

  const loadContext = React.useCallback(async () => {
    setLoading(true);
    try {
      const [devData, tplData] = await Promise.all([
        apiJson<DevicesListResponse>("/v1/devices"),
        apiJson<SingleMessageTemplatesResponse>("/v1/templates"),
      ]);
      setDevices(devData.devices);
      setTemplates(tplData.templates.filter((tpl) => tpl.active !== false));
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load messaging data.";
      toast.error("Load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadContext();
  }, [loadContext, userId, workspaceId, routeKey]);

  const connected = React.useMemo(
    () => devices.filter((d) => d.status === "connected"),
    [devices]
  );
  const totalDevices = devices.length;
  const activeTemplates = templates.length;

  React.useEffect(() => {
    if (deviceId && !connected.some((d) => d.id === deviceId)) {
      setDeviceId("");
    }
  }, [connected, deviceId]);

  React.useEffect(() => {
    if (connected.length === 1 && deviceId === "") {
      setDeviceId(connected[0].id);
    }
  }, [connected, deviceId]);

  const selectedDevice = React.useMemo(
    () => connected.find((d) => d.id === deviceId),
    [connected, deviceId]
  );

  const selectedCountry = React.useMemo(
    () => findCountryByIso2(phoneCountryIso2),
    [phoneCountryIso2]
  );
  const phone = React.useMemo(
    () => buildE164Phone(selectedCountry?.dialCode ?? "+", localPhoneNumber),
    [localPhoneNumber, selectedCountry?.dialCode]
  );

  const canSend =
    deviceId.length > 0 &&
    localPhoneNumber.trim().length > 0 &&
    (messageType === "template"
      ? templateId.length > 0
      : messageType === "media"
        ? (mediaMode === "upload" ? Boolean(mediaFileBase64) : Boolean(mediaFileUrl.trim()))
        : messageText.trim().length > 0);

  async function handleCheckNumber() {
    const trimmed = phone.trim();
    if (!trimmed) {
      toast.error("Enter a phone number", {
        description: "Select country prefix, then enter the phone number.",
      });
      return;
    }
    setChecking(true);
    try {
      const data = await apiJson<ValidatePhoneResponse>(
        "/v1/messages/validate-phone",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: trimmed }),
        }
      );
      if (data.valid) {
        const parsed = splitE164Phone(data.e164);
        toast.success("Number looks valid", {
          description: `Normalized: ${data.e164}`,
        });
        setPhoneCountryIso2(parsed.iso2);
        setLocalPhoneNumber(parsed.localNumber);
      } else {
        toast.error("Invalid number", {
          description: data.message,
        });
      }
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Validation request failed.";
      toast.error("Check failed", { description: msg });
    } finally {
      setChecking(false);
    }
  }

  async function handleSend() {
    if (!canSend || !deviceId) return;
    setSending(true);
    try {
      const toPhone = phone.trim();
      let body: {
        deviceId: string;
        toPhone: string;
        kind: "text" | "template" | "media";
        bodyText?: string;
        templateId?: string;
        fileBase64?: string;
        fileUrl?: string;
        fileName?: string;
        mimeType?: string;
      };

      if (messageType === "text") {
        body = {
          deviceId,
          toPhone,
          kind: "text",
          bodyText: messageText.trim(),
        };
      } else if (messageType === "template") {
        body = {
          deviceId,
          toPhone,
          kind: "template",
          templateId,
        };
      } else {
        body = {
          deviceId,
          toPhone,
          kind: "media",
          bodyText: messageText.trim() || undefined,
          fileBase64: mediaMode === "upload" ? mediaFileBase64 : undefined,
          fileUrl: mediaMode === "url" ? mediaFileUrl.trim() : undefined,
          fileName: mediaFileName.trim() || undefined,
          mimeType: mediaMimeType.trim() || undefined,
        };
      }

      const out = await apiJson<SingleSendResponse>("/v1/messages/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (out.status === "sent") {
        toast.success("Message sent on WhatsApp", {
          description:
            out.note ?? `Delivered to ${out.toPhone} from your linked device.`,
        });
      } else if (out.status === "simulated") {
        toast.warning("Not sent on WhatsApp (simulated)", {
          description:
            out.note ??
            "The API did not use a live WhatsApp session. Restart the API after setting WHATSAPP_BRIDGE_ENABLED=true.",
        });
      } else {
        toast.message("Message saved", {
          description: out.note ?? `${out.status} · ${out.toPhone}`,
        });
      }

      setPhoneCountryIso2(DEFAULT_PHONE_COUNTRY_ISO2);
      setLocalPhoneNumber("");
      setMessageType("text");
      setMessageText("");
      setTemplateId("");
      clearMediaFile();
      setMediaFileUrl("");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Send request failed.";
      toast.error("Could not send", { description: msg });
    } finally {
      setSending(false);
    }
  }

  const cardClass =
    "rounded-lg border border-border bg-white shadow-sm " +
    "dark:border-slate-800 dark:bg-slate-950";
  const fieldClass =
    "h-12 rounded-lg border-slate-200 bg-slate-50 px-3 shadow-inner shadow-foreground/5 transition-colors hover:bg-slate-50 focus-visible:border-ring focus-visible:ring-ring/20 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900/70";
  const helperClass = "text-xs leading-5 text-slate-500 dark:text-slate-400";

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[420px] w-full max-w-6xl flex-col items-center justify-center gap-4 rounded-lg border border-border bg-white/85 px-6 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-foreground dark:bg-muted/50 dark:text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <p className="text-sm font-medium">Loading devices and templates...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground dark:bg-muted dark:text-foreground">
            <SendHorizontal className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Single Message
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Send one WhatsApp text or template from any connected session.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:w-[330px]">
          <div className="rounded-lg bg-muted px-3 py-2 text-center text-foreground dark:bg-muted/40 dark:text-foreground">
            <p className="text-lg font-bold tabular-nums">{totalDevices}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
              Devices
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <p className="text-lg font-bold tabular-nums">{connected.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
              Online
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-center text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="text-lg font-bold tabular-nums">{activeTemplates}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
              Templates
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="size-4" />
            </span>
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">
              Ready sessions
            </span>
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {connected.length} connected
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground dark:bg-muted/40 dark:text-foreground">
              <FileText className="size-4" />
            </span>
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">
              Template library
            </span>
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {activeTemplates} active
          </span>
        </div>
        <Link
          href="/devices"
          className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted dark:border-border dark:bg-slate-950 dark:text-foreground dark:hover:bg-muted/50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground dark:bg-muted/40 dark:text-foreground">
              <Smartphone className="size-4" />
            </span>
            <span className="truncate">Manage devices</span>
          </span>
          <span className="text-xs text-muted-foreground dark:text-muted-foreground">
            Open
          </span>
        </Link>
      </div>

      {connected.length === 0 ? (
        <DeviceConnectionAlert
          title="No WhatsApp Device Connected"
          description="An active, connected WhatsApp device is required to send messages. Please connect a device under Devices to get started."
          actionText="Connect Device"
          actionHref="/devices"
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className={cardClass}>
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 pb-4 pt-5 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6">
              <CardTitle className="text-base font-semibold sm:text-lg">
                Sender and recipient
              </CardTitle>
              <CardDescription>
                Pick the WhatsApp session that will send, then enter the
                recipient number.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-6 sm:px-6">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="device">Sending device</Label>
                  <Select
                    value={deviceId}
                    onValueChange={(v) => setDeviceId(v ?? "")}
                    disabled={connected.length === 0}
                    items={connected.map((d) => ({
                      value: d.id,
                      label: deviceName(d),
                    }))}
                  >
                    <SelectTrigger
                      id="device"
                      size="default"
                      className={`${fieldClass} w-full min-w-0`}
                    >
                      <SelectValue placeholder="Choose a connected device..." />
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
                  ) : (
                    <p className={helperClass}>
                      Only connected devices are available here.
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="phone">Recipient WhatsApp number</Label>
                  <PhoneNumberWithCountryInput
                    id="phone"
                    countryIso2={phoneCountryIso2}
                    onCountryIso2Change={setPhoneCountryIso2}
                    localNumber={localPhoneNumber}
                    onLocalNumberChange={setLocalPhoneNumber}
                    placeholder="Phone number without country code"
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 shadow-inner shadow-foreground/5 focus-within:border-ring focus-within:ring-ring/20 dark:border-slate-800 dark:bg-slate-900/70"
                  />
                  <p className={helperClass}>
                    Select country code first, then type the local number.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="invisible">Check Number</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-lg border-border bg-white px-4 font-semibold text-foreground shadow-sm hover:bg-muted dark:border-border dark:bg-slate-950 dark:text-foreground dark:hover:bg-muted/50 md:w-auto"
                    disabled={connected.length === 0 || checking || !localPhoneNumber.trim()}
                    onClick={() => void handleCheckNumber()}
                  >
                    {checking ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {checking ? "Checking" : "Check"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-foreground dark:text-muted-foreground" />
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Message format
                </CardTitle>
              </div>
              <CardDescription>
                Choose whether this send uses a typed message or a saved
                template.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
              <MessageTypeCards
                value={messageType}
                onChange={setMessageType}
                includeMedia={true}
              />
            </CardContent>
          </Card>

          {messageType === "text" ? (
            <Card className={cardClass}>
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Text message content
                </CardTitle>
                <CardDescription>
                  This text will be sent exactly as written.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-6 sm:px-6 sm:pb-7">
                <Label htmlFor="message-body">Message body</Label>
                <Textarea
                  id="message-body"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={connected.length === 0 || sending}
                  placeholder={
                    connected.length === 0
                      ? "Connect a WhatsApp device to write and send messages..."
                      : "Write the WhatsApp message here..."
                  }
                  className="min-h-48 resize-y rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed shadow-inner shadow-foreground/5 focus-visible:border-ring focus-visible:ring-ring/20 dark:border-slate-800 dark:bg-slate-900/70"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={helperClass}>
                    Line breaks and spacing will be preserved.
                  </p>
                  <p className={`${helperClass} tabular-nums`}>
                    {messageText.trim().length} chars
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : messageType === "template" ? (
            <Card className={cardClass}>
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Template message
                </CardTitle>
                <CardDescription>
                  Select one active template from your template library.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
                <div className="space-y-3">
                  <Label htmlFor="template">Template to send</Label>
                  {templates.length === 0 ? (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                      No templates yet. Create one on the{" "}
                      <Link
                        href="/templates"
                        className="font-semibold text-foreground underline underline-offset-2 dark:text-muted-foreground"
                      >
                        Templates
                      </Link>{" "}
                      page.
                    </div>
                  ) : (
                    <Select
                      value={templateId}
                      onValueChange={(v) => setTemplateId(v ?? "")}
                      disabled={connected.length === 0 || sending}
                      items={templates.map((t) => ({
                        value: t.id,
                        label: t.name,
                      }))}
                    >
                      <SelectTrigger
                        id="template"
                        className={`${fieldClass} w-full`}
                      >
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className={helperClass}>
                    The selected template content and attached media will be
                    used for this send.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={cardClass}>
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-5 text-foreground dark:text-muted-foreground" />
                  <CardTitle className="text-base font-semibold sm:text-lg">
                    Media attachment & caption
                  </CardTitle>
                </div>
                <CardDescription>
                  Send an image, video, audio note, or document (PDF, Excel, Word, ZIP, etc.) up to 16 MB.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-5 pb-6 sm:px-6 sm:pb-7">
                {/* Mode toggle: Upload File vs Direct URL */}
                <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-slate-50 p-1 dark:bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => setMediaMode("upload")}
                    disabled={connected.length === 0 || sending}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors",
                      mediaMode === "upload"
                        ? "bg-white text-foreground shadow-sm dark:bg-slate-950"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="size-3.5" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaMode("url")}
                    disabled={connected.length === 0 || sending}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors",
                      mediaMode === "url"
                        ? "bg-white text-foreground shadow-sm dark:bg-slate-950"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link2 className="size-3.5" />
                    Direct URL
                  </button>
                </div>

                {mediaMode === "upload" ? (
                  <div>
                    <input
                      ref={mediaInputRef}
                      type="file"
                      id="single-media-upload"
                      className="hidden"
                      disabled={connected.length === 0 || sending}
                      accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,application/zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaFileChange(file);
                      }}
                    />

                    {!mediaFile ? (
                      <div
                        onClick={() => {
                          if (connected.length > 0 && !sending) {
                            mediaInputRef.current?.click();
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (connected.length > 0 && !sending) {
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleMediaFileChange(file);
                          }
                        }}
                        className={cn(
                          "group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-7 text-center transition-colors dark:border-slate-800",
                          connected.length === 0 || sending
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:border-primary/50 hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                        )}
                      >
                        <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-800 dark:text-slate-400">
                          <Upload className="size-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Click to upload or drag & drop
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Images (JPG, PNG, WEBP), Audio (MP3, OGG, Opus), Video (MP4), or Documents (PDF, DOC, XLS)
                        </p>
                        <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Max 16 MB
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        {/* File preview */}
                        {mediaMimeType.startsWith("image/") && mediaPreviewUrl ? (
                          <div className="mb-3 flex justify-center">
                            <img
                              src={mediaPreviewUrl}
                              alt={mediaFileName}
                              className="max-h-56 w-auto rounded-lg border border-border object-contain shadow-sm"
                            />
                          </div>
                        ) : mediaMimeType.startsWith("video/") && mediaPreviewUrl ? (
                          <div className="mb-3 flex justify-center">
                            <video
                              src={mediaPreviewUrl}
                              controls
                              className="max-h-56 w-full rounded-lg border border-border shadow-sm"
                            />
                          </div>
                        ) : mediaMimeType.startsWith("audio/") && mediaPreviewUrl ? (
                          <div className="mb-3">
                            <audio
                              src={mediaPreviewUrl}
                              controls
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {mediaFileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {mediaMimeType || "Document"} · {formatBytes(mediaFileSize)}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            <Paperclip className="size-3.5 shrink-0" />
                            <span className="truncate font-medium text-foreground">{mediaFileName}</span>
                            <span className="shrink-0 text-slate-400">({formatBytes(mediaFileSize)})</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => mediaInputRef.current?.click()}
                              disabled={sending}
                            >
                              Change
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              onClick={clearMediaFile}
                              disabled={sending}
                            >
                              <X className="mr-1 size-3.5" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="media-url">Public File URL</Label>
                      <Input
                        id="media-url"
                        type="url"
                        placeholder="https://example.com/invoice.pdf or image link"
                        value={mediaFileUrl}
                        onChange={(e) => setMediaFileUrl(e.target.value)}
                        disabled={connected.length === 0 || sending}
                        className={fieldClass}
                      />
                      <p className={helperClass}>
                        Must be a direct, publicly reachable URL (https://) to an image, video, audio, or document file.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="media-url-name">Custom file name (optional)</Label>
                      <Input
                        id="media-url-name"
                        placeholder="e.g. invoice.pdf"
                        value={mediaFileName}
                        onChange={(e) => setMediaFileName(e.target.value)}
                        disabled={connected.length === 0 || sending}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                )}

                {/* Caption / body text */}
                <div className="space-y-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                  <Label htmlFor="media-caption">Caption or message text (optional)</Label>
                  <Textarea
                    id="media-caption"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={connected.length === 0 || sending}
                    placeholder="Add an optional caption for this media..."
                    className="min-h-28 resize-y rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed shadow-inner shadow-foreground/5 focus-visible:border-ring focus-visible:ring-ring/20 dark:border-slate-800 dark:bg-slate-900/70"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className={helperClass}>
                      The caption will accompany the attachment on WhatsApp.
                    </p>
                    <p className={`${helperClass} tabular-nums`}>
                      {messageText.trim().length} chars
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className={cardClass}>
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
              <CardTitle className="text-base font-semibold sm:text-lg">
                Send summary
              </CardTitle>
              <CardDescription>
                Review the active sender and message mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-6 sm:px-6 sm:pb-7">
              <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  From
                </p>
                <p className="mt-1 truncate font-semibold text-slate-900 dark:text-slate-50">
                  {selectedDevice
                    ? deviceName(selectedDevice)
                    : "No device selected"}
                </p>
                {selectedDevice ? (
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                    {selectedDevice.phone ?? "Number on file"}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  To
                </p>
                <p className="mt-1 truncate font-semibold text-slate-900 dark:text-slate-50">
                  {phone.trim() || "No recipient number"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Message
                </p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-50">
                  {messageType === "text"
                    ? "Text message"
                    : messageType === "template"
                      ? "Template message"
                      : "Media & Document"}
                </p>
                {messageType === "media" && (mediaFileName || mediaFileUrl) ? (
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {mediaFileName || mediaFileUrl}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                disabled={!canSend || connected.length === 0 || sending}
                className="h-11 w-full rounded-md bg-primary px-6 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                onClick={() => void handleSend()}
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
