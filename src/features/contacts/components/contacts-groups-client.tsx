"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Folder,
  FolderPlus,
  Loader2,
  Phone,
  Users,
} from "lucide-react";

import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";

import { ContactGroupsTable } from "@/features/contacts/components/contact-groups-table";
import { CreateGroupDialog } from "@/features/contacts/components/create-group-dialog";
import { EditGroupDialog } from "@/features/contacts/components/edit-group-dialog";
import { useContacts } from "@/features/contacts/contacts-provider";
import type { ContactGroupRecord } from "@/types/contacts";
import { ApiError } from "@/lib/api";
import { StatCard } from "@/features/shared/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/use-pagination";

export function ContactsGroupsClient() {
  const {
    loading,
    groups,
    addGroup,
    renameGroup,
    deleteGroup,
    groupStats,
    globalStats,
    revalidateAllPhones,
  } = useContacts();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editGroup, setEditGroup] = React.useState<ContactGroupRecord | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<ContactGroupRecord | null>(null);

  const g = globalStats();
  const pagination = usePagination({
    totalItems: groups.length,
    initialPageSize: 10,
  });
  const pagedGroups = pagination.slice(groups);

  async function handleNewGroup(name: string) {
    try {
      await addGroup(name);
      toast.success("Group Created", {
        description: "Contact group created successfully!",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not create group.";
      toast.error("Create failed", { description: msg });
      throw err;
    }
  }

  async function handleRevalidateAll() {
    try {
      const out = await revalidateAllPhones();
      const waHint = out.whatsappChecked
        ? " Valid numbers were checked against WhatsApp."
        : " No connected WhatsApp device — only number formatting was normalized. Connect a device and run again to mark who is on WhatsApp.";
      toast.success("Phone numbers revalidated", {
        description:
          out.updated === 0
            ? `No row updates were needed.${waHint}`
            : `Updated ${out.updated} contact record(s).${waHint}`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Revalidation request failed.";
      toast.error("Revalidation failed", { description: msg });
    }
  }

  async function handleSaveEdit(groupId: string, name: string) {
    try {
      await renameGroup(groupId, name);
      toast.success("Group updated", { description: `Renamed to “${name}”.` });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update group.";
      toast.error("Update failed", { description: msg });
      throw err;
    }
  }

  async function confirmDeleteGroup() {
    if (!deleteTarget) return;
    const group = deleteTarget;
    try {
      await deleteGroup(group.id);
      toast.success("Group deleted", {
        description: `Removed “${group.name}”.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not delete group.";
      toast.error("Delete failed", { description: msg });
      throw err;
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 rounded-lg border border-violet-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
            <Folder className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Contact Groups
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Organize contacts for campaigns. Revalidate numbers after
              connecting a WhatsApp device to mark verified contacts.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            className="h-10 rounded-md px-4"
            disabled={loading}
            onClick={() => void handleRevalidateAll()}
          >
            <Phone className="size-4" />
            Revalidate all numbers
          </Button>
          <Button
            type="button"
            className="h-10 rounded-md bg-violet-600 px-4 font-semibold text-white hover:bg-violet-700"
            disabled={loading}
            onClick={() => setCreateOpen(true)}
          >
            <FolderPlus className="size-4" />
            New Group
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Contacts"
          value={g.totalContacts}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Contact Groups"
          value={g.groups}
          icon={Folder}
          accent="slate"
        />
        <StatCard
          label="WhatsApp Verified"
          value={g.verified}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="Unverified"
          value={g.unverified + g.invalid}
          icon={AlertCircle}
          accent="amber"
        />
      </div>

      <Card className="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
              <Loader2 className="size-9 animate-spin text-violet-600 dark:text-violet-400" />
              <p className="text-sm">Loading contact groups…</p>
            </div>
          ) : groups.length === 0 ? (
            <ListEmptyState
              icon={Folder}
              title="No contact groups yet"
              description="Create a group to organize imports and campaigns."
            />
          ) : (
            <ContactGroupsTable
              groups={pagedGroups}
              groupStats={groupStats}
              onDelete={(gr) => setDeleteTarget(gr)}
              onEdit={(gr) => setEditGroup(gr)}
            />
          )}
          {!loading && groups.length > 0 ? <TablePagination {...pagination} /> : null}
        </CardContent>
      </Card>

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(name) => handleNewGroup(name)}
      />

      <EditGroupDialog
        open={editGroup !== null}
        onOpenChange={(open) => {
          if (!open) setEditGroup(null);
        }}
        group={editGroup}
        onSave={handleSaveEdit}
      />

      <ConfirmDestructiveDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete contact group?"
        description={
          <>
            Permanently remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>{" "}
            and all contacts in it from this workspace.
          </>
        }
        confirmLabel="Delete group"
        onConfirm={confirmDeleteGroup}
      />
    </div>
  );
}
