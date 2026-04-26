"use client";

import {
  CalendarDays,
  Hash,
  Share2,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import type { GrabbedGroup } from "@/types/group-grabber";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GroupGrabberListProps = {
  rows: GrabbedGroup[];
  selectedIds: Set<string>;
  onToggle: (id: string, on: boolean) => void;
  modeLabel: "Groups" | "Communities";
  onOpenMembers: (group: GrabbedGroup) => void;
};

export function GroupGrabberList({
  rows,
  selectedIds,
  onToggle,
  modeLabel,
  onOpenMembers,
}: GroupGrabberListProps) {
  async function copyJid(jid: string) {
    try {
      await navigator.clipboard.writeText(jid);
      toast.success("Copied group JID");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  async function shareGroup(g: GrabbedGroup) {
    const text = `${g.name}\n${g.jid}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: g.name, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied group details");
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {modeLabel}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {rows.length}{" "}
          {rows.length === 1
            ? modeLabel === "Groups"
              ? "Group"
              : "Community"
            : modeLabel}{" "}
          found
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          No {modeLabel.toLowerCase()} match your filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((g) => (
            <li
              key={g.id}
              className={cn(
                "flex gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50",
                "sm:gap-4 sm:p-5"
              )}
            >
              <div className="flex shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={selectedIds.has(g.id)}
                  onChange={(e) => onToggle(g.id, e.target.checked)}
                  className="size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
                  aria-label={`Select ${g.name}`}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {g.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4 shrink-0 text-slate-400" />
                    {g.participants} Participants
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="size-4 shrink-0 text-slate-400" />
                    <span
                      className={
                        g.role === "admin"
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : ""
                      }
                    >
                      {g.role === "admin" ? "Admin" : "Member"}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 shrink-0 text-slate-400" />
                    Created {g.createdAtLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="max-w-full font-mono text-xs font-normal text-slate-600 dark:text-slate-400"
                  >
                    <span className="truncate">{g.jid}</span>
                  </Badge>
                  {g.linkedParentJid ? (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      Linked community
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-start">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onOpenMembers(g)}
                >
                  <UsersRound className="size-4" />
                  <span className="hidden sm:inline">Members</span>
                </Button>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    aria-label="Share group"
                    onClick={() => void shareGroup(g)}
                  >
                    <Share2 className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    aria-label="Copy JID"
                    onClick={() => void copyJid(g.jid)}
                  >
                    <Hash className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
