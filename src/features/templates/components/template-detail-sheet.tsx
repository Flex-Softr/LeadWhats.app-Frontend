"use client";

import type { MessageTemplateRecord } from "@/types/template";
import { templateCategoryLabel } from "@/features/templates/config/template-categories";
import { TEMPLATE_TYPE_OPTIONS } from "@/features/templates/config/template-type-definitions";
import { WhatsAppMessagePreview } from "@/features/templates/components/whatsapp-message-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

function typeLabel(id: MessageTemplateRecord["typeId"]) {
  return TEMPLATE_TYPE_OPTIONS.find((t) => t.id === id)?.label ?? id;
}

type TemplateDetailSheetProps = {
  template: MessageTemplateRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateDetailSheet({
  template,
  open,
  onOpenChange,
}: TemplateDetailSheetProps) {
  const isOpen = Boolean(open && template);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {template ? (
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-slate-200 px-6 py-5 text-left dark:border-slate-800">
          <SheetTitle className="pr-8 text-xl">{template.name}</SheetTitle>
          <SheetDescription className="flex flex-wrap gap-2 pt-2">
            {!template.active ? (
              <Badge variant="secondary" className="text-amber-900 dark:text-amber-200">
                Inactive
              </Badge>
            ) : null}
            <Badge variant="secondary">{typeLabel(template.typeId)}</Badge>
            <Badge variant="outline">
              {templateCategoryLabel(template.category)}
            </Badge>
            {template.waTemplateName ? (
              <Badge variant="outline" className="font-mono text-xs">
                {template.waTemplateName}
              </Badge>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Recipient preview
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Approximate look on WhatsApp when this template is sent.
            </p>
            <div className="mt-4 flex justify-center rounded-2xl bg-slate-100/80 py-6 dark:bg-slate-900/50">
              <WhatsAppMessagePreview
                contactLabel={template.name}
                body={template.content}
                footer={template.footer}
                buttons={template.buttons}
                typeId={template.typeId}
                media={template.media}
              />
            </div>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">Language</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {template.language}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">Created</dt>
              <dd className="text-slate-800 dark:text-slate-200">
                {template.createdAtLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Updated</dt>
              <dd className="text-slate-800 dark:text-slate-200">
                {template.updatedAtLabel}
              </dd>
            </div>
          </dl>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
      ) : null}
    </Sheet>
  );
}
