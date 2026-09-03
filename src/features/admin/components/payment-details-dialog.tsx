"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  Building2,
  Clock,
  Key,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import type { AdminPaymentRow } from "@/types/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PaymentDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: AdminPaymentRow | null;
  onVerify?: (payment: AdminPaymentRow) => void;
  onReject?: (payment: AdminPaymentRow) => void;
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

function statusBadgeClass(status: string) {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
  }
  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200";
  }
  if (status === "failed" || status === "cancelled") {
    return "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200";
  }
  return "";
}

export function PaymentDetailsDialog({
  open,
  onOpenChange,
  payment,
  onVerify,
  onReject,
}: PaymentDetailsDialogProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!payment) return null;

  function copyToClipboard(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="size-5 text-primary" />
              Payment Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={statusBadgeClass(payment.status)}>
                {payment.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="uppercase">
                {payment.gateway}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Transaction ID:{" "}
            <code className="font-mono font-medium text-foreground">
              {payment.tranId}
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Main Transaction Highlight */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Amount</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {payment.amount.toFixed(2)} {payment.currency}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Plan Target</p>
              <Badge variant="secondary" className="mt-1 font-semibold uppercase">
                {payment.planId}
              </Badge>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-muted-foreground">Created</p>
              <p className="mt-1 text-xs font-medium text-foreground">
                {formatDate(payment.createdAt)}
              </p>
            </div>
          </div>

          {/* Workspace Info */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Building2 className="size-3.5" />
              Workspace Information
            </h4>
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 text-xs sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Workspace Name:</span>
                <p className="font-semibold text-foreground">{payment.workspace.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Slug:</span>
                <p className="font-mono text-foreground">{payment.workspace.slug}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Workspace ID:</span>
                <div className="flex items-center gap-1">
                  <p className="font-mono truncate text-foreground">{payment.workspace.id}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-5 shrink-0"
                    onClick={() => copyToClipboard(payment.workspace.id, "Workspace ID")}
                  >
                    {copiedField === "Workspace ID" ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Current Workspace Plan:</span>
                <p className="font-semibold uppercase text-foreground">
                  {payment.workspace.plan}
                </p>
              </div>
            </div>
          </div>

          {/* Gateway & Technical Details */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Key className="size-3.5" />
              Gateway & Technical Info
            </h4>
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 text-xs sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Transaction ID:</span>
                <div className="flex items-center gap-1">
                  <p className="font-mono font-medium text-foreground">{payment.tranId}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-5 shrink-0"
                    onClick={() => copyToClipboard(payment.tranId, "Transaction ID")}
                  >
                    {copiedField === "Transaction ID" ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Validation ID (val_id):</span>
                <p className="font-mono text-foreground">
                  {payment.valId || <span className="italic text-muted-foreground">None</span>}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Session Key / Token:</span>
                <p className="font-mono text-foreground break-all">
                  {payment.sessionKey || <span className="italic text-muted-foreground">None</span>}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Payment Record ID:</span>
                <p className="font-mono text-foreground truncate">{payment.id}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Payment Gateway:</span>
                <p className="font-semibold capitalize text-foreground">{payment.gateway}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              Timestamps
            </h4>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 text-xs">
              <div>
                <span className="text-muted-foreground">Created At:</span>
                <p className="font-medium text-foreground">{formatDate(payment.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Updated At:</span>
                <p className="font-medium text-foreground">{formatDate(payment.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {payment.status === "pending" && (onVerify || onReject) ? (
            <div className="flex gap-2">
              {onReject ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onReject(payment);
                  }}
                >
                  <XCircle className="size-4" />
                  Reject Payment
                </Button>
              ) : null}
              {onVerify ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onVerify(payment);
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  Verify Payment
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
