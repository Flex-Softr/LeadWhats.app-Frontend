"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
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
import { PasteContactsDialog } from "@/features/contacts/components/paste-contacts-dialog";
import { usePathname } from "next/navigation";

import { useContacts } from "@/features/contacts/contacts-provider";
import type { ContactRow, ContactRowStatus } from "@/types/contacts";
import { ApiError } from "@/lib/api";
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
  const [addOpen, setAddOpen] = React.useState(false);
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [fileImportOpen, setFileImportOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<ContactRow | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<ContactRow | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const group = groups.find((g) => g.id === groupId);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        await ensureGroupContacts(groupId);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiError ? err.message : "Could not load group.";
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

  if (!detailLoading && !group) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-5 py-12 sm:py-16">
        <p className="text-[15px] text-muted-foreground">
          This group could not be found.
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
    <div className="mx-auto w-full max-w-6xl space-y-8 lg:space-y-10">
      <div>
        <Link
          href="/contacts"
          className="inline-flex cursor-pointer items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Groups
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {detailLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-6 animate-spin text-violet-600 dark:text-violet-400" />
              Loading…
            </span>
          ) : (
            titleName
          )}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          Manage contacts in this group.{" "}
          <span className="text-slate-600 dark:text-slate-300">
            Revalidate normalizes numbers and, with a connected WhatsApp device,
            marks Verified when the account exists on WhatsApp.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={detailLoading || !group}
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          Manual Add
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={detailLoading || !group}
          onClick={() => setPasteOpen(true)}
        >
          <Clipboard className="size-4" />
          Copy/Paste
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={detailLoading || !group}
          onClick={() => setFileImportOpen(true)}
        >
          <FileUp className="size-4" />
          Import file
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={detailLoading || !group}
          onClick={() =>
            void (async () => {
              try {
                const out = await revalidateGroupPhones(groupId);
                const waHint = out.whatsappChecked
                  ? " Valid numbers checked on WhatsApp."
                  : " No connected device — formatting only. Connect WhatsApp and run again to verify.";
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
              }
            })()
          }
        >
          <Phone className="size-4" />
          Revalidate numbers
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="h-11 gap-2 px-4"
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
          Delete Invalid
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
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

      <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
        <CardHeader className="flex flex-col gap-4 space-y-0 border-b px-5 py-5 sm:px-6 sm:py-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h3 className="text-base font-semibold sm:text-lg">
            Contacts in {titleName}
          </h3>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 sm:w-60"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v ?? "all")}
            >
              <SelectTrigger className="h-11 w-full sm:w-[155px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
              <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
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
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="font-mono text-sm">{r.phone}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground"
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
                            className="text-muted-foreground hover:text-destructive"
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

function StatusBadge({ status }: { status: ContactRowStatus }) {
  if (status === "verified") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 font-normal text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Verified
      </Badge>
    );
  }
  if (status === "unverified") {
    return (
      <Badge className="border-amber-200 bg-amber-50 font-normal text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Unverified
      </Badge>
    );
  }
  return (
    <Badge className="border-red-200 bg-red-50 font-normal text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      Invalid
    </Badge>
  );
}
