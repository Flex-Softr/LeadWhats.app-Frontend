"use client";

import * as React from "react";
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { AutoReplyRulesTable } from "@/features/auto-reply/components/auto-reply-rules-table";
import { CreateAutoReplyRuleDialog } from "@/features/auto-reply/components/create-auto-reply-rule-dialog";
import { ruleApiToUi } from "@/features/auto-reply/lib/auto-reply-map";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";
import { StatCard } from "@/features/shared/components/stat-card";
import type { AutoReplyRule } from "@/types/auto-reply";
import type {
  AutoReplyRuleMutationResponse,
  AutoReplyRulesListResponse,
} from "@/types/auto-reply-api";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
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

export function AutoReplyClient() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [rules, setRules] = React.useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<RuleFilter>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<AutoReplyRule | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = React.useState<AutoReplyRule | null>(
    null
  );

  const loadRules = React.useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await apiJson<AutoReplyRulesListResponse>(
        "/v1/auto-reply-rules"
      );
      setRules(data.rules.map(ruleApiToUi));
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load rules.";
      toast.error("Load failed", { description: msg });
      setRules([]);
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRules();
  }, [loadRules, userId, workspaceId, routeKey]);

  const stats = React.useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.active).length;
    const inactive = total - active;
    const totalResponses = rules.reduce((acc, r) => acc + r.responseCount, 0);
    return { total, active, inactive, totalResponses };
  }, [rules]);

  const visible = React.useMemo(() => {
    let list = rules;
    if (filter === "active") list = list.filter((r) => r.active);
    if (filter === "inactive") list = list.filter((r) => !r.active);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.keyword.toLowerCase().includes(q) ||
          r.response.toLowerCase().includes(q) ||
          r.deviceLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rules, filter, search]);
  const pagination = usePagination({
    totalItems: visible.length,
    initialPageSize: 10,
  });
  const pagedRules = pagination.slice(visible);

  function openCreate() {
    setEditingRule(null);
    setCreateOpen(true);
  }

  function openEdit(rule: AutoReplyRule) {
    setEditingRule(rule);
    setCreateOpen(true);
  }

  async function handleToggleActive(rule: AutoReplyRule, active: boolean) {
    if (rule.active === active) return;
    setTogglingId(rule.id);
    try {
      await apiJson<AutoReplyRuleMutationResponse>(
        `/v1/auto-reply-rules/${rule.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
        }
      );
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, active } : r))
      );
      toast.success(active ? "Rule enabled" : "Rule disabled", {
        description: `“${rule.name}” is ${active ? "now active" : "turned off"}.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update rule.";
      toast.error("Update failed", { description: msg });
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDeleteRule() {
    if (!deleteTarget) return;
    const rule = deleteTarget;
    try {
      await apiJson(`/v1/auto-reply-rules/${rule.id}`, { method: "DELETE" });
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast.success("Rule removed", { description: `“${rule.name}” deleted.` });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not delete rule.";
      toast.error("Delete failed", { description: msg });
      throw err;
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-8 lg:space-y-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              Auto Reply
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              Each rule stores several keywords (comma / line separated). We load
              active rules in priority order (lowest number first); the first rule
              whose keywords match the message text is the one that runs. Connect
              your bridge for inbound traffic.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 border-blue-200 bg-white px-5 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-950 dark:text-blue-300 dark:hover:bg-blue-950/40"
              disabled={loading || refreshing}
              onClick={() => void loadRules({ silent: true })}
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              type="button"
              className="h-11 gap-2 bg-blue-600 px-5 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              disabled={loading}
              onClick={() => openCreate()}
            >
              <Plus className="size-4" />
              Create rule
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, keyword, response, session…"
              className="h-11 rounded-md pl-10"
              aria-label="Search rules"
            />
          </div>
          <Select
            value={filter}
            onValueChange={(v) => setFilter((v ?? "all") as RuleFilter)}
          >
            <SelectTrigger className="h-11 w-full rounded-sm py-4 sm:w-[200px]">
              <SelectValue placeholder="All rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rules</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          <StatCard
            label="Total rules"
            value={stats.total}
            icon={MessageSquare}
            accent="blue"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={Play}
            accent="green"
          />
          <StatCard
            label="Inactive"
            value={stats.inactive}
            icon={Pause}
            accent="amber"
          />
          <StatCard
            label="Total responses"
            value={stats.totalResponses}
            icon={CheckCircle2}
            accent="violet"
          />
        </div>

        <Card className="rounded-lg border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
          <CardContent className="p-0 sm:rounded-3xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                <Loader2 className="size-9 animate-spin text-violet-600 dark:text-violet-400" />
                <p className="text-sm">Loading rules…</p>
              </div>
            ) : rules.length === 0 ? (
              <div className="px-6 pb-10 pt-6 sm:px-8">
                <ListEmptyState
                  icon={MessageSquare}
                  title="No auto reply rules yet"
                  description="Create a rule with a keyword and reply text. Pick the WhatsApp session that should send the auto-reply."
                  className="py-14 sm:py-20"
                />
                <div className="flex justify-center">
                  <Button
                    type="button"
                    className="h-11 gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                    onClick={() => openCreate()}
                  >
                    <Plus className="size-4" />
                    Create rule
                  </Button>
                </div>
              </div>
            ) : visible.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                No rules match your search or filter.
              </div>
            ) : (
              <div className="overflow-x-auto p-2 sm:p-4">
                <AutoReplyRulesTable
                  rules={pagedRules}
                  togglingId={togglingId}
                  onToggleActive={(r, a) => void handleToggleActive(r, a)}
                  onEdit={openEdit}
                  onDelete={(r) => setDeleteTarget(r)}
                />
              </div>
            )}
            {!loading && visible.length > 0 ? (
              <TablePagination {...pagination} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <CreateAutoReplyRuleDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) setEditingRule(null);
        }}
        editingRule={editingRule}
        onSaved={() => void loadRules({ silent: true })}
      />

      <ConfirmDestructiveDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete auto-reply rule?"
        description={
          <>
            Remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>
            ? This cannot be undone.
          </>
        }
        confirmLabel="Delete rule"
        onConfirm={confirmDeleteRule}
      />
    </>
  );
}
