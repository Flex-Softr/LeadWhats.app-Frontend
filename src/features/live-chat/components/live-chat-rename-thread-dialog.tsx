"use client";

import * as React from "react";
import { Loader2, Pencil } from "lucide-react";
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

type LiveChatRenameThreadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thread: LiveChatThreadApi | null;
  onSaved: (thread: LiveChatThreadApi) => void;
};

export function LiveChatRenameThreadDialog({
  open,
  onOpenChange,
  thread,
  onSaved,
}: LiveChatRenameThreadDialogProps) {
  const [label, setLabel] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !thread) return;
    setLabel(thread.peerLabel);
  }, [open, thread]);

  const canSubmit = thread != null && !submitting;

  async function handleSubmit() {
    if (!thread || !canSubmit) return;
    setSubmitting(true);
    try {
      const res = await apiJson<LiveChatThreadMutationResponse>(
        `/v1/live-chat/threads/${thread.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peerLabel: label.trim() }),
        }
      );
      toast.success("Name updated");
      onSaved(res.thread);
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update conversation.";
      toast.error("Update failed", { description: msg });
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
            <Pencil className="size-5 text-violet-600 dark:text-violet-400" />
            Rename conversation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="lc-rename" className="text-sm font-semibold">
              Display name
            </Label>
            <Input
              id="lc-rename"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={thread?.peerPhone ?? "Name"}
              className="h-10 rounded-md"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to show the phone number in the list.
            </p>
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
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
