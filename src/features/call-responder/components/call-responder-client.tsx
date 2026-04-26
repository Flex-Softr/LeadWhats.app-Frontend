"use client";

import * as React from "react";
import {
  Clock,
  MessageSquare,
  Phone,
  PhoneMissed,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { CallResponderRulesTable } from "@/features/call-responder/components/call-responder-rules-table";
import { CreateCallResponderRuleDialog } from "@/features/call-responder/components/create-call-responder-rule-dialog";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";
import { StatCard } from "@/features/shared/components/stat-card";
import type { CallResponderRule } from "@/types/call-responder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RuleFilter = "all" | "active" | "inactive";

export function CallResponderClient() {
  const [rules, setRules] = React.useState<CallResponderRule[]>([]);
  const [deleteTarget, setDeleteTarget] =
    React.useState<CallResponderRule | null>(null);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<RuleFilter>("all");
  const [createOpen, setCreateOpen] = React.useState(false);

  const stats = React.useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.active).length;
    const inactive = total - active;
    const responsesSent = rules.reduce((acc, r) => acc + r.responsesSent, 0);
    const callsToday = rules.reduce((acc, r) => acc + r.callsToday, 0);
    return { total, active, inactive, responsesSent, callsToday };
  }, [rules]);

  const visible = React.useMemo(() => {
    let list = rules;
    if (filter === "active") list = list.filter((r) => r.active);
    if (filter === "inactive") list = list.filter((r) => !r.active);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const body = (r.messageBody ?? "").toLowerCase();
        const tmpl = (r.templateName ?? "").toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.deviceLabel.toLowerCase().includes(q) ||
          body.includes(q) ||
          tmpl.includes(q)
        );
      });
    }
    return list;
  }, [rules, filter, search]);
  const pagination = usePagination({
    totalItems: visible.length,
    initialPageSize: 10,
  });
  const pagedRules = pagination.slice(visible);

  function handleCallLogs() {
    toast.message("Call logs", {
      description: "Wire this to your CDR or session history API.",
    });
  }

  function handleCreated(rule: CallResponderRule) {
    setRules((prev) => [rule, ...prev]);
  }

  function confirmDeleteRule() {
    if (!deleteTarget) return;
    const rule = deleteTarget;
    setRules((prev) => prev.filter((r) => r.id !== rule.id));
    toast.success("Rule removed", {
      description: `“${rule.name}” was removed from this list.`,
    });
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-8 lg:space-y-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              Call Responder
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              Automatically respond to received, outgoing, missed, and rejected
              calls with custom messages or templates.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-950"
              onClick={handleCallLogs}
            >
              <Clock className="size-4" />
              Call Logs
            </Button>
            <Button
              type="button"
              className="h-11 gap-2 bg-blue-600 px-5 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Create Rule
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rules..."
              className="h-11 rounded-xl pl-10"
              aria-label="Search rules"
            />
          </div>
          <Select
            value={filter}
            onValueChange={(v) => setFilter((v ?? "all") as RuleFilter)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl sm:w-[200px]">
              <SelectValue placeholder="All Rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rules</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          <StatCard
            label="Total Rules"
            value={stats.total}
            icon={Phone}
            accent="blue"
          />
          <StatCard
            label="Active Rules"
            value={stats.active}
            icon={Play}
            accent="green"
          />
          <StatCard
            label="Responses Sent"
            value={stats.responsesSent}
            icon={MessageSquare}
            accent="violet"
          />
          <StatCard
            label="Calls Today"
            value={stats.callsToday}
            icon={PhoneMissed}
            accent="red"
          />
        </div>

        <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
          <CardContent className="p-0 sm:rounded-3xl">
            {rules.length === 0 ? (
              <div className="px-6 pb-10 pt-6 sm:px-8">
                <ListEmptyState
                  icon={Phone}
                  title="No call responder rules yet"
                  description="Create your first call responder rule to start automating call responses"
                  className="py-14 sm:py-20"
                />
                <div className="flex justify-center">
                  <Button
                    type="button"
                    className="h-11 gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="size-4" />
                    Create Rule
                  </Button>
                </div>
              </div>
            ) : visible.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                No rules match your search or filter.
              </div>
            ) : (
              <div className="overflow-x-auto p-2 sm:p-4">
                <CallResponderRulesTable
                  rules={pagedRules}
                  onDelete={(r) => setDeleteTarget(r)}
                />
              </div>
            )}
            {visible.length > 0 ? <TablePagination {...pagination} /> : null}
          </CardContent>
        </Card>
      </div>

      <CreateCallResponderRuleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      <ConfirmDestructiveDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Remove call responder rule?"
        description={
          <>
            Remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>{" "}
            from your list?
          </>
        }
        confirmLabel="Remove"
        onConfirm={confirmDeleteRule}
      />
    </>
  );
}
