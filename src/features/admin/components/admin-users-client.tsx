"use client";

import * as React from "react";
import {
  Loader2,
  MoreHorizontal,
  Search,
  ShieldBan,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  blockAdminUser,
  deleteAdminManagedUser,
  listAdminUsers,
  setAdminManagedUserRole,
  unblockAdminUser,
} from "@/features/admin/lib/admin-api";
import { CreateAdminUserDialog } from "@/features/admin/components/create-admin-user-dialog";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";
import { ListEmptyState } from "@/features/shared/components/list-empty-state";
import { useAuth } from "@/components/providers/auth-provider";
import type { AdminUserRow } from "@/types/admin-api";
import { ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminUsersClient() {
  const { user: me } = useAuth();
  const [q, setQ] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [rows, setRows] = React.useState<AdminUserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [blockTarget, setBlockTarget] = React.useState<AdminUserRow | null>(
    null
  );
  const [unblockTarget, setUnblockTarget] =
    React.useState<AdminUserRow | null>(null);
  const [makeAdminTarget, setMakeAdminTarget] =
    React.useState<AdminUserRow | null>(null);
  const [removeAdminTarget, setRemoveAdminTarget] =
    React.useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUserRow | null>(
    null
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminUsers({
        page,
        pageSize,
        q: search || undefined,
      });
      setRows(data.users);
      setTotal(data.total);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load users.";
      toast.error("Users load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

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

  async function confirmBlock() {
    if (!blockTarget) return;
    try {
      await blockAdminUser(blockTarget.id);
      toast.success("User blocked", {
        description: `${blockTarget.email} can no longer sign in.`,
      });
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not block user.";
      toast.error("Block failed", { description: msg });
      throw err;
    }
  }

  async function confirmUnblock() {
    if (!unblockTarget) return;
    try {
      await unblockAdminUser(unblockTarget.id);
      toast.success("User unblocked", {
        description: `${unblockTarget.email} can sign in again.`,
      });
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not unblock user.";
      toast.error("Unblock failed", { description: msg });
      throw err;
    }
  }

  async function confirmMakeAdmin() {
    if (!makeAdminTarget) return;
    try {
      await setAdminManagedUserRole(makeAdminTarget.id, "ADMIN");
      toast.success("Admin added", {
        description: `${makeAdminTarget.email} is now a platform admin.`,
      });
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not promote user.";
      toast.error("Promote failed", { description: msg });
      throw err;
    }
  }

  async function confirmRemoveAdmin() {
    if (!removeAdminTarget) return;
    try {
      await setAdminManagedUserRole(removeAdminTarget.id, "CUSTOMER");
      toast.success("Admin removed", {
        description: `${removeAdminTarget.email} is now a customer.`,
      });
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not demote admin.";
      toast.error("Demote failed", { description: msg });
      throw err;
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAdminManagedUser(deleteTarget.id);
      toast.success("User deleted", {
        description: `${deleteTarget.email} and sole-owned workspaces were removed.`,
      });
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not delete user.";
      toast.error("Delete failed", { description: msg });
      throw err;
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Users</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add users or admins, change roles, block access, or remove
                accounts.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="size-4" />
              Add user
            </Button>
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
                placeholder="Search email or name…"
                className="bg-background"
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
              <p className="text-sm">Loading users…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8">
              <ListEmptyState
                icon={Users}
                title="No users found"
                description="Try a different search, or add a new user."
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workspaces</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => {
                    const isSelf = me?.id === u.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {u.name || "—"}
                              {isSelf ? (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                  (you)
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.role === "ADMIN"
                                ? "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
                                : undefined
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.blockedAt ? (
                            <Badge className="border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                              Blocked
                            </Badge>
                          ) : (
                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px] space-y-1">
                            {u.workspaces.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                None
                              </span>
                            ) : (
                              u.workspaces.map((ws) => (
                                <p
                                  key={ws.id}
                                  className="truncate text-xs text-muted-foreground"
                                >
                                  {ws.name} · {ws.plan}
                                </p>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    aria-label={`Actions for ${u.email}`}
                                  />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {u.role === "CUSTOMER" ? (
                                  <DropdownMenuItem
                                    onClick={() => setMakeAdminTarget(u)}
                                  >
                                    <ShieldPlus className="size-4" />
                                    Make admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => setRemoveAdminTarget(u)}
                                  >
                                    <ShieldMinus className="size-4" />
                                    Remove admin
                                  </DropdownMenuItem>
                                )}
                                {u.role === "CUSTOMER" ? (
                                  u.blockedAt ? (
                                    <DropdownMenuItem
                                      onClick={() => setUnblockTarget(u)}
                                    >
                                      <ShieldCheck className="size-4" />
                                      Unblock
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => setBlockTarget(u)}
                                    >
                                      <ShieldBan className="size-4" />
                                      Block
                                    </DropdownMenuItem>
                                  )
                                ) : null}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteTarget(u)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete user
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="border-t border-border px-4 py-3">
                <TablePagination {...pagination} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateAdminUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />

      <ConfirmDestructiveDialog
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null);
        }}
        title="Block this user?"
        description={
          blockTarget
            ? `“${blockTarget.email}” will be signed out and cannot log in until unblocked.`
            : null
        }
        confirmLabel="Block user"
        onConfirm={confirmBlock}
      />

      <ConfirmDestructiveDialog
        open={!!unblockTarget}
        onOpenChange={(open) => {
          if (!open) setUnblockTarget(null);
        }}
        title="Unblock this user?"
        description={
          unblockTarget
            ? `Restore sign-in access for “${unblockTarget.email}”.`
            : null
        }
        confirmLabel="Unblock"
        destructive={false}
        onConfirm={confirmUnblock}
      />

      <ConfirmDestructiveDialog
        open={!!makeAdminTarget}
        onOpenChange={(open) => {
          if (!open) setMakeAdminTarget(null);
        }}
        title="Make this user an admin?"
        description={
          makeAdminTarget
            ? `“${makeAdminTarget.email}” will get the platform admin dashboard and ops access.`
            : null
        }
        confirmLabel="Make admin"
        destructive={false}
        onConfirm={confirmMakeAdmin}
      />

      <ConfirmDestructiveDialog
        open={!!removeAdminTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveAdminTarget(null);
        }}
        title="Remove admin access?"
        description={
          removeAdminTarget
            ? `“${removeAdminTarget.email}” will become a customer and lose admin dashboard access.`
            : null
        }
        confirmLabel="Remove admin"
        onConfirm={confirmRemoveAdmin}
      />

      <ConfirmDestructiveDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this user?"
        description={
          deleteTarget
            ? `Permanently delete “${deleteTarget.email}” and any workspaces they alone own. This cannot be undone.`
            : null
        }
        confirmLabel="Delete user"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
