"use client";

import * as React from "react";
import { Clock, Loader2, MessageSquareDot, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AddChatbotNodeDialog } from "@/features/chatbot/components/add-chatbot-node-dialog";
import {
  CredentialModelFields,
  aiSettingsDefaults,
  aiSettingsFormValid,
  buildAiSettingsPayload,
  parseAiSettingsFromRecord,
} from "@/features/ai-credentials/components/credential-model-fields";
import type { ChatbotFlow, ChatbotFlowNode } from "@/types/chatbot";
import type { ChatbotFlowMutationResponse } from "@/types/chatbot-api";
import type {
  AiCredentialApi,
  AiCredentialsListResponse,
  AiSettingsForm,
} from "@/types/ai-credentials-api";
import type { DeviceApiRecord, DevicesListResponse } from "@/types/device";
import { ApiError, apiJson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
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

type CreateChatbotFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFlow: ChatbotFlow | null;
  onSaved: () => void;
};

function kindLabel(k: ChatbotFlowNode["kind"]) {
  switch (k) {
    case "message":
      return "Message";
    case "question":
      return "Question";
    case "action":
      return "Action";
    case "condition":
      return "Condition";
    default:
      return k;
  }
}

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

function nodePayloadForApi(n: ChatbotFlowNode): Record<string, unknown> | null {
  if (n.kind !== "message") return null;
  const p: Record<string, unknown> = {
    messageFormType: n.messageFormType ?? "text",
  };
  if (n.messageFormType === "template") {
    if (n.templateId) p.templateId = n.templateId;
    if (n.templateName) p.templateName = n.templateName;
  } else {
    p.messageBody = n.messageBody ?? "";
  }
  if (n.attachmentType) p.attachmentType = n.attachmentType;
  return p;
}

function draftNodesToApi(nodes: ChatbotFlowNode[]) {
  return nodes.map((n, i) => ({
    name: n.name,
    kind: n.kind,
    sortOrder: i,
    payload: nodePayloadForApi(n),
  }));
}

export function CreateChatbotFlowDialog({
  open,
  onOpenChange,
  editingFlow,
  onSaved,
}: CreateChatbotFlowDialogProps) {
  const isEdit = editingFlow != null;

  const [contextLoading, setContextLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [devices, setDevices] = React.useState<DeviceApiRecord[]>([]);
  const [credentials, setCredentials] = React.useState<AiCredentialApi[]>([]);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deviceId, setDeviceId] = React.useState("");
  const [triggerKeywords, setTriggerKeywords] = React.useState("");
  const [cooldown, setCooldown] = React.useState("0");
  const [active, setActive] = React.useState(true);
  const [aiEnabled, setAiEnabled] = React.useState(false);
  const [aiSettings, setAiSettings] =
    React.useState<AiSettingsForm>(aiSettingsDefaults);
  const [draftNodes, setDraftNodes] = React.useState<ChatbotFlowNode[]>([]);
  const [addNodeOpen, setAddNodeOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setAddNodeOpen(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      try {
        const [devRes, credRes] = await Promise.all([
          apiJson<DevicesListResponse>("/v1/devices"),
          apiJson<AiCredentialsListResponse>("/v1/ai-credentials").catch(
            () => ({ credentials: [] })
          ),
        ]);
        if (cancelled) return;
        setDevices(devRes.devices);
        setCredentials(credRes.credentials);

        if (editingFlow) {
          setName(editingFlow.name);
          setDescription(editingFlow.description);
          setDeviceId(editingFlow.deviceId);
          setTriggerKeywords(editingFlow.triggerKeywords);
          setCooldown(String(editingFlow.cooldownMinutes));
          setActive(editingFlow.active);
          setAiEnabled(Boolean(editingFlow.aiEnabled));
          setAiSettings(parseAiSettingsFromRecord(editingFlow.aiSettings));
          setDraftNodes(
            [...editingFlow.nodes].sort((a, b) => a.sortOrder - b.sortOrder)
          );
        } else {
          setName("");
          setDescription("");
          const connected = devRes.devices.filter((d) => d.status === "connected");
          setDeviceId(connected[0]?.id ?? devRes.devices[0]?.id ?? "");
          setTriggerKeywords("");
          setCooldown("0");
          setActive(true);
          setAiEnabled(false);
          setAiSettings(aiSettingsDefaults());
          setDraftNodes([]);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError ? err.message : "Could not load devices.";
          toast.error("Load failed", { description: msg });
          setDevices([]);
          setCredentials([]);
        }
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, editingFlow]);

  const canSubmit =
    !contextLoading &&
    !submitting &&
    name.trim().length > 0 &&
    deviceId.length > 0 &&
    triggerKeywords.trim().length > 0 &&
    (!aiEnabled || aiSettingsFormValid(aiSettings));
  const selectedDevice = devices.find((d) => d.id === deviceId);

  function removeNode(id: string) {
    setDraftNodes((prev) => prev.filter((n) => n.id !== id));
  }

  function handleAddNode(node: ChatbotFlowNode) {
    setDraftNodes((prev) => [
      ...prev,
      { ...node, sortOrder: prev.length },
    ]);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const cooldownNum = Math.min(
      10080,
      Math.max(0, Number.parseInt(cooldown, 10) || 0)
    );
    const nodes = draftNodesToApi(draftNodes);
    const aiPayload = aiEnabled
      ? buildAiSettingsPayload(aiSettings)
      : null;

    setSubmitting(true);
    try {
      if (isEdit && editingFlow) {
        await apiJson<ChatbotFlowMutationResponse>(
          `/v1/chatbot-flows/${editingFlow.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              description: description.trim(),
              deviceId,
              triggerKeywords: triggerKeywords.trim(),
              cooldownMinutes: cooldownNum,
              active,
              aiEnabled,
              aiSettings: aiPayload,
              nodes,
            }),
          }
        );
        toast.success("Flow updated", { description: `“${name.trim()}” saved.` });
      } else {
        await apiJson<ChatbotFlowMutationResponse>("/v1/chatbot-flows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            deviceId,
            triggerKeywords: triggerKeywords.trim(),
            cooldownMinutes: cooldownNum,
            active,
            aiEnabled,
            aiSettings: aiPayload,
            nodes,
          }),
        });
        toast.success("Flow created", {
          description:
            draftNodes.length === 0
              ? `“${name.trim()}” is ready — add nodes anytime.`
              : `“${name.trim()}” has ${draftNodes.length} node(s).`,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not save flow.";
      toast.error("Save failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className={cn(
            "max-h-[min(94vh,880px)] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-3xl p-0",
            "border border-white/70 bg-white/95 shadow-2xl shadow-sm backdrop-blur-md",
            "dark:border-slate-800 dark:bg-slate-950/95 sm:max-w-5xl"
          )}
        >
          <DialogHeader className="border-b border-slate-200/80 px-6 pb-4 pt-6 text-left sm:px-8 sm:pb-5 sm:pt-7 dark:border-slate-800">
            <DialogTitle className="font-heading pr-10 text-xl font-semibold tracking-tight sm:text-2xl">
              {isEdit ? "Edit chatbot flow" : "Create chatbot flow"}
            </DialogTitle>
          </DialogHeader>

          {contextLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <Loader2 className="size-10 animate-spin text-foreground" />
              <p className="text-sm">Loading…</p>
            </div>
          ) : (
            <>
              <div className="max-h-[min(68vh,640px)] overflow-y-auto">
                <div className="grid gap-8 p-6 sm:gap-10 sm:p-8 lg:grid-cols-2 lg:items-start">
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      Flow settings
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="cb-name" className="text-sm font-semibold">
                        Flow name{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      <Input
                        id="cb-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Customer support bot"
                        className="h-11 rounded-xl px-3.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cb-desc" className="text-sm font-semibold">
                        Description
                      </Label>
                      <Textarea
                        id="cb-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this flow does…"
                        className="min-h-24 resize-y rounded-xl text-[15px] leading-relaxed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cb-session" className="text-sm font-semibold">
                        WhatsApp session{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      {devices.length === 0 ? (
                        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                          No devices — add one under Devices.
                        </p>
                      ) : (
                        <Select value={deviceId} onValueChange={(v) => setDeviceId(v ?? "")}>
                          <SelectTrigger
                            id="cb-session"
                            className="h-11 w-full rounded-xl"
                          >
                            <SelectValue placeholder="Select a session">
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

                    <div className="space-y-2">
                      <Label htmlFor="cb-kw" className="text-sm font-semibold">
                        Trigger keywords{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      <Input
                        id="cb-kw"
                        value={triggerKeywords}
                        onChange={(e) => setTriggerKeywords(e.target.value)}
                        placeholder="support, help, bot (comma separated)"
                        className="h-11 rounded-xl px-3.5"
                      />
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Incoming messages containing these (case-insensitive) can
                        start this flow.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cb-cooldown" className="text-sm font-semibold">
                        Cooldown (minutes)
                      </Label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="cb-cooldown"
                          type="number"
                          min={0}
                          value={cooldown}
                          onChange={(e) => setCooldown(e.target.value)}
                          className="h-11 rounded-xl pl-10"
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Minimum time between triggers for the same user (0 = none).
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      <span className="text-[15px] font-medium text-slate-800 dark:text-slate-200">
                        Flow is active
                      </span>
                    </label>

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
                              Use AI for replies
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200"
                            >
                              AI Powered
                            </Badge>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            When triggered, generate a reply with your saved
                            credential. Message nodes are used as fallback.
                          </p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={aiEnabled}
                            onChange={(e) => setAiEnabled(e.target.checked)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "relative h-7 w-12 shrink-0 rounded-full border border-slate-200 bg-slate-200 transition-colors dark:border-slate-600 dark:bg-slate-700",
                              aiEnabled &&
                                "border-emerald-500 bg-emerald-500 dark:border-emerald-500"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                                aiEnabled && "translate-x-5"
                              )}
                            />
                          </span>
                        </label>
                      </div>
                      {aiEnabled ? (
                        <div className="mt-4 space-y-4 border-t border-sky-200/70 pt-4 dark:border-sky-900/50">
                          <CredentialModelFields
                            credentials={credentials}
                            value={aiSettings}
                            onChange={setAiSettings}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex min-h-[320px] flex-col rounded-2xl border border-slate-200/90 bg-slate-50/40 p-5 dark:border-slate-800 dark:bg-slate-900/30 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        Flow nodes ({draftNodes.length})
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
                        onClick={() => setAddNodeOpen(true)}
                      >
                        <Plus className="size-4" />
                        Add node
                      </Button>
                    </div>

                    {draftNodes.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200/90 bg-white/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                          <MessageSquareDot className="size-7 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          No nodes yet
                        </p>
                        <p className="max-w-[240px] text-sm text-slate-500 dark:text-slate-400">
                          Add message or logic nodes to this flow.
                        </p>
                      </div>
                    ) : (
                      <ul className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
                        {draftNodes.map((n) => (
                          <li
                            key={n.id}
                            className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground">{n.name}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="font-normal text-xs"
                                >
                                  {kindLabel(n.kind)}
                                </Badge>
                                {n.kind === "message" && n.messageFormType ? (
                                  <span className="text-xs text-muted-foreground">
                                    {n.messageFormType === "text"
                                      ? "Text"
                                      : n.templateName ?? "Template"}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0 text-destructive hover:bg-destructive/10"
                              aria-label={`Remove ${n.name}`}
                              onClick={() => removeNode(n.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

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
                  {isEdit ? "Save flow" : "Create flow"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AddChatbotNodeDialog
        open={addNodeOpen}
        onOpenChange={setAddNodeOpen}
        onAdd={handleAddNode}
      />
    </>
  );
}
