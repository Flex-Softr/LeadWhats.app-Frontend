"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import { AddContactDialog } from "@/features/contacts/components/add-contact-dialog";
import { DeleteContactDialog } from "@/features/contacts/components/delete-contact-dialog";
import { EditContactDialog } from "@/features/contacts/components/edit-contact-dialog";
import { ImportContactsFileDialog } from "@/features/contacts/components/import-contacts-file-dialog";
import { formatSkippedSummary } from "@/features/contacts/lib/import-skip-summary";
import {
  downloadContactImportDemoCsv,
  downloadContactImportDemoXlsx,
} from "@/features/contacts/lib/download-import-demo";
import { PasteContactsDialog } from "@/features/contacts/components/paste-contacts-dialog";
import { usePathname } from "next/navigation";

import { useContacts } from "@/features/contacts/contacts-provider";
import type {
  ContactGroupRecord,
  ContactRow,
  ContactRowStatus,
} from "@/types/contacts";
import { ApiError, apiFetch } from "@/lib/api";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { StatCard } from "@/features/shared/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { usePagination } from "@/hooks/use-pagination";

type GroupDetailClientProps = {
  groupId: string;
};

export function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const pathname = usePathname();
  const {
    groups,
    contactsForGroup,
    groupStats,
    ensureGroupContacts,
    addContact,
    bulkAddContacts,
    importContactLines,
    updateContact,
    deleteContact,
    removeInvalidInGroup,
    revalidateGroupPhones,
  } = useContacts();
  const [detailLoading, setDetailLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [loadedGroup, setLoadedGroup] =
    React.useState<ContactGroupRecord | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [fileImportOpen, setFileImportOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ContactRow | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<ContactRow | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [exportingFormat, setExportingFormat] = React.useState<
    "csv" | "xlsx" | null
  >(null);
  const [revalidating, setRevalidating] = React.useState(false);
  const [selectedContactIds, setSelectedContactIds] = React.useState<Set<string>>(
    () => new Set()
  );

  const groupFromList = groups.find((g) => g.id === groupId);
  const group = loadedGroup?.id === groupId ? loadedGroup : groupFromList ?? null;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setLoadError(null);
      setLoadedGroup(null);
      try {
        const rec = await ensureGroupContacts(groupId);
        if (!cancelled) {
          setLoadedGroup(rec);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError ? err.message : "Could not load group.";
          setLoadError(msg);
          toast.error("Load failed", { description: msg });
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ensureGroupContacts, groupId, pathname]);

  const rows = contactsForGroup(groupId);
  const stats = groupStats(groupId);

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const contactPagination = usePagination({
    totalItems: filtered.length,
    initialPageSize: 10,
    siblingCount: 1,
  });

  const pagedContacts = contactPagination.slice(filtered);
  const selectedContacts = React.useMemo(
    () => rows.filter((r) => selectedContactIds.has(r.id)),
    [rows, selectedContactIds]
  );
  const selectedCount = selectedContacts.length;
  const visibleContactIds = React.useMemo(
    () => pagedContacts.map((r) => r.id),
    [pagedContacts]
  );
  const visibleSelectedCount = visibleContactIds.filter((id) =>
    selectedContactIds.has(id)
  ).length;
  const allVisibleSelected =
    visibleContactIds.length > 0 && visibleSelectedCount === visibleContactIds.length;

  React.useEffect(() => {
    const validIds = new Set(rows.map((r) => r.id));
    setSelectedContactIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  function toggleContactSelection(contactId: string, checked: boolean) {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(contactId);
      } else {
        next.delete(contactId);
      }
      return next;
    });
  }

  function toggleVisibleSelection(checked: boolean) {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      for (const id of visibleContactIds) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  function selectAllFilteredContacts() {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      for (const contact of filtered) {
        next.add(contact.id);
      }
      return next;
    });
  }

  function clearSelectedContacts() {
    setSelectedContactIds(new Set());
  }

  function exportContacts(format: "csv" | "xlsx") {
    if (rows.length === 0) {
      toast.warning("No contacts to export");
      return;
    }

    const exportSelected = selectedCount > 0;
    const contactIds = exportSelected
      ? selectedContacts.map((contact) => contact.id)
      : undefined;

    setExportingFormat(format);
    void downloadContactExport(groupId, {
      format,
      contactIds,
      fallbackFilename: buildExportFilename(group?.name ?? "contacts", format),
    })
      .then(() => {
        toast.success(`${format.toUpperCase()} exported`, {
          description: exportSelected
            ? `${selectedCount} selected contact(s) downloaded.`
            : `${rows.length} contact(s) downloaded.`,
        });
      })
      .catch((err) => {
        const msg =
          err instanceof ApiError
            ? err.message
            : `Could not create the ${format.toUpperCase()} file.`;
        toast.error("Export failed", {
          description: msg,
        });
      })
      .finally(() => setExportingFormat(null));
  }

  if (!detailLoading && !group) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-5 rounded-lg border border-border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-[15px] text-muted-foreground">
          {loadError ?? "This group could not be found."}
        </p>
        <Link
          href="/contacts"
          className="cursor-pointer text-sm font-medium text-primary hover:underline"
        >
          Back to groups
        </Link>
      </div>
    );
  }

  const titleName = group?.name ?? "…";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-7">
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <Link
          href="/contacts"
          className="inline-flex cursor-pointer items-center text-sm font-semibold text-foreground hover:text-foreground dark:text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to groups
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {detailLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-6 animate-spin text-foreground dark:text-muted-foreground" />
                  Loading...
                </span>
              ) : (
                titleName
              )}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage contacts, import from CSV/XLSX (use the demo files as a
              template), export selected rows, and revalidate WhatsApp
              availability from one place.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              type="button"
              className="h-10 rounded-md bg-primary px-4 font-semibold text-white hover:bg-primary/90"
              disabled={detailLoading || !group}
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-4"
              disabled={detailLoading || !group}
              onClick={() => setPasteOpen(true)}
            >
              <Clipboard className="size-4" />
              Paste
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-4"
              disabled={detailLoading || !group}
              onClick={() => setFileImportOpen(true)}
            >
              <FileUp className="size-4" />
              Import
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-4"
              disabled={detailLoading || !group}
              onClick={() => {
                try {
                  downloadContactImportDemoCsv();
                  toast.success("Demo CSV downloaded", {
                    description:
                      "Includes Name, Phone, and Status sample rows.",
                  });
                } catch {
                  toast.error("Could not download demo CSV");
                }
              }}
            >
              <Download className="size-4" />
              Download demo CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-4"
              disabled={detailLoading || !group}
              onClick={() => {
                try {
                  downloadContactImportDemoXlsx();
                  toast.success("Demo XLSX downloaded", {
                    description:
                      "Includes Name, Phone, and Status sample rows.",
                  });
                } catch {
                  toast.error("Could not download demo XLSX");
                }
              }}
            >
              <FileSpreadsheet className="size-4" />
              Download demo XLSX
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4"
            disabled={detailLoading || !group || revalidating}
            onClick={() =>
              void (async () => {
                setRevalidating(true);
                try {
                  const out = await revalidateGroupPhones(groupId);
                  const waHint = out.whatsappChecked
                    ? " Valid numbers checked on WhatsApp."
                    : " No connected device - formatting only. Connect WhatsApp and run again to verify.";
                  toast.success("Numbers revalidated", {
                    description:
                      out.updated === 0
                        ? `No row updates in this group.${waHint}`
                        : `Updated ${out.updated} contact record(s).${waHint}`,
                  });
                } catch (err) {
                  const msg =
                    err instanceof ApiError
                      ? err.message
                      : "Could not revalidate numbers.";
                  toast.error("Revalidation failed", { description: msg });
                } finally {
                  setRevalidating(false);
                }
              })()
            }
          >
            {revalidating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Phone className="size-4" />
            )}
            {revalidating ? "Revalidating…" : "Revalidate numbers"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-10 rounded-md px-4"
            disabled={detailLoading || !group}
            onClick={() =>
              void (async () => {
                try {
                  const n = await removeInvalidInGroup(groupId);
                  toast.success("Invalid contacts removed", {
                    description:
                      n === 0
                        ? "No invalid rows in this group."
                        : `Deleted ${n} invalid row(s).`,
                  });
                } catch (err) {
                  const msg =
                    err instanceof ApiError
                      ? err.message
                      : "Could not remove invalid contacts.";
                  toast.error("Request failed", { description: msg });
                }
              })()
            }
          >
            <Trash2 className="size-4" />
            Delete invalid
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Contacts"
          value={stats.total}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="Unverified"
          value={stats.unverified}
          icon={AlertCircle}
          accent="amber"
        />
        <StatCard
          label="Invalid"
          value={stats.invalid}
          icon={XCircle}
          accent="red"
        />
      </div>

      <Card className="overflow-hidden rounded-lg border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-slate-100 bg-slate-50/60 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold sm:text-lg">
              Contacts in {titleName}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedCount > 0
                ? `${selectedCount} selected — export downloads those rows.`
                : "Export downloads the full group, or select rows first."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-md sm:w-60"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v ?? "all")}
              items={[
                { value: "all", label: "All Status" },
                { value: "verified", label: "Verified" },
                { value: "unverified", label: "Unverified" },
                { value: "invalid", label: "Invalid" },
              ]}
            >
              <SelectTrigger className="h-10 w-full rounded-md sm:w-[155px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-md px-3"
                disabled={rows.length === 0 || exportingFormat !== null}
                onClick={() => exportContacts("csv")}
              >
                {exportingFormat === "csv" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Export CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-md px-3"
                disabled={rows.length === 0 || exportingFormat !== null}
                onClick={() => exportContacts("xlsx")}
              >
                {exportingFormat === "xlsx" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-4" />
                )}
                Export XLSX
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
              <Loader2 className="size-8 animate-spin text-foreground dark:text-muted-foreground" />
              <p className="text-sm">Loading contacts…</p>
            </div>
          ) : filtered.length === 0 ? (
            <ListEmptyState
              icon={Users}
              title={
                rows.length === 0
                  ? `No contacts in this group`
                  : "No matching contacts"
              }
              description={
                rows.length === 0
                  ? "Get started by adding contacts to this group."
                  : "Try adjusting search or status filter."
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-slate-100 bg-white px-5 py-3 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span>
                  {selectedCount === 0
                    ? "No contacts selected"
                    : `${selectedCount} contact(s) selected`}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-md px-2 text-xs"
                    disabled={filtered.length === 0}
                    onClick={selectAllFilteredContacts}
                  >
                    Select all filtered
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-md px-2 text-xs"
                    disabled={selectedCount === 0}
                    onClick={clearSelectedContacts}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-900/60">
                    <TableHead className="w-11">
                      <SelectionCheckbox
                        checked={allVisibleSelected}
                        indeterminate={
                          visibleSelectedCount > 0 && !allVisibleSelected
                        }
                        ariaLabel="Select visible contacts"
                        onCheckedChange={toggleVisibleSelection}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedContacts.map((r) => (
                    <TableRow
                      key={r.id}
                      data-state={selectedContactIds.has(r.id) ? "selected" : undefined}
                      className="hover:bg-muted/50 dark:hover:bg-muted/50"
                    >
                      <TableCell>
                        <SelectionCheckbox
                          checked={selectedContactIds.has(r.id)}
                          ariaLabel={`Select ${r.name}`}
                          onCheckedChange={(checked) =>
                            toggleContactSelection(r.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium">
                        {r.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">
                        {r.phone}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
                            aria-label={`Edit ${r.name}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditRow(r);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-md text-muted-foreground hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/30"
                            aria-label={`Delete ${r.name}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteRow(r);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination {...contactPagination} />
            </>
          )}
        </CardContent>
      </Card>

      {group ? (
        <>
          <AddContactDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            groupName={group.name}
            onAdd={async (input) => {
              try {
                await addContact(groupId, input);
                toast.success("Contact added", {
                  description: `${input.name} · ${input.phone.trim()}`,
                });
              } catch (err) {
                const msg =
                  err instanceof ApiError ? err.message : "Could not add contact.";
                toast.error("Add failed", { description: msg });
                throw err;
              }
            }}
          />
          <PasteContactsDialog
            open={pasteOpen}
            onOpenChange={setPasteOpen}
            groupName={group.name}
            onPaste={async (lines) => {
              try {
                const out = await bulkAddContacts(groupId, lines);
                const skippedN = out.skipped.length;
                const addedN = out.created.length;
                if (addedN === 0 && skippedN > 0) {
                  toast.warning("Nothing was imported", {
                    description: `All ${skippedN} row(s) were skipped. Open details below.`,
                  });
                } else {
                  toast.success("Import finished", {
                    description: `Added ${addedN}. Skipped ${skippedN}.`,
                  });
                }
                if (skippedN > 0) {
                  toast.message("Skip details", {
                    description: formatSkippedSummary(out.skipped),
                    duration: 14_000,
                  });
                }
              } catch (err) {
                const msg =
                  err instanceof ApiError
                    ? err.message
                    : "Bulk import failed.";
                toast.error("Import failed", { description: msg });
                throw err;
              }
            }}
          />
          <ImportContactsFileDialog
            open={fileImportOpen}
            onOpenChange={setFileImportOpen}
            groupName={group.name}
            onImport={async (lines) => {
              try {
                const out = await importContactLines(groupId, lines);
                const skippedN = out.skipped.length;
                const addedN = out.created;
                if (addedN === 0 && skippedN > 0) {
                  toast.warning("Nothing was imported", {
                    description: `All ${skippedN} row(s) were skipped. Open details below.`,
                  });
                } else {
                  toast.success("File import finished", {
                    description: `Added ${addedN}. Skipped ${skippedN}.`,
                  });
                }
                if (skippedN > 0) {
                  toast.message("Skip details", {
                    description: formatSkippedSummary(out.skipped),
                    duration: 14_000,
                  });
                }
              } catch (err) {
                const msg =
                  err instanceof ApiError
                    ? err.message
                    : "File import failed.";
                toast.error("Import failed", { description: msg });
                throw err;
              }
            }}
          />
          <EditContactDialog
            open={editRow !== null}
            onOpenChange={(o) => {
              if (!o) setEditRow(null);
            }}
            groupName={group.name}
            contact={editRow}
            onSave={async (input) => {
              if (!editRow) return;
              try {
                await updateContact(groupId, editRow.id, input);
                toast.success("Contact updated");
              } catch (err) {
                const msg =
                  err instanceof ApiError
                    ? err.message
                    : "Could not update contact.";
                toast.error("Update failed", { description: msg });
                throw err;
              }
            }}
          />
          <DeleteContactDialog
            open={deleteRow !== null}
            onOpenChange={(o) => {
              if (!o) setDeleteRow(null);
            }}
            groupName={group.name}
            contact={deleteRow}
            onDelete={async () => {
              if (!deleteRow) return;
              try {
                await deleteContact(groupId, deleteRow.id);
                toast.success("Contact removed");
              } catch (err) {
                const msg =
                  err instanceof ApiError
                    ? err.message
                    : "Could not delete contact.";
                toast.error("Delete failed", { description: msg });
                throw err;
              }
            }}
          />
        </>
      ) : null}
    </div>
  );
}

type SelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  ariaLabel: string;
  onCheckedChange: (checked: boolean) => void;
};

function SelectionCheckbox({
  checked,
  indeterminate = false,
  ariaLabel,
  onCheckedChange,
}: SelectionCheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-label={ariaLabel}
      onChange={(event) => onCheckedChange(event.currentTarget.checked)}
      className="size-4 cursor-pointer rounded border-slate-300 accent-primary"
    />
  );
}

function buildExportFilename(groupName: string, extension: "csv" | "xlsx") {
  const slug =
    groupName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "contacts";
  return `${slug}-contacts.${extension}`;
}

async function downloadContactExport(
  groupId: string,
  input: {
    format: "csv" | "xlsx";
    contactIds?: string[];
    fallbackFilename: string;
  }
) {
  const res = await apiFetch(`/v1/contact-groups/${groupId}/contacts/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      format: input.format,
      ...(input.contactIds && input.contactIds.length > 0
        ? { contactIds: input.contactIds }
        : {}),
    }),
  });

  if (!res.ok) {
    throw await parseExportError(res);
  }

  const blob = await res.blob();
  downloadBlob(blob, filenameFromResponse(res) ?? input.fallbackFilename);
}

async function parseExportError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    return new ApiError(
      res.status,
      body.error?.message ?? res.statusText,
      body.error?.code
    );
  } catch {
    return new ApiError(res.status, res.statusText);
  }
}

function filenameFromResponse(res: Response): string | null {
  const header = res.headers.get("Content-Disposition");
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: ContactRowStatus }) {
  if (status === "verified") {
    return (
      <Badge className="rounded-md border-emerald-200 bg-emerald-50 font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Verified
      </Badge>
    );
  }
  if (status === "unverified") {
    return (
      <Badge className="rounded-md border-amber-200 bg-amber-50 font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Unverified
      </Badge>
    );
  }
  return (
    <Badge className="rounded-md border-red-200 bg-red-50 font-medium text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      Invalid
    </Badge>
  );
}
