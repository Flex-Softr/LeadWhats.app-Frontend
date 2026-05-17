"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

import type { GrabbedGroup, GrabbedMember } from "@/types/group-grabber";
import type {
  BulkContactsResponse,
  ContactGroupsListResponse,
  CreateContactGroupResponse,
} from "@/types/contacts-api";
import type { GroupGrabberScrapeResponse } from "@/types/group-grabber-api";
import { ApiError, apiJson } from "@/lib/api";
import { dashboardPath } from "@/config/app-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type GroupMembersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GrabbedGroup | null;
  deviceId: string;
};

/** WhatsApp hides phone for many participants; JID local part is shown so rows stay distinct. */
function shortIdHint(jid: string): string {
  const base = jid.split("@")[0] ?? jid;
  const clean = base.includes(":") ? base.split(":")[0]! : base;
  if (clean.length <= 10) return clean;
  return `…${clean.slice(-10)}`;
}

function displayMemberName(m: GrabbedMember): string {
  const n = m.name.trim();
  if (n && n !== "Contact") return m.name;
  return `Contact (${shortIdHint(m.jid)})`;
}

export function GroupMembersSheet({
  open,
  onOpenChange,
  group,
  deviceId,
}: GroupMembersSheetProps) {
  const [members, setMembers] = React.useState<GrabbedMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedJids, setSelectedJids] = React.useState<Set<string>>(
    () => new Set()
  );
  const [contactGroups, setContactGroups] = React.useState<
    ContactGroupsListResponse["groups"]
  >([]);
  const [groupsLoading, setGroupsLoading] = React.useState(false);
  const [targetGroupId, setTargetGroupId] = React.useState<string>("");
  const [newGroupName, setNewGroupName] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  /** When true, server omits admins — typical for campaigns that should not message group admins. */
  const [excludeGroupAdmins, setExcludeGroupAdmins] = React.useState(true);

  React.useEffect(() => {
    if (!open) {
      setMembers([]);
      setError(null);
      setSelectedJids(new Set());
      setNewGroupName("");
      setTargetGroupId("");
      return;
    }

    setGroupsLoading(true);
    void apiJson<ContactGroupsListResponse>("/v1/contact-groups")
      .then((d) => {
        setContactGroups(d.groups);
        if (d.groups.length > 0) {
          setTargetGroupId((prev) => prev || d.groups[0]!.id);
        }
      })
      .catch(() => {
        toast.error("Could not load contact groups");
      })
      .finally(() => setGroupsLoading(false));
  }, [open]);

  React.useEffect(() => {
    if (!open || !group || !deviceId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMembers([]);
    setSelectedJids(new Set());

    void (async () => {
      try {
        const data = await apiJson<GroupGrabberScrapeResponse>(
          `/v1/group-grabber/devices/${deviceId}/scrape-members`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupJid: group.jid,
              excludeAdmins: excludeGroupAdmins,
            }),
          }
        );
        if (cancelled) return;
        setMembers(data.members);
        const withPhone = new Set(
          data.members.filter((m) => m.phone).map((m) => m.jid)
        );
        setSelectedJids(withPhone);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError ? err.message : "Could not load members.";
        setError(msg);
        toast.error("Scrape failed", { description: msg });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, group?.jid, deviceId, group, excludeGroupAdmins]);

  function toggleJid(jid: string, on: boolean) {
    setSelectedJids((prev) => {
      const n = new Set(prev);
      if (on) n.add(jid);
      else n.delete(jid);
      return n;
    });
  }

  function selectAllWithPhone() {
    setSelectedJids(
      new Set(members.filter((m) => m.phone).map((m) => m.jid))
    );
  }

  function selectNone() {
    setSelectedJids(new Set());
  }

  async function runImport() {
    const picked = members.filter(
      (m) => m.phone && selectedJids.has(m.jid)
    ) as (GrabbedMember & { phone: string })[];
    if (picked.length === 0) {
      toast.error("Select at least one member with a phone number.");
      return;
    }

    const createName = newGroupName.trim();
    let groupId = targetGroupId;

    setImporting(true);
    try {
      if (createName) {
        const created = await apiJson<CreateContactGroupResponse>(
          "/v1/contact-groups",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: createName }),
          }
        );
        groupId = created.group.id;
      }

      if (!groupId) {
        toast.error("Choose a contact group or enter a new group name.");
        return;
      }

      const out = await apiJson<BulkContactsResponse>(
        "/v1/group-grabber/import-members",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetContactGroupId: groupId,
            members: picked.map((m) => ({
              name: m.name,
              phone: m.phone,
            })),
          }),
        }
      );

      toast.success("Import complete", {
        description: `${out.created.length} added, ${out.skipped.length} skipped.`,
      });
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Import failed.";
      toast.error("Import failed", { description: msg });
    } finally {
      setImporting(false);
    }
  }

  const withPhoneCount = members.filter((m) => m.phone).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <SheetHeader className="shrink-0 border-b border-slate-200 px-5 py-4 text-left dark:border-slate-800">
          <SheetTitle className="pr-8">
            {group ? group.name : "Group members"}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {group?.jid}
          </SheetDescription>
          {group?.kind === "community" ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Members are merged from this community and its linked chats. WhatsApp
              often does <strong className="font-medium text-slate-600 dark:text-slate-300">not</strong>{" "}
              expose phone numbers for everyone — many rows show an internal Linked
              ID (<span className="font-mono">@lid</span>) instead, which we cannot
              import as a phone.
            </p>
          ) : null}
        </SheetHeader>

        <div className="shrink-0 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-violet-600 dark:border-slate-600"
              checked={excludeGroupAdmins}
              onChange={(e) => setExcludeGroupAdmins(e.target.checked)}
            />
            <span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Exclude group admins
              </span>
              <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                When enabled, only regular members are listed and can be
                imported. Turn off to include admins.
              </span>
            </span>
          </label>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 className="size-8 animate-spin text-violet-600" />
                <p className="text-sm">Fetching members from WhatsApp…</p>
              </div>
            ) : error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {members.length} members · {withPhoneCount} with a phone on
                    file
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={selectAllWithPhone}
                      disabled={withPhoneCount === 0}
                    >
                      Select with phone
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectNone}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {members.length > 0 && withPhoneCount < members.length ? (
                  <p className="mt-3 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100">
                    <span className="font-semibold">No importable phone: </span>
                    WhatsApp is only exposing an internal Linked ID for those rows
                    (privacy). We never treat that as a phone number. Use a linked
                    discussion group if numbers show up there, or add people as
                    contacts in WhatsApp first.
                  </p>
                ) : null}

                <div className="mt-4 max-h-[min(40vh,320px)] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 sm:max-h-[min(45vh,380px)]">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <thead className="sticky top-0 z-[1] bg-slate-50 text-xs font-medium uppercase text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="w-10 px-3 py-2" />
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Phone</th>
                        <th
                          className="px-3 py-2"
                          title="Admin role in this WhatsApp group"
                        >
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr
                          key={m.jid}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-slate-300"
                              checked={selectedJids.has(m.jid)}
                              disabled={!m.phone}
                              onChange={(e) =>
                                toggleJid(m.jid, e.target.checked)
                              }
                              aria-label={`Select ${displayMemberName(m)}`}
                            />
                          </td>
                          <td
                            className="max-w-[180px] truncate px-3 py-2 font-medium"
                            title={displayMemberName(m)}
                          >
                            {displayMemberName(m)}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {m.phone ? (
                              m.phone
                            ) : (
                              <span className="inline-flex flex-col gap-0.5">
                                <span className="text-amber-700 dark:text-amber-400">
                                  No phone (Linked ID)
                                </span>
                                <span
                                  className="text-[10px] font-normal text-slate-500 dark:text-slate-500"
                                  title={m.jid}
                                >
                                  {shortIdHint(m.jid)}
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {m.isAdmin ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Admin
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">
                                Member
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <UserPlus className="size-4 text-violet-600" />
                    Add to contacts
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Imports use your{" "}
                    <Link
                      href={dashboardPath("/contacts")}
                      className="font-medium text-violet-600 underline dark:text-violet-400"
                    >
                      Contacts
                    </Link>{" "}
                    groups. Duplicates in the same group are skipped.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="gg-target-group">Contact group</Label>
                    <Select
                      value={targetGroupId}
                      onValueChange={(v) => setTargetGroupId(v ?? "")}
                      disabled={groupsLoading || !!newGroupName.trim()}
                    >
                      <SelectTrigger id="gg-target-group" className="w-full">
                        <SelectValue placeholder="Select a group…" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name} ({g.stats.total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gg-new-group">
                      Or create new contact group
                    </Label>
                    <Input
                      id="gg-new-group"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. From — Lead Wave"
                      disabled={importing}
                    />
                    <p className="text-[11px] text-slate-500">
                      If you type a name here, it is created on import and
                      overrides the dropdown.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {!loading && !error ? (
            <div className="shrink-0 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_-4px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
              <Button
                type="button"
                className="h-11 w-full text-base font-semibold"
                disabled={importing || members.length === 0}
                onClick={() => void runImport()}
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  `Import ${selectedJids.size} selected`
                )}
              </Button>
              <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Scroll above to change selection or contact group.
              </p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
