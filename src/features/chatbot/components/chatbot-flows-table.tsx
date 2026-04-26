"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { ChatbotFlow } from "@/types/chatbot";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ChatbotFlowsTableProps = {
  flows: ChatbotFlow[];
  togglingId: string | null;
  onToggleActive: (flow: ChatbotFlow, active: boolean) => void;
  onEdit: (flow: ChatbotFlow) => void;
  onDelete: (flow: ChatbotFlow) => void;
};

export function ChatbotFlowsTable({
  flows,
  togglingId,
  onToggleActive,
  onEdit,
  onDelete,
}: ChatbotFlowsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Flow</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="tabular-nums">Nodes</TableHead>
          <TableHead className="tabular-nums">Conversations</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flows.map((f) => (
          <TableRow key={f.id}>
            <TableCell>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{f.name}</p>
                {f.description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {f.description}
                  </p>
                ) : null}
                {f.triggerKeywords ? (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    Triggers: {f.triggerKeywords}
                  </p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {f.deviceLabel}
            </TableCell>
            <TableCell>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={f.active}
                  disabled={togglingId === f.id}
                  onChange={(e) => onToggleActive(f, e.target.checked)}
                  aria-label={
                    f.active ? `Deactivate ${f.name}` : `Activate ${f.name}`
                  }
                  className="size-4 rounded border-input text-primary focus:ring-ring/50 disabled:opacity-50"
                />
              </label>
            </TableCell>
            <TableCell className="tabular-nums">{f.nodes.length}</TableCell>
            <TableCell className="tabular-nums">{f.conversationCount}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={() => onEdit(f)}
                  aria-label={`Edit ${f.name}`}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(f)}
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
