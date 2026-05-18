"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Send, SendHorizontal } from "lucide-react";

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
    "rounded-lg border border-white/70 bg-white/90 shadow-md " +
    "shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 " +
    "dark:bg-slate-950/60";

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-4 py-24 text-slate-500 dark:text-slate-400 lg:max-w-4xl">
        <Loader2 className="size-10 animate-spin text-violet-600 dark:text-violet-400" />
        <p className="text-sm">Loading devices and templates…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 lg:max-w-4xl lg:gap-9">
      <Card className={cardClass}>
        <CardHeader className="border-b border-slate-100 px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm sm:size-14">
              <SendHorizontal className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Single Message
              </CardTitle>
              <CardDescription className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
                Send from a{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  connected
                </span>{" "}
                device (linked under Devices). Messages go out through that
                phone&apos;s WhatsApp when the server bridge is enabled.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
          {connected.length === 0 ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
              <p className="font-medium">No connected devices</p>
              <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">
                Link your phone under{" "}
                <Link
                  href="/devices"
                  className="font-semibold underline underline-offset-2"
                >
                  Devices
                </Link>{" "}
                (scan QR so the device shows &quot;Connected&quot;), then pick
                that device here to send.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start sm:gap-7">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="device">Select Device</Label>
                <Select
                  value={deviceId}
                  onValueChange={(v) => setDeviceId(v ?? "")}
                >
                  <SelectTrigger
                    id="device"
                    size="default"
                    className="h-11 w-full min-w-0 rounded-sm"
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Outgoing messages will use this WhatsApp session (
                    {selectedDevice.phone ?? "number on file"}).
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneNumberWithCountryInput
                  id="phone"
                  countryIso2={phoneCountryIso2}
                  onCountryIso2Change={setPhoneCountryIso2}
                  localNumber={localPhoneNumber}
                  onLocalNumberChange={setLocalPhoneNumber}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label className="invisible">Check Number</Label>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-full sm:w-auto rounded-sm"
                  disabled={checking}
                  onClick={() => void handleCheckNumber()}
                >
                  {checking ? "Checking…" : "Check"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Message Type
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
          <MessageTypeCards value={messageType} onChange={setMessageType} />
        </CardContent>
      </Card>

      {messageType === "text" ? (
        <Card className={cardClass}>
          <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Message Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-6 sm:px-6 sm:pb-7">
            <Label htmlFor="message-body">Message Text</Label>
            <Textarea
              id="message-body"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message text..."
              className="min-h-40 resize-y text-[15px] leading-relaxed"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className={cardClass}>
          <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Select Template
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
            <div className="space-y-3">
              <Label htmlFor="template">Template</Label>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No templates yet. Create one on the{" "}
                  <Link href="/templates" className="underline underline-offset-2">
                    Templates
                  </Link>{" "}
                  page — template mode sends the full template on WhatsApp
                  (text, images, and other media you attached there).
                </p>
              ) : (
                <Select
                  value={templateId}
                  onValueChange={(v) => setTemplateId(v ?? "")}
                >
                  <SelectTrigger id="template" className="h-11 w-full">
                    <SelectValue placeholder="Choose a template…" />
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
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={cardClass}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
          <div>
            <CardTitle className="text-base font-semibold sm:text-lg">
              Send Message
            </CardTitle>
            {selectedDevice ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                From: {deviceName(selectedDevice)}
              </p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex justify-end px-5 pb-6 sm:px-6 sm:pb-7">
          <Button
            type="button"
            disabled={!canSend || connected.length === 0 || sending}
            className="h-11 min-w-[10rem] gap-2 px-6 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
            onClick={() => void handleSend()}
          >
            <Send className="size-4" />
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
