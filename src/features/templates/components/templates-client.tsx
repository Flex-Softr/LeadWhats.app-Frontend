"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
} from "lucide-react";

import { CreateTemplateDialog } from "@/features/templates/components/create-template-dialog";
import { DeleteTemplateDialog } from "@/features/templates/components/delete-template-dialog";
import { TemplateDetailSheet } from "@/features/templates/components/template-detail-sheet";
import { WhatsAppMessagePreview } from "@/features/templates/components/whatsapp-message-preview";
import { messageTemplateApiToRecord } from "@/features/templates/lib/map-template-api";
import { templateCategoryLabel } from "@/features/templates/config/template-categories";
import { TEMPLATE_TYPE_OPTIONS } from "@/features/templates/config/template-type-definitions";
import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import type { MessageTemplateRecord } from "@/types/template";
import type {
  TemplatesListResponse,
  UpdateTemplateResponse,
} from "@/types/templates-api";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function typeLabel(id: MessageTemplateRecord["typeId"]) {
  return TEMPLATE_TYPE_OPTIONS.find((t) => t.id === id)?.label ?? id;
}

export function TemplatesClient() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [templates, setTemplates] = React.useState<MessageTemplateRecord[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] =
    React.useState<MessageTemplateRecord | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<MessageTemplateRecord | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | TemplateTypeId>(
    "all"
  );
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<MessageTemplateRecord | null>(
    null
  );

  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<TemplatesListResponse>("/v1/templates");
      setTemplates(data.templates.map(messageTemplateApiToRecord));
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load templates.";
      toast.error("Load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTemplates();
  }, [loadTemplates, userId, workspaceId, routeKey]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.waTemplateName.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || t.typeId === typeFilter;
      return matchQ && matchType;
    });
  }, [templates, search, typeFilter]);
  const pagination = usePagination({
    totalItems: filtered.length,
    initialPageSize: 9,
  });
  const pagedTemplates = pagination.slice(filtered);

  function handleCreated(t: MessageTemplateRecord) {
    setTemplates((prev) => [t, ...prev]);
    toast.success("Template created", {
      description: `“${t.name}” is ready to use.`,
    });
  }

  function handleUpdated(t: MessageTemplateRecord) {
    setTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)));
    if (selected?.id === t.id) setSelected(t);
    toast.success("Template updated", { description: `“${t.name}” saved.` });
  }

  async function toggleTemplateActive(t: MessageTemplateRecord) {
    const next = !t.active;
    setBusyId(t.id);
    try {
      const data = await apiJson<UpdateTemplateResponse>(
        `/v1/templates/${t.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: next }),
        }
      );
      const rec = messageTemplateApiToRecord(data.template);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? rec : x)));
      if (selected?.id === t.id) setSelected(rec);
      toast.success(next ? "Template activated" : "Template deactivated", {
        description: next
          ? "It appears again in message and campaign pickers."
          : "It’s hidden from pickers until you activate it again.",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update template.";
      toast.error("Update failed", { description: msg });
    } finally {
      setBusyId(null);
    }
  }

  function openDetail(t: MessageTemplateRecord) {
    setSelected(t);
    setDetailOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 rounded-lg border border-violet-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Message Templates
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create reusable WhatsApp layouts for single sends and campaigns.
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="h-10 w-full rounded-md bg-violet-600 px-4 font-semibold text-white hover:bg-violet-700 sm:w-auto"
          onClick={() => {
            setEditingTemplate(null);
            setFormOpen(true);
          }}
          disabled={loading}
        >
          <Plus className="size-4" />
          Create Template
        </Button>
      </div>

      {!loading && templates.length > 0 ? (
        <div className="flex flex-col gap-4 rounded-lg border border-violet-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
            <Label htmlFor="tpl-search" className="sr-only">
              Search templates
            </Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="tpl-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug, or body..."
              className="h-10 rounded-md border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="w-full space-y-1.5 sm:w-52">
            <Label htmlFor="tpl-type-filter" className="text-xs text-slate-500">
              Message type
            </Label>
            <Select
              value={typeFilter}
              onValueChange={(v) =>
                setTypeFilter((v ?? "all") as "all" | TemplateTypeId)
              }
            >
              <SelectTrigger
                id="tpl-type-filter"
                className="h-10 w-full rounded-md"
              >
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TEMPLATE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
              <Loader2 className="size-9 animate-spin text-violet-600 dark:text-violet-400" />
              <p className="text-sm">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <ListEmptyState
              icon={FileText}
              title="No templates yet"
              description="Create your first template to standardize messages across devices and campaigns."
            />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                No matches
              </p>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Try a different search term or set message type to &quot;All
                types&quot;.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 rounded-md"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="grid justify-center gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pagedTemplates.map((t) => (
                <li key={t.id}>
                  <div className="flex h-full flex-col overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                            {t.name}
                          </p>
                          <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                            {t.waTemplateName}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className="rounded-md text-[10px] font-medium"
                          >
                            {typeLabel(t.typeId)}
                          </Badge>
                          {!t.active ? (
                            <Badge
                              variant="secondary"
                              className="rounded-md text-[10px] font-medium text-amber-900 dark:text-amber-200"
                            >
                              Inactive
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDetail(t)}
                        className="flex w-full justify-center rounded-lg bg-violet-50/60 py-4 outline-none transition hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-slate-900/60 dark:hover:bg-slate-900/80"
                      >
                        <WhatsAppMessagePreview
                          compact
                          contactLabel={t.name}
                          body={t.content}
                          footer={t.footer}
                          buttons={t.buttons}
                          typeId={t.typeId}
                          media={t.media}
                        />
                      </button>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <span>{templateCategoryLabel(t.category)}</span>
                        <span className="text-slate-400">
                          Updated {t.updatedAtLabel}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        onClick={() => openDetail(t)}
                      >
                        <Eye className="size-3.5" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        onClick={() => {
                          setEditingTemplate(t);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        disabled={busyId === t.id}
                        onClick={() => void toggleTemplateActive(t)}
                      >
                        {t.active ? (
                          <PowerOff className="size-3.5" />
                        ) : (
                          <Power className="size-3.5" />
                        )}
                        {t.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="rounded-md"
                        onClick={() => setDeleteTarget(t)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && filtered.length > 0 ? (
            <TablePagination {...pagination} className="mt-4 px-0 sm:px-0" />
          ) : null}
        </CardContent>
      </Card>

      <CreateTemplateDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      <DeleteTemplateDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        template={deleteTarget}
        onDelete={async () => {
          if (!deleteTarget) return;
          await apiJson(`/v1/templates/${deleteTarget.id}`, {
            method: "DELETE",
          });
          setTemplates((prev) => prev.filter((x) => x.id !== deleteTarget.id));
          if (selected?.id === deleteTarget.id) {
            setDetailOpen(false);
            setSelected(null);
          }
          toast.success("Template deleted", {
            description: `“${deleteTarget.name}” was removed.`,
          });
        }}
      />

      <TemplateDetailSheet
        template={selected}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
