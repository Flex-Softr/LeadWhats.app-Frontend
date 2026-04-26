"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { NodeMessageTypeCards } from "@/features/chatbot/components/node-message-type-cards";
import type { MessageFormType } from "@/features/single-message/components/message-type-cards";
import type {
  ChatbotFlowNode,
  ChatbotNodeKind,
} from "@/types/chatbot";
import type {
  MessageTemplateApiRecord,
  TemplatesListResponse,
} from "@/types/templates-api";
import { ApiError, apiJson } from "@/lib/api";
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

const ATTACHMENT_TYPES = [
  { value: "__none__", label: "No attachment" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "audio", label: "Audio" },
] as const;

function newNodeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `node_${Date.now()}`;
}

type AddChatbotNodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (node: ChatbotFlowNode) => void;
};

export function AddChatbotNodeDialog({
  open,
  onOpenChange,
  onAdd,
}: AddChatbotNodeDialogProps) {
  const [contextLoading, setContextLoading] = React.useState(false);
  const [templates, setTemplates] = React.useState<MessageTemplateApiRecord[]>(
    []
  );

  const [nodeName, setNodeName] = React.useState("");
  const [kind, setKind] = React.useState<ChatbotNodeKind>("message");
  const [messageFormType, setMessageFormType] =
    React.useState<MessageFormType>("text");
  const [messageBody, setMessageBody] = React.useState("");
  const [templateId, setTemplateId] = React.useState("");
  const [attachment, setAttachment] = React.useState<string>("__none__");

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      try {
        const tplRes = await apiJson<TemplatesListResponse>("/v1/templates");
        if (cancelled) return;
        setTemplates(tplRes.templates.filter((tpl) => tpl.active !== false));
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError
              ? err.message
              : "Could not load templates.";
          toast.error("Load failed", { description: msg });
          setTemplates([]);
        }
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setNodeName("");
    setKind("message");
    setMessageFormType("text");
    setMessageBody("");
    setTemplateId("");
    setAttachment("__none__");
  }, [open]);

  React.useEffect(() => {
    if (messageFormType === "text") setTemplateId("");
  }, [messageFormType]);

  const messageValid =
    kind !== "message" ||
    (messageFormType === "text"
      ? messageBody.trim().length > 0
      : templateId !== "" && templates.some((t) => t.id === templateId));

  const canSubmit =
    !contextLoading && nodeName.trim().length > 0 && messageValid;

  function handleAdd() {
    if (!canSubmit) return;
    const tpl = templateId
      ? templates.find((t) => t.id === templateId)
      : undefined;
    const node: ChatbotFlowNode = {
      id: newNodeId(),
      name: nodeName.trim(),
      kind,
      sortOrder: 0,
      ...(kind === "message"
        ? {
            messageFormType,
            messageBody:
              messageFormType === "text" ? messageBody.trim() : undefined,
            templateId: messageFormType === "template" ? templateId : null,
            templateName:
              messageFormType === "template" ? (tpl?.name ?? null) : null,
            attachmentType:
              attachment === "__none__" ? null : attachment,
          }
        : {}),
    };
    onAdd(node);
    toast.success("Node added", { description: `“${node.name}” is in the flow.` });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,760px)] max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg",
          "border border-white/70 bg-white/95 shadow-2xl shadow-violet-950/10 backdrop-blur-md",
          "dark:border-slate-800 dark:bg-slate-950/95"
        )}
      >
        <DialogHeader className="border-b border-slate-200/80 px-6 pb-4 pt-6 text-left sm:px-8 sm:pb-5 sm:pt-7 dark:border-slate-800">
          <DialogTitle className="font-heading pr-8 text-lg font-semibold sm:text-xl">
            Add node
          </DialogTitle>
        </DialogHeader>

        {contextLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="size-9 animate-spin text-violet-600" />
            <p className="text-sm">Loading templates…</p>
          </div>
        ) : (
          <>
            <div className="max-h-[min(58vh,520px)] space-y-5 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-2">
                <Label htmlFor="an-name" className="text-sm font-semibold">
                  Node name{" "}
                  <span className="font-normal text-red-600 dark:text-red-400">
                    *
                  </span>
                </Label>
                <Input
                  id="an-name"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="e.g., Welcome message"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="an-kind" className="text-sm font-semibold">
                  Node type
                </Label>
                <Select
                  value={kind}
                  onValueChange={(v) =>
                    setKind((v ?? "message") as ChatbotNodeKind)
                  }
                >
                  <SelectTrigger id="an-kind" className="h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {kind === "message" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Message type</Label>
                    <NodeMessageTypeCards
                      value={messageFormType}
                      onChange={setMessageFormType}
                    />
                  </div>

                  {messageFormType === "text" ? (
                    <div className="space-y-2">
                      <Label htmlFor="an-body" className="text-sm font-semibold">
                        Message content{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      <Textarea
                        id="an-body"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder="Enter the message for this node…"
                        className="min-h-32 resize-y rounded-xl text-[15px] leading-relaxed"
                      />
                    </div>
                  ) : templates.length === 0 ? (
                    <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      No templates — create one under Templates.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="an-template" className="text-sm font-semibold">
                        Template{" "}
                        <span className="font-normal text-red-600 dark:text-red-400">
                          *
                        </span>
                      </Label>
                      <Select
                        value={templateId || "__none__"}
                        onValueChange={(v) =>
                          setTemplateId(v === "__none__" ? "" : (v ?? ""))
                        }
                      >
                        <SelectTrigger
                          id="an-template"
                          className="h-11 w-full rounded-xl"
                        >
                          <SelectValue placeholder="Select template…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Choose…</SelectItem>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="an-attach" className="text-sm font-semibold">
                      Attachment (optional)
                    </Label>
                    <Select
                      value={attachment}
                      onValueChange={(v) => setAttachment(v ?? "__none__")}
                    >
                      <SelectTrigger id="an-attach" className="h-11 w-full rounded-xl">
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
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                  Branching and logic for this node type are stored; extend the
                  payload from your automation layer when needed.
                </p>
              )}
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
                className="h-11 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                onClick={handleAdd}
              >
                Add node
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
