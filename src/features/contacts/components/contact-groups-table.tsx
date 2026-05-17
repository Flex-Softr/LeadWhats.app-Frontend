"use client";

import Link from "next/link";
import { Folder, Pencil, Trash2 } from "lucide-react";

import type { ContactGroupRecord } from "@/types/contacts";
import { dashboardPath } from "@/config/app-routes";
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
        <TableRow>
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
            <TableRow key={g.id}>
              <TableCell>
                <Link
                  href={`${dashboardPath("/contacts")}/${g.id}`}
                  className="flex cursor-pointer items-start gap-2 rounded-md text-left font-medium text-primary hover:underline"
                >
                  <Folder className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <span className="min-w-0">
                    <span className="block text-foreground">{g.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Created {g.createdAtLabel}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {s.total} contacts
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="border-emerald-200 bg-emerald-50 font-normal text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  {s.verified}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="border-amber-200 bg-amber-50 font-normal text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {s.unverified}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label={`Edit ${g.name}`}
                    onClick={() => onEdit(g)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
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
