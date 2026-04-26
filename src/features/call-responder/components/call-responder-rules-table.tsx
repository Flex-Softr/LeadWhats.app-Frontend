"use client";

import { Trash2 } from "lucide-react";

import type {
  CallResponderCallType,
  CallResponderRule,
} from "@/types/call-responder";
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

function callTypeShort(t: CallResponderCallType) {
  switch (t) {
    case "received":
      return "Received";
    case "outgoing":
      return "Outgoing";
    case "missed":
      return "Missed";
    case "rejected":
      return "Rejected";
    default:
      return t;
  }
}

type CallResponderRulesTableProps = {
  rules: CallResponderRule[];
  onDelete: (rule: CallResponderRule) => void;
};

export function CallResponderRulesTable({
  rules,
  onDelete,
}: CallResponderRulesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Call types</TableHead>
          <TableHead className="tabular-nums">Delay (min)</TableHead>
          <TableHead className="tabular-nums">Responses</TableHead>
          <TableHead className="tabular-nums">Calls today</TableHead>
          <TableHead className="w-[72px] text-right"> </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{r.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {r.messageFormType === "text"
                    ? r.messageBody
                    : r.templateName ?? "Template"}
                </p>
              </div>
            </TableCell>
            <TableCell className="max-w-[180px] truncate text-muted-foreground">
              {r.deviceLabel}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {r.callTypes.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="font-normal text-xs"
                  >
                    {callTypeShort(t)}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="tabular-nums">
              {r.responseDelayMinutes}
            </TableCell>
            <TableCell className="tabular-nums">{r.responsesSent}</TableCell>
            <TableCell className="tabular-nums">{r.callsToday}</TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(r)}
                aria-label={`Delete ${r.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
