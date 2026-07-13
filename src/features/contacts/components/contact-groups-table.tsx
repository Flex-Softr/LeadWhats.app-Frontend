"use client";

import Link from "next/link";
import { Folder, Pencil, Trash2 } from "lucide-react";

import type { ContactGroupRecord } from "@/types/contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContactGroupsTableProps = {
  groups: ContactGroupRecord[];
  groupStats: (id: string) => {
    total: number;
    verified: number;
    unverified: number;
    invalid: number;
  };
  onDelete: (group: ContactGroupRecord) => void;
  onEdit: (group: ContactGroupRecord) => void;
};

export function ContactGroupsTable({
  groups,
  groupStats,
  onDelete,
  onEdit,
}: ContactGroupsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-900/60">
          <TableHead>Group</TableHead>
          <TableHead>Total Contacts</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Unverified</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((g) => {
          const s = groupStats(g.id);
          return (
            <TableRow key={g.id} className="hover:bg-violet-50/45 dark:hover:bg-violet-950/20">
              <TableCell>
                <Link
                  href={`/contacts/${g.id}`}
                  className="flex cursor-pointer items-start gap-3 rounded-md text-left font-medium text-primary"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
                    <Folder className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">{g.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Created {g.createdAtLabel}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="rounded-md font-medium">
                  {s.total} contacts
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="rounded-md border-emerald-200 bg-emerald-50 font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  {s.verified}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="rounded-md border-amber-200 bg-amber-50 font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {s.unverified}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-md text-muted-foreground hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/30"
                    aria-label={`Edit ${g.name}`}
                    onClick={() => onEdit(g)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-md text-muted-foreground hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/30"
                    aria-label={`Delete ${g.name}`}
                    onClick={() => onDelete(g)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
