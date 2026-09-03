"use client";

import * as React from "react";
import { CheckCircle2, Eye, Loader2, Search, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  listAdminPayments,
  rejectAdminPayment,
  verifyAdminPayment,
} from "@/features/admin/lib/admin-api";
import { PaymentDetailsDialog } from "@/features/admin/components/payment-details-dialog";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import type { AdminPaymentRow } from "@/types/admin-api";
import { ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useControlledPagination } from "@/hooks/use-pagination";

type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusBadge(status: string) {
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

export function AdminPaymentsClient() {
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    PaymentStatus | "all"
  >("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [rows, setRows] = React.useState<AdminPaymentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verifyTarget, setVerifyTarget] =
    React.useState<AdminPaymentRow | null>(null);
  const [rejectTarget, setRejectTarget] =
    React.useState<AdminPaymentRow | null>(null);
  const [detailsTarget, setDetailsTarget] =
    React.useState<AdminPaymentRow | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminPayments({
        page,
        pageSize,
        q: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setRows(data.payments);
      setTotal(data.total);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load payments.";
      toast.error("Payments load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const pagination = useControlledPagination({
    page,
    pageSize,
    totalItems: total,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  });

  async function confirmVerify() {
    if (!verifyTarget) return;
    try {
      const result = await verifyAdminPayment(verifyTarget.id, {
        force: !verifyTarget.valId,
      });
      toast.success(
        result.alreadyPaid ? "Already paid" : "Payment verified",
        {
          description: `${verifyTarget.tranId} marked as paid and workspace upgraded.`,
        }
      );
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not verify payment.";
      toast.error("Verify failed", { description: msg });
      throw err;
    }
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    try {
      await rejectAdminPayment(rejectTarget.id);
      toast.success("Payment rejected", {
        description: `${rejectTarget.tranId} marked as failed.`,
      });
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not reject payment.";
      toast.error("Reject failed", { description: msg });
      throw err;
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Wallet className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Payments</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review gateway transactions and verify or reject pending ones.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setPage(1);
                setStatusFilter((v as PaymentStatus | "all") ?? "all");
              }}
              items={[
                { value: "all", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "failed", label: "Failed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            >
              <SelectTrigger className="w-full min-w-[140px] sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <form
              className="flex w-full max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setSearch(q.trim());
              }}
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tran id or workspace…"
              />
              <Button type="submit" variant="secondary">
                <Search className="size-4" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-sm">Loading payments…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8">
              <ListEmptyState
                icon={Wallet}
                title="No payments found"
                description="Try another status filter or search term."
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-medium font-mono text-xs">
                            {p.tranId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.gateway}
                            {p.valId ? " · has val_id" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{p.workspace.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.workspace.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {p.amount.toFixed(2)} {p.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {p.planId.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge(p.status)}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailsTarget(p)}
                          >
                            <Eye className="size-4" />
                            Details
                          </Button>
                          {p.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setVerifyTarget(p)}
                              >
                                <CheckCircle2 className="size-4" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectTarget(p)}
                              >
                                <XCircle className="size-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t border-border px-4 py-3">
                <TablePagination {...pagination} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentDetailsDialog
        open={!!detailsTarget}
        onOpenChange={(open) => {
          if (!open) setDetailsTarget(null);
        }}
        payment={detailsTarget}
        onVerify={(p) => setVerifyTarget(p)}
        onReject={(p) => setRejectTarget(p)}
      />

      <ConfirmDestructiveDialog
        open={!!verifyTarget}
        onOpenChange={(open) => {
          if (!open) setVerifyTarget(null);
        }}
        title="Verify this payment?"
        description={
          verifyTarget
            ? `Mark “${verifyTarget.tranId}” as paid and upgrade ${verifyTarget.workspace.name} to ${verifyTarget.planId.toUpperCase()}.`
            : null
        }
        confirmLabel="Verify payment"
        destructive={false}
        onConfirm={confirmVerify}
      />

      <ConfirmDestructiveDialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        title="Reject this payment?"
        description={
          rejectTarget
            ? `Mark “${rejectTarget.tranId}” as failed. The workspace plan will not change.`
            : null
        }
        confirmLabel="Reject"
        onConfirm={confirmReject}
      />
    </div>
  );
}
