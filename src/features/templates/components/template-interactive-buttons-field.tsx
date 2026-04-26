"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";

import { INTERACTIVE_BUTTON_MENU_OPTIONS } from "@/features/templates/config/interactive-button-options";
import type { TemplateInteractiveButton } from "@/types/template";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

const DEFAULT_MAX = 5;

type TemplateInteractiveButtonsFieldProps = {
  buttons: TemplateInteractiveButton[];
  onChange: (buttons: TemplateInteractiveButton[]) => void;
  maxButtons?: number;
  heading?: string;
  emptyHint?: string;
};

export function TemplateInteractiveButtonsField({
  buttons,
  onChange,
  maxButtons = DEFAULT_MAX,
  heading = "Interactive buttons",
  emptyHint = "Combine quick replies, URLs, phone actions, and copy‑to‑clipboard.",
}: TemplateInteractiveButtonsFieldProps) {
  const idSeq = React.useRef(0);

  function addButton(kind: TemplateInteractiveButton["kind"]) {
    if (buttons.length >= maxButtons) return;
    const def = INTERACTIVE_BUTTON_MENU_OPTIONS.find((o) => o.kind === kind);
    idSeq.current += 1;
    onChange([
      ...buttons,
      {
        id: `btn_${idSeq.current}`,
        kind,
        label: def?.defaultLabel ?? "Button",
      },
    ]);
  }

  function removeButton(id: string) {
    onChange(buttons.filter((b) => b.id !== id));
  }

  const atLimit = buttons.length >= maxButtons;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-base font-semibold">
          {heading}{" "}
          <span className="font-normal text-muted-foreground">
            (max {maxButtons})
          </span>
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                size="sm"
                disabled={atLimit}
                className="gap-1"
              />
            }
          >
            + Add Button
            <ChevronDown className="size-4 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {INTERACTIVE_BUTTON_MENU_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.kind}
                className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
                onClick={() => addButton(opt.kind)}
              >
                <span className="flex items-center gap-2 font-medium">
                  <opt.icon className="size-4 shrink-0" />
                  {opt.title}
                </span>
                <span className="pl-6 text-xs text-muted-foreground">
                  {opt.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {buttons.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {buttons.map((b) => {
            const meta = INTERACTIVE_BUTTON_MENU_OPTIONS.find(
              (o) => o.kind === b.kind
            );
            return (
              <li
                key={b.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {meta ? <meta.icon className="size-4 shrink-0 opacity-70" /> : null}
                  <span className="truncate font-medium">{b.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({meta?.title ?? b.kind})
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove button"
                  onClick={() => removeButton(b.id)}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
