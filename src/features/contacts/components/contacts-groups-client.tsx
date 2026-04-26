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
    <div className="mx-auto w-full max-w-6xl space-y-8 lg:space-y-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            Contact Groups
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Create and manage contact groups for organized messaging.{" "}
            <span className="text-slate-600 dark:text-slate-300">
              Verified means the number is registered on WhatsApp (use Revalidate
              with a connected device).
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            className="h-11 gap-2 px-5"
            disabled={loading}
            onClick={() => void handleRevalidateAll()}
          >
            <Phone className="size-4" />
            Revalidate all numbers
          </Button>
          <Button
            type="button"
            className="h-11 gap-2 px-5"
            disabled={loading}
            onClick={() => setCreateOpen(true)}
          >
            <FolderPlus className="size-4" />
            New Group
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
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

      <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
        <CardContent className="p-0 pt-2 sm:rounded-3xl">
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
