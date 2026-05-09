"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  UserPlus,
  Users,
} from "lucide-react";

import { GroupGrabberList } from "@/features/group-grabber/components/group-grabber-list";
import { GroupMembersSheet } from "@/features/group-grabber/components/group-members-sheet";
import { StatCard } from "@/features/shared/components/stat-card";
import type { DevicesListResponse } from "@/types/device";
import type { GrabbedGroup } from "@/types/group-grabber";
import type { GroupGrabberListResponse } from "@/types/group-grabber-api";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
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
import { cn } from "@/lib/utils";

type ViewMode = "groups" | "communities";
type RoleFilter = "all" | "admin" | "member";
type SortKey = "name" | "participants";

function mapApiGroup(row: GroupGrabberListResponse["groups"][number]): GrabbedGroup {
  return {
    id: row.jid,
    jid: row.jid,
    name: row.name,
    kind: row.kind,
    participants: row.participants,
    role: row.role,
    createdAtLabel: row.createdAtLabel,
    linkedParentJid: row.linkedParentJid,
  };
}

function aggregate(groups: GrabbedGroup[]) {
  const totalGroups = groups.filter((g) => g.kind === "group").length;
  const communities = groups.filter((g) => g.kind === "community").length;
  const totalParticipants = groups.reduce((a, g) => a + g.participants, 0);
  const adminGroups = groups.filter((g) => g.role === "admin").length;
  const memberGroups = groups.filter((g) => g.role === "member").length;
  const totalItems = groups.length;
  const avgSize =
    totalItems > 0 ? Math.round(totalParticipants / totalItems) : 0;
  const adminRatio =
    totalItems > 0 ? Math.round((adminGroups / totalItems) * 100) : 0;
  const largest =
    groups.length > 0
      ? Math.max(...groups.map((g) => g.participants))
      : 0;
  return {
    totalGroups,
    communities,
    totalParticipants,
    adminGroups,
    memberGroups,
    avgSize,
    adminRatio,
    largest,
  };
}

function deviceName(name: string | null | undefined): string {
  const safe = (name ?? "").trim();
  return safe || "Unnamed device";
}

export function GroupGrabberClient() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [devices, setDevices] = React.useState<DevicesListResponse["devices"]>(
    []
  );
  const [devicesLoading, setDevicesLoading] = React.useState(true);
  const [deviceId, setDeviceId] = React.useState<string>("");

  const [groups, setGroups] = React.useState<GrabbedGroup[]>([]);
  const [meta, setMeta] = React.useState<{
    bridgeEnabled: boolean;
    deviceConnected: boolean;
    socketOpen: boolean;
    hint: string | null;
  } | null>(null);
  const [groupsLoading, setGroupsLoading] = React.useState(false);

  const [viewMode, setViewMode] = React.useState<ViewMode>("groups");
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [memberSheetGroup, setMemberSheetGroup] =
    React.useState<GrabbedGroup | null>(null);

  const groupsFetchGen = React.useRef(0);

  const loadDevices = React.useCallback(async () => {
    setDevicesLoading(true);
    try {
      const data = await apiJson<DevicesListResponse>("/v1/devices");
      setDevices(data.devices);
      setDeviceId((prev) => {
        if (prev !== "" && data.devices.some((d) => d.id === prev))
          return prev;
        return data.devices[0]?.id ?? "";
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not load devices.";
      toast.error("Devices", { description: msg });
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const loadGroups = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true;
      if (!deviceId) {
        setGroups([]);
        setMeta(null);
        return;
      }
      const gen = (groupsFetchGen.current += 1);
      setGroupsLoading(true);
      try {
        const data = await apiJson<GroupGrabberListResponse>(
          `/v1/group-grabber/devices/${deviceId}/groups`
        );
        if (gen !== groupsFetchGen.current) {
          return;
        }
        setMeta({
          bridgeEnabled: data.bridgeEnabled,
          deviceConnected: data.deviceConnected,
          socketOpen: data.socketOpen,
          hint: data.hint,
        });
        setGroups(data.groups.map(mapApiGroup));
        setSelectedIds(new Set());
        if (!silent) {
          if (data.groups.length > 0) {
            toast.success("Groups refreshed", {
              description: `${data.groups.length} chats from this device.`,
            });
          } else if (data.hint) {
            toast.message("No groups loaded", { description: data.hint });
          } else if (data.socketOpen) {
            toast.message("No groups returned", {
              description:
                "WhatsApp is connected but reported no group chats. If you just linked, wait a few seconds and refresh again.",
            });
          }
        }
      } catch (err) {
        if (gen !== groupsFetchGen.current) {
          return;
        }
        const msg =
          err instanceof ApiError ? err.message : "Could not load groups.";
        if (!silent) {
          toast.error("Group grabber", { description: msg });
        }
        setGroups([]);
        setMeta(null);
      } finally {
        if (gen === groupsFetchGen.current) {
          setGroupsLoading(false);
        }
      }
    },
    [deviceId]
  );

  React.useEffect(() => {
    setDeviceId("");
    setGroups([]);
    setMeta(null);
    setSelectedIds(new Set());
  }, [userId, workspaceId, routeKey]);

  React.useEffect(() => {
    void loadDevices();
  }, [loadDevices, userId, workspaceId, routeKey]);

  React.useEffect(() => {
    void loadGroups({ silent: true });
  }, [loadGroups, userId, workspaceId, routeKey]);

  const stats = React.useMemo(() => aggregate(groups), [groups]);

  const selectedDevice = devices.find((d) => d.id === deviceId);
  const deviceLabel = selectedDevice
    ? `${deviceName(selectedDevice.name)}${selectedDevice.phone ? ` (${selectedDevice.phone})` : ""}`
    : "Session";

  const visible = React.useMemo(() => {
    let list = groups.filter((g) =>
      viewMode === "groups" ? g.kind === "group" : g.kind === "community"
    );
    if (roleFilter === "admin") list = list.filter((g) => g.role === "admin");
    if (roleFilter === "member")
      list = list.filter((g) => g.role === "member");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.jid.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "participants") {
        return b.participants - a.participants;
      }
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [groups, viewMode, roleFilter, search, sortKey]);
  const pagination = usePagination({
    totalItems: visible.length,
    initialPageSize: 10,
  });
  const pagedVisible = pagination.slice(visible);

  function toggleRow(id: string, on: boolean) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(visible.map((r) => r.id)));
  }

  const connectedUi =
    selectedDevice?.status === "connected" && meta?.socketOpen;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          Group Grabber
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          Pull groups your linked WhatsApp session is in, scrape member lists,
          and import numbers into{" "}
          <Link
            href="/contacts"
            className="font-medium text-violet-600 underline dark:text-violet-400"
          >
            Contacts
          </Link>{" "}
          groups for campaigns.
        </p>
      </div>

      <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:p-6">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="gg-device" className="text-sm font-semibold">
              WhatsApp device
            </Label>
            <Select
              value={deviceId}
              onValueChange={(v) => setDeviceId(v ?? "")}
              disabled={devicesLoading || devices.length === 0}
            >
              <SelectTrigger id="gg-device" className="h-11 w-full rounded-xl sm:max-w-md">
                <SelectValue
                  placeholder={
                    devicesLoading ? "Loading…" : "Choose a session…"
                  }
                >
                  {selectedDevice ? deviceName(selectedDevice.name) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {devices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {deviceName(d.name)}
                    {d.phone ? ` · ${d.phone}` : ""} ·{" "}
                    {d.status === "connected" ? "Connected" : "QR ready"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {devices.length === 0 && !devicesLoading ? (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                No devices yet.{" "}
                <Link
                  href="/devices"
                  className="font-medium underline"
                >
                  Add a device
                </Link>{" "}
                and link WhatsApp.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              disabled={!deviceId || groupsLoading}
              onClick={() => void loadGroups({ silent: false })}
            >
              {groupsLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh groups
            </Button>
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                connectedUi
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {connectedUi ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <Smartphone className="size-5 shrink-0 opacity-70" />
              )}
              <span>
                {connectedUi ? "Live session" : "Status"}:{" "}
                <span className="text-slate-800 dark:text-slate-200">
                  {deviceLabel}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {meta?.hint ? (
        <div className="flex gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">Heads up</p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
              {meta.hint}
            </p>
            {!meta.bridgeEnabled ? (
              <p className="mt-2 text-xs opacity-90">
                Server admin: set{" "}
                <code className="rounded bg-amber-200/50 px-1 dark:bg-amber-900/50">
                  WHATSAPP_BRIDGE_ENABLED=true
                </code>{" "}
                for real group sync.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-5">
        <StatCard
          label="Total Groups"
          value={stats.totalGroups}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Communities"
          value={stats.communities}
          icon={Building2}
          accent="violet"
        />
        <StatCard
          label="Total Participants"
          value={stats.totalParticipants}
          icon={UserPlus}
          accent="green"
        />
        <StatCard
          label="Admin Groups"
          value={stats.adminGroups}
          icon={Shield}
          accent="amber"
        />
        <StatCard
          label="Member Groups"
          value={stats.memberGroups}
          icon={Users}
          accent="indigo"
        />
      </div>

      <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
        <CardContent className="p-5 sm:p-6 lg:p-7">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Quick Analytics
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Average group size
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                {stats.avgSize}{" "}
                <span className="text-base font-normal text-slate-500">
                  participants
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Admin ratio
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                {stats.adminRatio}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Largest group
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                {stats.largest}{" "}
                <span className="text-base font-normal text-slate-500">
                  participants
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60">
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col items-start gap-2">
              <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setViewMode("groups")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    viewMode === "groups"
                      ? "bg-violet-100 text-violet-900 shadow-sm dark:bg-violet-500/25 dark:text-violet-100"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  Groups ({stats.totalGroups})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("communities")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    viewMode === "communities"
                      ? "bg-violet-100 text-violet-900 shadow-sm dark:bg-violet-500/25 dark:text-violet-100"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  Communities ({stats.communities})
                </button>
              </div>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-blue-600"
                onClick={selectAllVisible}
                disabled={visible.length === 0}
              >
                Select all visible
              </Button>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 lg:max-w-2xl lg:flex-1">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search groups…"
                  className="h-11 rounded-xl pl-10"
                  aria-label="Search groups"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter((v ?? "all") as RoleFilter)}
              >
                <SelectTrigger className="h-11 w-full shrink-0 rounded-xl sm:w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortKey}
                onValueChange={(v) =>
                  setSortKey((v ?? "name") as SortKey)
                }
              >
                <SelectTrigger className="h-11 w-full shrink-0 rounded-xl sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
            {groupsLoading && groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 className="size-8 animate-spin text-violet-600" />
                <p className="text-sm">Loading groups…</p>
              </div>
            ) : (
              <GroupGrabberList
                rows={pagedVisible}
                selectedIds={selectedIds}
                onToggle={toggleRow}
                modeLabel={viewMode === "groups" ? "Groups" : "Communities"}
                onOpenMembers={setMemberSheetGroup}
              />
            )}
            {!groupsLoading && visible.length > 0 ? (
              <TablePagination {...pagination} className="mt-4 px-0 sm:px-0" />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <GroupMembersSheet
        open={!!memberSheetGroup}
        onOpenChange={(o) => {
          if (!o) setMemberSheetGroup(null);
        }}
        group={memberSheetGroup}
        deviceId={deviceId}
      />
    </div>
  );
}
