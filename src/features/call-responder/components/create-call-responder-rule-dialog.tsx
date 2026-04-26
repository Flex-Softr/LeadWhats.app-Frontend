"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { NodeMessageTypeCards } from "@/features/chatbot/components/node-message-type-cards";
import type { MessageFormType } from "@/features/single-message/components/message-type-cards";
import {
  DEMO_MESSAGE_TEMPLATES,
  DEMO_MESSAGING_DEVICES,
} from "@/lib/demo-messaging";
import type {
  CallResponderCallType,
  CallResponderRule,
} from "@/types/call-responder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

const CALL_TYPE_OPTIONS: {
  value: CallResponderCallType;
  label: string;
}[] = [
  { value: "received", label: "Received calls" },
  { value: "outgoing", label: "Outgoing calls" },
  { value: "missed", label: "Missed calls" },
  { value: "rejected", label: "Rejected calls" },
];

let fallbackIdSeq = 0;

function newRuleId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  fallbackIdSeq += 1;
  return `cr_rule_${fallbackIdSeq}`;
}

type CreateCallResponderRuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (rule: CallResponderRule) => void;
};

export function CreateCallResponderRuleDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCallResponderRuleDialogProps) {
  const [name, setName] = React.useState("");
  const [deviceId, setDeviceId] = React.useState<string | null>(null);
  const [callTypes, setCallTypes] = React.useState<Set<CallResponderCallType>>(
    () => new Set(["missed", "rejected"])
  );
  const [delayMinutes, setDelayMinutes] = React.useState("1");
  const [messageFormType, setMessageFormType] =
    React.useState<MessageFormType>("text");
  const [messageBody, setMessageBody] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setDeviceId(DEMO_MESSAGING_DEVICES[0]?.id ?? null);
    setCallTypes(new Set(["missed", "rejected"]));
    setDelayMinutes("1");
    setMessageFormType("text");
    setMessageBody("");
    setTemplateId(null);
  }, [open]);

  React.useEffect(() => {
    if (messageFormType === "text") setTemplateId(null);
  }, [messageFormType]);

  function toggleCallType(t: CallResponderCallType, on: boolean) {
    setCallTypes((prev) => {
      const n = new Set(prev);
      if (on) n.add(t);
      else n.delete(t);
      return n;
    });
  }

  const messageOk =
    messageFormType === "text"
      ? messageBody.trim().length > 0
      : templateId != null;

  const canSubmit =
    name.trim().length > 0 &&
    deviceId != null &&
    callTypes.size > 0 &&
    messageOk;

  function handleCreate() {
    if (!canSubmit || !deviceId) return;
    const device = DEMO_MESSAGING_DEVICES.find((d) => d.id === deviceId);
    const template = templateId
      ? DEMO_MESSAGE_TEMPLATES.find((t) => t.id === templateId)
      : null;
    const rule: CallResponderRule = {
      id: newRuleId(),
      name: name.trim(),
      deviceId,
      deviceLabel: device?.label ?? deviceId,
      callTypes: Array.from(callTypes),
      responseDelayMinutes: Math.max(0, Number.parseInt(delayMinutes, 10) || 0),
      messageFormType,
      messageBody:
        messageFormType === "text" ? messageBody.trim() : undefined,
      templateId: messageFormType === "template" ? templateId : null,
      templateName:
        messageFormType === "template" ? (template?.name ?? null) : null,
      active: true,
      responsesSent: 0,
      callsToday: 0,
    };
    onCreated(rule);
    toast.success("Rule created", { description: `“${rule.name}” is active.` });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(94vh,820px)] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg",
          "border border-white/70 bg-white/95 shadow-2xl shadow-violet-950/10 backdrop-blur-md",
          "dark:border-slate-800 dark:bg-slate-950/95"
        )}
      >
        <DialogHeader className="border-b border-slate-200/80 px-6 pb-4 pt-6 text-left sm:px-8 sm:pb-5 sm:pt-7 dark:border-slate-800">
          <DialogTitle className="font-heading pr-8 text-xl font-semibold tracking-tight sm:text-2xl">
            Create Rule
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[min(62vh,560px)] space-y-5 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="cr-name" className="text-sm font-semibold">
                Rule Name{" "}
                <span className="font-normal text-red-600 dark:text-red-400">
                  *
                </span>
              </Label>
              <Input
                id="cr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Missed Call Response"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="cr-session" className="text-sm font-semibold">
                WhatsApp Session{" "}
                <span className="font-normal text-red-600 dark:text-red-400">
                  *
                </span>
              </Label>
              <Select
                value={deviceId ?? undefined}
                onValueChange={(v) => setDeviceId(v ?? null)}
              >
                <SelectTrigger id="cr-session" className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_MESSAGING_DEVICES.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Call Types to Respond To{" "}
              <span className="font-normal text-red-600 dark:text-red-400">
                *
              </span>
            </Label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {CALL_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <input
                    type="checkbox"
                    checked={callTypes.has(opt.value)}
                    onChange={(e) => toggleCallType(opt.value, e.target.checked)}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="text-[15px] text-slate-800 dark:text-slate-200">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cr-delay" className="text-sm font-semibold">
              Response delay
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="cr-delay"
                type="number"
                min={0}
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="h-11 w-20 rounded-xl tabular-nums"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                minute(s) after call ends
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Message Type{" "}
              <span className="font-normal text-red-600 dark:text-red-400">
                *
              </span>
            </Label>
            <NodeMessageTypeCards
              value={messageFormType}
              onChange={setMessageFormType}
            />
          </div>

          {messageFormType === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="cr-body" className="text-sm font-semibold">
                Message Content{" "}
                <span className="font-normal text-red-600 dark:text-red-400">
                  *
                </span>
              </Label>
              <Textarea
                id="cr-body"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Enter the message to send after the call..."
                className="min-h-32 resize-y rounded-xl text-[15px] leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="cr-template" className="text-sm font-semibold">
                Template{" "}
                <span className="font-normal text-red-600 dark:text-red-400">
                  *
                </span>
              </Label>
              <Select
                value={templateId ?? undefined}
                onValueChange={(v) => setTemplateId(v ?? null)}
              >
                <SelectTrigger id="cr-template" className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select a template…" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_MESSAGE_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cr-file" className="text-sm font-semibold">
              Attachment (optional)
            </Label>
            <Input
              id="cr-file"
              type="file"
              className="h-11 cursor-pointer rounded-xl bg-white dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50/60 px-6 py-5 sm:flex-row sm:justify-end sm:gap-3 sm:px-8 sm:py-6 dark:border-slate-800 dark:bg-slate-900/50">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-6"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            className="h-11 gap-2 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
            onClick={handleCreate}
          >
            <Plus className="size-4" />
            Create Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
