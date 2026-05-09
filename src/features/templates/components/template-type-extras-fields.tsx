"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import { TemplateInteractiveButtonsField } from "@/features/templates/components/template-interactive-buttons-field";
import {
  emptyCarouselCard,
  emptyListSection,
  type TemplateFormExtras,
} from "@/features/templates/types/template-form-extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TemplateTypeExtrasFieldsProps = {
  typeId: TemplateTypeId;
  extras: TemplateFormExtras;
  setExtras: React.Dispatch<React.SetStateAction<TemplateFormExtras>>;
};

function fileAccept(typeId: TemplateTypeId): string {
  switch (typeId) {
    case "message_image":
      return "image/jpeg,image/png,image/gif,image/webp";
    case "message_video":
      return "video/mp4,video/webm,video/quicktime";
    case "message_audio":
      return "audio/mpeg,audio/mp4,audio/ogg,audio/wav";
    case "message_document":
      return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf";
    default:
      return "*/*";
  }
}

export function TemplateTypeExtrasFields({
  typeId,
  extras,
  setExtras,
}: TemplateTypeExtrasFieldsProps) {
  const asInputValue = (value: string | null | undefined) => value ?? "";

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setExtras((prev) => {
      if (prev.localMediaObjectUrl) URL.revokeObjectURL(prev.localMediaObjectUrl);
      if (!f) {
        return { ...prev, mediaFile: null, localMediaObjectUrl: null };
      }
      return {
        ...prev,
        mediaFile: f,
        localMediaObjectUrl: URL.createObjectURL(f),
      };
    });
    e.target.value = "";
  };

  if (
    typeId === "message_image" ||
    typeId === "message_video" ||
    typeId === "message_document" ||
    typeId === "message_audio"
  ) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Media
        </p>
        <p className="text-xs text-muted-foreground">
          Upload a file and/or paste a public https link (WhatsApp Cloud API often
          needs a hosted URL).
        </p>
        <div className="space-y-2">
          <Label htmlFor="tpl-media-file">File upload</Label>
          <Input
            id="tpl-media-file"
            type="file"
            accept={fileAccept(typeId)}
            className="cursor-pointer"
            onChange={onFile}
          />
          {extras.mediaFile ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() =>
                setExtras((prev) => {
                  if (prev.localMediaObjectUrl) {
                    URL.revokeObjectURL(prev.localMediaObjectUrl);
                  }
                  return { ...prev, mediaFile: null, localMediaObjectUrl: null };
                })
              }
            >
              Remove file
            </Button>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-media-url">Public media URL (optional)</Label>
          <Input
            id="tpl-media-url"
            value={asInputValue(extras.externalMediaUrl)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, externalMediaUrl: e.target.value }))
            }
            placeholder="https://…"
          />
        </div>
      </div>
    );
  }

  if (typeId === "message_location") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium">Location</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tpl-lat">Latitude</Label>
            <Input
              id="tpl-lat"
              inputMode="decimal"
              value={asInputValue(extras.latitude)}
              onChange={(e) =>
                setExtras((p) => ({ ...p, latitude: e.target.value }))
              }
              placeholder="e.g. 24.7136"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-lng">Longitude</Label>
            <Input
              id="tpl-lng"
              inputMode="decimal"
              value={asInputValue(extras.longitude)}
              onChange={(e) =>
                setExtras((p) => ({ ...p, longitude: e.target.value }))
              }
              placeholder="e.g. 46.6753"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-loc-name">Place name (optional)</Label>
          <Input
            id="tpl-loc-name"
            value={asInputValue(extras.locationName)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, locationName: e.target.value }))
            }
            placeholder="Store / venue name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-loc-addr">Address (optional)</Label>
          <Input
            id="tpl-loc-addr"
            value={asInputValue(extras.address)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, address: e.target.value }))
            }
            placeholder="Street, city"
          />
        </div>
      </div>
    );
  }

  if (typeId === "message_contact") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium">Contact card</p>
        <div className="space-y-2">
          <Label htmlFor="tpl-cn">Display name</Label>
          <Input
            id="tpl-cn"
            value={asInputValue(extras.contactName)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, contactName: e.target.value }))
            }
            placeholder="Contact name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-cp">Phone</Label>
          <Input
            id="tpl-cp"
            value={asInputValue(extras.contactPhone)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, contactPhone: e.target.value }))
            }
            placeholder="+1…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-co">Organization (optional)</Label>
          <Input
            id="tpl-co"
            value={asInputValue(extras.contactOrg)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, contactOrg: e.target.value }))
            }
          />
        </div>
      </div>
    );
  }

  if (typeId === "message_poll") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium">Poll</p>
        <div className="space-y-2">
          <Label htmlFor="tpl-poll-q">Question</Label>
          <Input
            id="tpl-poll-q"
            value={asInputValue(extras.pollQuestion)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, pollQuestion: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options (min 2)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={extras.pollOptions.length >= 12}
              onClick={() =>
                setExtras((p) => ({ ...p, pollOptions: [...p.pollOptions, ""] }))
              }
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {extras.pollOptions.map((opt, i) => (
              <li key={i} className="flex gap-2">
                <Input
                  value={asInputValue(opt)}
                  onChange={(e) =>
                    setExtras((p) => {
                      const next = [...p.pollOptions];
                      next[i] = e.target.value;
                      return { ...p, pollOptions: next };
                    })
                  }
                  placeholder={`Option ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={extras.pollOptions.length <= 2}
                  aria-label="Remove option"
                  onClick={() =>
                    setExtras((p) => ({
                      ...p,
                      pollOptions: p.pollOptions.filter((_, j) => j !== i),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (typeId === "message_list") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">List menu</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={extras.listSections.length >= 10}
            onClick={() =>
              setExtras((p) => ({
                ...p,
                listSections: [...p.listSections, emptyListSection()],
              }))
            }
          >
            <Plus className="size-3.5" />
            Section
          </Button>
        </div>
        {extras.listSections.map((sec, si) => (
          <div
            key={si}
            className="space-y-3 rounded-lg border bg-white/80 p-3 dark:bg-slate-950/40"
          >
            <div className="flex items-center gap-2">
              <Input
                value={asInputValue(sec.title)}
                onChange={(e) =>
                  setExtras((p) => {
                    const next = [...p.listSections];
                    next[si] = { ...next[si], title: e.target.value };
                    return { ...p, listSections: next };
                  })
                }
                placeholder="Section title"
                className="font-medium"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={extras.listSections.length <= 1}
                aria-label="Remove section"
                onClick={() =>
                  setExtras((p) => ({
                    ...p,
                    listSections: p.listSections.filter((_, j) => j !== si),
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Rows</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={sec.rows.length >= 10}
                onClick={() =>
                  setExtras((p) => {
                    const next = [...p.listSections];
                    const rows = [...next[si].rows];
                    rows.push({
                      id: `r_${Date.now()}`,
                      title: "",
                      description: "",
                    });
                    next[si] = { ...next[si], rows };
                    return { ...p, listSections: next };
                  })
                }
              >
                <Plus className="size-3" />
                Row
              </Button>
            </div>
            {sec.rows.map((row, ri) => (
              <div key={row.id} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={asInputValue(row.title)}
                  onChange={(e) =>
                    setExtras((p) => {
                      const next = [...p.listSections];
                      const rows = [...next[si].rows];
                      rows[ri] = { ...rows[ri], title: e.target.value };
                      next[si] = { ...next[si], rows };
                      return { ...p, listSections: next };
                    })
                  }
                  placeholder="Row title"
                  className="sm:flex-1"
                />
                <Input
                  value={asInputValue(row.description)}
                  onChange={(e) =>
                    setExtras((p) => {
                      const next = [...p.listSections];
                      const rows = [...next[si].rows];
                      rows[ri] = { ...rows[ri], description: e.target.value };
                      next[si] = { ...next[si], rows };
                      return { ...p, listSections: next };
                    })
                  }
                  placeholder="Subtitle (optional)"
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={sec.rows.length <= 1}
                  aria-label="Remove row"
                  onClick={() =>
                    setExtras((p) => {
                      const next = [...p.listSections];
                      const rows = next[si].rows.filter((_, j) => j !== ri);
                      next[si] = { ...next[si], rows };
                      return { ...p, listSections: next };
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (typeId === "message_carousel") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Carousel cards</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={extras.carouselCards.length >= 10}
            onClick={() =>
              setExtras((p) => ({
                ...p,
                carouselCards: [...p.carouselCards, emptyCarouselCard()],
              }))
            }
          >
            <Plus className="size-3.5" />
            Card
          </Button>
        </div>
        {extras.carouselCards.map((card, ci) => (
          <div
            key={ci}
            className="space-y-2 rounded-lg border bg-white/80 p-3 dark:bg-slate-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Card {ci + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={extras.carouselCards.length <= 1}
                aria-label="Remove card"
                onClick={() =>
                  setExtras((p) => ({
                    ...p,
                    carouselCards: p.carouselCards.filter((_, j) => j !== ci),
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Input
              value={asInputValue(card.title)}
              onChange={(e) =>
                setExtras((p) => {
                  const next = [...p.carouselCards];
                  next[ci] = { ...next[ci], title: e.target.value };
                  return { ...p, carouselCards: next };
                })
              }
              placeholder="Card title"
            />
            <Textarea
              value={asInputValue(card.body)}
              onChange={(e) =>
                setExtras((p) => {
                  const next = [...p.carouselCards];
                  next[ci] = { ...next[ci], body: e.target.value };
                  return { ...p, carouselCards: next };
                })
              }
              placeholder="Body"
              className="min-h-16"
            />
            <Input
              value={asInputValue(card.imageUrl)}
              onChange={(e) =>
                setExtras((p) => {
                  const next = [...p.carouselCards];
                  next[ci] = { ...next[ci], imageUrl: e.target.value };
                  return { ...p, carouselCards: next };
                })
              }
              placeholder="Image URL (https, optional)"
            />
          </div>
        ))}
      </div>
    );
  }

  if (typeId === "cta_button") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium">Call to action</p>
        <div className="space-y-2">
          <Label htmlFor="tpl-cta-url">Destination URL</Label>
          <Input
            id="tpl-cta-url"
            value={asInputValue(extras.ctaUrl)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, ctaUrl: e.target.value }))
            }
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-cta-lbl">Button label</Label>
          <Input
            id="tpl-cta-lbl"
            value={asInputValue(extras.ctaButtonLabel)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, ctaButtonLabel: e.target.value }))
            }
            placeholder="Shop now"
          />
        </div>
      </div>
    );
  }

  if (typeId === "copy_code") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium">Copy code</p>
        <div className="space-y-2">
          <Label htmlFor="tpl-code">Code to copy</Label>
          <Input
            id="tpl-code"
            value={asInputValue(extras.copyCode)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, copyCode: e.target.value }))
            }
            placeholder="SAVE20"
            className="font-mono"
          />
        </div>
      </div>
    );
  }

  if (typeId === "flow_message") {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <p className="text-sm font-medium">WhatsApp Flow</p>
        <div className="space-y-2">
          <Label htmlFor="tpl-flow">Flow ID</Label>
          <Input
            id="tpl-flow"
            value={asInputValue(extras.flowId)}
            onChange={(e) =>
              setExtras((p) => ({ ...p, flowId: e.target.value }))
            }
            placeholder="From Meta Business / Flows"
            className="font-mono text-sm"
          />
        </div>
      </div>
    );
  }

  if (typeId === "message_buttons") {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <TemplateInteractiveButtonsField
          heading="Reply buttons"
          emptyHint="Add 1–3 quick reply, link, phone, or copy actions."
          maxButtons={3}
          buttons={extras.messageButtons}
          onChange={(buttons) =>
            setExtras((p) => ({ ...p, messageButtons: buttons }))
          }
        />
      </div>
    );
  }

  return null;
}
