"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  SendHorizontal,
  Smartphone,
} from "lucide-react";

import type { DeviceApiRecord, DevicesListResponse } from "@/types/device";
import type {
  SingleMessageTemplatesResponse,
  SingleSendResponse,
  ValidatePhoneResponse,
} from "@/types/single-message-api";
import { MessageTypeCards } from "@/features/single-message/components/message-type-cards";
import type { MessageFormType } from "@/features/single-message/components/message-type-cards";
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
import { Textarea } from "@/components/ui/textarea";

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
  const [messageType, setMessageType] = React.useState<MessageFormType>("text");
  const [messageText, setMessageText] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string>("");
  const [checking, setChecking] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (messageType === "text") setTemplateId("");
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
      const body =
        messageType === "text"
          ? {
              deviceId,
              toPhone,
              kind: "text" as const,
              bodyText: messageText.trim(),
            }
          : {
              deviceId,
              toPhone,
              kind: "template" as const,
              templateId,
            };

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
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Send request failed.";
      toast.error("Could not send", { description: msg });
    } finally {
      setSending(false);
    }
  }

  const cardClass =
    "rounded-lg border border-violet-100 bg-white shadow-sm " +
    "dark:border-slate-800 dark:bg-slate-950";
  const fieldClass =
    "h-12 rounded-lg border-slate-200 bg-slate-50 px-3 shadow-inner shadow-violet-950/5 transition-colors hover:bg-slate-50 focus-visible:border-violet-400 focus-visible:ring-violet-500/20 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900/70";
  const helperClass = "text-xs leading-5 text-slate-500 dark:text-slate-400";

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[420px] w-full max-w-6xl flex-col items-center justify-center gap-4 rounded-lg border border-violet-100 bg-white/85 px-6 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="flex size-16 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <p className="text-sm font-medium">Loading devices and templates...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 rounded-lg border border-violet-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
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
          <div className="rounded-lg bg-violet-50 px-3 py-2 text-center text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
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
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
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
          className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50 dark:border-violet-900 dark:bg-slate-950 dark:text-violet-200 dark:hover:bg-violet-950/20"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
              <Smartphone className="size-4" />
            </span>
            <span className="truncate">Manage devices</span>
          </span>
          <span className="text-xs text-violet-500 dark:text-violet-300">
            Open
          </span>
        </Link>
      </div>

      {connected.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <p className="font-semibold">No connected WhatsApp device</p>
              <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">
                Link a phone from{" "}
                <Link
                  href="/devices"
                  className="font-semibold underline underline-offset-2"
                >
                  Devices
                </Link>{" "}
                before sending a single message.
              </p>
            </div>
          </div>
        </div>
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
                  >
                    <SelectTrigger
                      id="device"
                      size="default"
                      className={`${fieldClass} w-full min-w-0`}
                    >
                      <SelectValue placeholder="Choose a connected device...">
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
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 shadow-inner shadow-violet-950/5 focus-within:border-violet-400 focus-within:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-900/70"
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
                    className="h-12 w-full rounded-lg border-violet-100 bg-white px-4 font-semibold text-violet-700 shadow-sm hover:bg-violet-50 dark:border-violet-900 dark:bg-slate-950 dark:text-violet-200 dark:hover:bg-violet-950/20 md:w-auto"
                    disabled={checking}
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
                <MessageSquare className="size-5 text-violet-600 dark:text-violet-300" />
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
              <MessageTypeCards value={messageType} onChange={setMessageType} />
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
                  placeholder="Write the WhatsApp message here..."
                  className="min-h-48 resize-y rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed shadow-inner shadow-violet-950/5 focus-visible:border-violet-400 focus-visible:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-900/70"
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
          ) : (
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
                        className="font-semibold text-violet-700 underline underline-offset-2 dark:text-violet-300"
                      >
                        Templates
                      </Link>{" "}
                      page.
                    </div>
                  ) : (
                    <Select
                      value={templateId}
                      onValueChange={(v) => setTemplateId(v ?? "")}
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
                    : "Template message"}
                </p>
              </div>
              <Button
                type="button"
                disabled={!canSend || connected.length === 0 || sending}
                className="h-11 w-full rounded-md bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
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
