"use client";

import * as React from "react";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import type {
  LiveChatThreadApi,
  LiveChatThreadMutationResponse,
} from "@/types/live-chat-api";
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
import { cn } from "@/lib/utils";

type LiveChatNewThreadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: string;
  onCreated: (thread: LiveChatThreadApi) => void;
};

export function LiveChatNewThreadDialog({
  open,
  onOpenChange,
  deviceId,
  onCreated,
}: LiveChatNewThreadDialogProps) {
  const [phone, setPhone] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setPhone("");
    setLabel("");
  }, [open]);

  const canSubmit =
    deviceId.length > 0 && phone.trim().length >= 3 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await apiJson<LiveChatThreadMutationResponse>(
        "/v1/live-chat/threads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            peerPhone: phone.trim(),
            peerLabel: label.trim() || undefined,
          }),
        }
      );
      toast.success("Conversation ready", {
        description: `Chat with ${res.thread.displayTitle}`,
      });
      onCreated(res.thread);
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not start conversation.";
      toast.error("Failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-lg p-0 sm:max-w-md",
          "border border-violet-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        )}
      >
        <DialogHeader className="border-b border-violet-100 bg-slate-50/70 px-6 pb-4 pt-6 text-left dark:border-slate-800 dark:bg-slate-900/40">
          <DialogTitle className="font-heading flex items-center gap-2 pr-8 text-lg font-semibold">
            <MessageSquarePlus className="size-5 text-violet-600 dark:text-violet-400" />
            New conversation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="lc-phone" className="text-sm font-semibold">
              Phone number <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Input
              id="lc-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 0100"
              className="h-10 rounded-md"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">
              International format (E.164), same as Single message.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lc-label" className="text-sm font-semibold">
              Display name (optional)
            </Label>
            <Input
              id="lc-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Acme support"
              className="h-10 rounded-md"
              maxLength={200}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            className="rounded-md"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-md bg-violet-600 font-semibold text-white hover:bg-violet-700"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Open chat"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
