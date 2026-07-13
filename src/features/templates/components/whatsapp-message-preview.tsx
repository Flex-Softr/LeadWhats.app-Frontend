"use client";

import * as React from "react";
import {
  FileText,
  ImageIcon,
  MapPin,
  Music,
  Phone,
  UserRound,
  Video,
} from "lucide-react";

import { TemplateAuthenticatedMedia } from "@/features/templates/components/template-authenticated-media";
import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import type { TemplateInteractiveButton, TemplateMedia } from "@/types/template";
import { cn } from "@/lib/utils";

export type WhatsAppMessagePreviewProps = {
  contactLabel?: string;
  body: string;
  footer?: string;
  buttons?: TemplateInteractiveButton[];
  typeId?: TemplateTypeId;
  compact?: boolean;
  className?: string;
  /** Saved template payload (location, poll, file id, …). */
  media?: TemplateMedia | null;
  /** Local object URL while user picks a file in the editor. */
  localMediaPreviewUrl?: string | null;
  localMediaMimeType?: string | null;
};

function previewTime(): string {
  return new Date().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ButtonRows({ buttons }: { buttons: TemplateInteractiveButton[] }) {
  if (buttons.length === 0) return null;
  return (
    <div className="border-t border-[#e9edef] bg-white dark:border-slate-600/50 dark:bg-[#202c33]">
      {buttons.map((b) => (
        <div
          key={b.id}
          className={cn(
            "flex items-center justify-center gap-2 border-t border-[#e9edef] px-3 py-2.5 text-[15px] font-medium first:border-t-0 dark:border-slate-600/50",
            b.kind === "quick_reply" && "text-[#54656f] dark:text-slate-300",
            (b.kind === "cta_url" || b.kind === "cta_phone") &&
              "text-[#027eb5] dark:text-sky-400",
            b.kind === "copy_code" &&
              "font-mono text-sm text-[#54656f] dark:text-slate-300"
          )}
        >
          {b.kind === "cta_phone" ? (
            <Phone className="size-4 shrink-0" aria-hidden />
          ) : null}
          <span className="truncate text-center">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function MediaVisual({
  typeId,
  media,
  localMediaPreviewUrl,
  localMediaMimeType,
  compact,
}: {
  typeId: TemplateTypeId;
  media?: TemplateMedia | null;
  localMediaPreviewUrl?: string | null;
  localMediaMimeType?: string | null;
  compact?: boolean;
}) {
  const ext = media?.externalUrl;
  const fileId = media?.fileId;
  const mime = localMediaMimeType ?? media?.mimeType ?? "";

  if (localMediaPreviewUrl) {
    if (mime.startsWith("video/") || typeId === "message_video") {
      return (
        <video
          src={localMediaPreviewUrl}
          controls
          className={cn(
            "mb-2 w-full rounded-lg",
            compact ? "max-h-28" : "max-h-40"
          )}
        />
      );
    }
    if (mime.startsWith("audio/") || typeId === "message_audio") {
      return (
        <audio src={localMediaPreviewUrl} controls className="mb-2 w-full" />
      );
    }
    if (mime.startsWith("image/") || typeId === "message_image") {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview
        <img
          src={localMediaPreviewUrl}
          alt=""
          className={cn(
            "mb-2 w-full rounded-lg object-cover",
            compact ? "max-h-28" : "max-h-40"
          )}
        />
      );
    }
    return (
      <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-2 text-xs dark:bg-slate-800/80">
        <FileText className="size-6 shrink-0 text-slate-500" aria-hidden />
        <span className="truncate">Attached file</span>
      </div>
    );
  }

  if (ext && (typeId === "message_image" || typeId === "message_video")) {
    if (typeId === "message_image") {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- user-provided URL preview
        <img
          src={ext}
          alt=""
          className={cn(
            "mb-2 w-full rounded-lg object-cover",
            compact ? "max-h-28" : "max-h-40"
          )}
        />
      );
    }
    return (
      <video
        src={ext}
        controls
        className={cn(
          "mb-2 w-full rounded-lg",
          compact ? "max-h-28" : "max-h-40"
        )}
      />
    );
  }

  if (ext && typeId === "message_audio") {
    return <audio src={ext} controls className="mb-2 w-full" />;
  }

  if (fileId) {
    return (
      <div className={cn("mb-2", compact && "scale-95")}>
        <TemplateAuthenticatedMedia
          fileId={fileId}
          mimeType={media?.mimeType}
          compact={compact}
          className="w-full"
        />
      </div>
    );
  }

  if (ext && typeId === "message_document") {
    return (
      <a
        href={ext}
        target="_blank"
        rel="noreferrer"
        className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-3 text-xs font-medium text-sky-700 underline dark:bg-slate-800/80 dark:text-sky-300"
      >
        <FileText className="size-6 shrink-0" aria-hidden />
        Open document
      </a>
    );
  }

  const wrap =
    "mb-2 flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80";
  switch (typeId) {
    case "message_image":
      return (
        <div className={wrap}>
          <ImageIcon className="size-10 text-slate-400" aria-hidden />
        </div>
      );
    case "message_video":
      return (
        <div className={wrap}>
          <Video className="size-10 text-slate-400" aria-hidden />
        </div>
      );
    case "message_document":
      return (
        <div className={wrap}>
          <FileText className="size-10 text-slate-400" aria-hidden />
        </div>
      );
    case "message_audio":
      return (
        <div className="mb-2 flex w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-3 dark:bg-slate-800/80">
          <Music className="size-8 shrink-0 text-emerald-600" aria-hidden />
          <div className="h-1 flex-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      );
    case "message_location":
      return (
        <div className="mb-2 w-full space-y-1 rounded-lg bg-slate-100 p-3 dark:bg-slate-800/80">
          <MapPin className="size-8 text-red-500" aria-hidden />
          {media?.locationName ? (
            <p className="text-xs font-medium text-[#111b21] dark:text-slate-100">
              {media.locationName}
            </p>
          ) : null}
          {media?.address ? (
            <p className="text-[11px] text-[#667781] dark:text-slate-400">
              {media.address}
            </p>
          ) : null}
          {media?.latitude != null && media?.longitude != null ? (
            <p className="font-mono text-[10px] text-[#667781] dark:text-slate-500">
              {media.latitude.toFixed(4)}, {media.longitude.toFixed(4)}
            </p>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Map preview
            </span>
          )}
        </div>
      );
    default:
      return null;
  }
}

function ExtraBlocks({
  typeId,
  media,
  compact,
}: {
  typeId: TemplateTypeId;
  media?: TemplateMedia | null;
  compact?: boolean;
}) {
  if (!media) return null;

  if (typeId === "message_contact") {
    return (
      <div className="border-b border-[#e9edef] px-3 py-2 dark:border-slate-600/50">
        <div className="flex items-start gap-2 rounded-lg bg-[#f0f2f5] p-2 dark:bg-slate-800/60">
          <UserRound className="mt-0.5 size-8 shrink-0 text-[#54656f]" />
          <div className="min-w-0 text-[13px]">
            <p className="font-medium text-[#111b21] dark:text-slate-100">
              {media.contactName ?? "Contact"}
            </p>
            <p className="text-[#027eb5] dark:text-sky-400">
              {media.contactPhone ?? ""}
            </p>
            {media.contactOrg ? (
              <p className="text-[11px] text-[#667781] dark:text-slate-400">
                {media.contactOrg}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (typeId === "message_poll" && media.pollQuestion) {
    return (
      <div className="border-b border-[#e9edef] px-3 py-2 dark:border-slate-600/50">
        <p className="text-[13px] font-medium text-[#111b21] dark:text-slate-100">
          {media.pollQuestion}
        </p>
        <ul className="mt-2 space-y-1">
          {(media.pollOptions ?? []).map((o, i) => (
            <li
              key={i}
              className="rounded-md border border-[#e9edef] px-2 py-1.5 text-[12px] text-[#54656f] dark:border-slate-600 dark:text-slate-300"
            >
              {o}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (typeId === "message_list" && media.listSections?.length) {
    return (
      <div className="border-b border-[#e9edef] px-2 py-2 dark:border-slate-600/50">
        {media.listSections.map((sec, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <p
              className={cn(
                "px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#667781] dark:text-slate-400",
                compact && "text-[9px]"
              )}
            >
              {sec.title}
            </p>
            <ul className="space-y-0.5">
              {sec.rows.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md px-2 py-1.5 text-[12px] text-[#111b21] dark:text-slate-100"
                >
                  <span className="font-medium">{r.title}</span>
                  {r.description ? (
                    <span className="mt-0.5 block text-[11px] text-[#667781] dark:text-slate-400">
                      {r.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (typeId === "message_carousel" && media.carouselCards?.length) {
    return (
      <div className="border-b border-[#e9edef] px-2 py-2 dark:border-slate-600/50">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.carouselCards.map((c, i) => (
            <div
              key={i}
              className={cn(
                "w-[min(140px,85%)] shrink-0 overflow-hidden rounded-lg border border-[#e9edef] bg-[#f0f2f5] dark:border-slate-600 dark:bg-slate-800/50",
                compact && "w-[min(100px,80%)]"
              )}
            >
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imageUrl}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-slate-200/80 dark:bg-slate-700/50">
                  <ImageIcon className="size-6 text-slate-400" />
                </div>
              )}
              <div className="p-2">
                {c.title ? (
                  <p className="text-[11px] font-semibold text-[#111b21] dark:text-slate-100">
                    {c.title}
                  </p>
                ) : null}
                {c.body ? (
                  <p className="mt-0.5 text-[10px] text-[#667781] dark:text-slate-400">
                    {c.body}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (typeId === "flow_message" && media.flowId) {
    return (
      <div className="border-b border-[#e9edef] px-3 py-2 dark:border-slate-600/50">
        <p className="text-[11px] font-medium text-[#667781] dark:text-slate-400">
          Flow
        </p>
        <p className="font-mono text-[12px] text-[#111b21] dark:text-slate-100">
          {media.flowId}
        </p>
      </div>
    );
  }

  return null;
}

export function WhatsAppMessagePreview({
  contactLabel: contactLabelProp,
  body,
  footer,
  buttons,
  typeId = "text_message",
  compact = false,
  className,
  media = null,
  localMediaPreviewUrl = null,
  localMediaMimeType = null,
}: WhatsAppMessagePreviewProps) {
  const contactLabel = (contactLabelProp ?? "Your business").trim() || "Your business";
  const [time] = React.useState(previewTime);

  const showMediaRow = [
    "message_image",
    "message_video",
    "message_document",
    "message_audio",
    "message_location",
  ].includes(typeId);

  const listOrCarousel =
    typeId === "message_list" || typeId === "message_carousel";
  const ctaButtonLabel = media?.ctaButtonLabel;
  const copyCodeValue = media?.copyCodeValue;

  const effectiveButtons = React.useMemo((): TemplateInteractiveButton[] => {
    if (buttons?.length) return buttons;
    if (typeId === "cta_button" && ctaButtonLabel) {
      return [
        {
          id: "cta_preview",
          kind: "cta_url",
          label: ctaButtonLabel,
        },
      ];
    }
    if (typeId === "copy_code" && copyCodeValue) {
      return [
        {
          id: "copy_preview",
          kind: "copy_code",
          label: copyCodeValue,
        },
      ];
    }
    return [];
  }, [buttons, typeId, ctaButtonLabel, copyCodeValue]);

  return (
    <div
      className={cn("mx-auto", className)}
      role="region"
      aria-label="WhatsApp message preview as seen by the recipient"
    >
      <div
        className={cn(
          "overflow-hidden rounded-[2.25rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl ring-1 ring-black/20 dark:border-slate-950",
          compact ? "max-w-[240px]" : "max-w-[320px]"
        )}
      >
        <div className="flex h-6 items-center justify-center bg-slate-900">
          <div className="h-4 w-20 rounded-full bg-black/40" />
        </div>

        <div
          className={cn(
            "flex items-center gap-2 border-b border-black/10 bg-[#f0f2f5] px-3 py-2 dark:border-white/10 dark:bg-[#202c33]",
            compact ? "py-1.5" : "py-2.5"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dfe5e9] text-sm font-semibold text-[#54656f] dark:bg-slate-600 dark:text-slate-200">
            {contactLabel.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-medium text-[#111b21] dark:text-slate-100",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {contactLabel}
            </p>
            <p className="text-[10px] text-[#667781] dark:text-slate-400">
              online
            </p>
          </div>
        </div>

        <div
          className={cn(
            "relative bg-[#e5ddd5] dark:bg-[#0b141a]",
            compact ? "min-h-[160px] px-2 py-3" : "min-h-[220px] px-3 py-4"
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.12]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative flex justify-start">
            <div
              className={cn(
                "max-w-[92%] overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-sm dark:bg-[#202c33] dark:shadow-none",
                compact ? "text-[11px]" : "text-[13px] leading-snug"
              )}
            >
              {listOrCarousel ? (
                <div className="border-b border-[#e9edef] px-3 py-2 dark:border-slate-600/50">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#667781] dark:text-slate-400">
                    {typeId === "message_list" ? "List menu" : "Carousel"}
                  </p>
                </div>
              ) : null}

              <ExtraBlocks typeId={typeId} media={media} compact={compact} />

              {showMediaRow ? (
                <div className={cn("px-2", compact ? "pt-1.5" : "pt-2")}>
                  <MediaVisual
                    typeId={typeId}
                    media={media}
                    localMediaPreviewUrl={localMediaPreviewUrl}
                    localMediaMimeType={localMediaMimeType}
                    compact={compact}
                  />
                </div>
              ) : null}

              <div className={cn("px-3", compact ? "pt-1.5 pb-1" : "pt-2 pb-1")}>
                <p className="whitespace-pre-wrap break-words text-[#111b21] dark:text-slate-100">
                  {body.trim() || "…"}
                </p>
                {footer?.trim() ? (
                  <p
                    className={cn(
                      "mt-1 text-[#667781] dark:text-slate-400",
                      compact ? "text-[9px]" : "text-[11px]"
                    )}
                  >
                    {footer.trim()}
                  </p>
                ) : null}
                <div
                  className={cn(
                    "mt-1 flex items-end justify-end gap-1 text-[#667781] dark:text-slate-500",
                    compact ? "text-[9px]" : "text-[11px]"
                  )}
                >
                  <span>{time}</span>
                  <span className="text-[#53bdeb]" aria-hidden>
                    ✓✓
                  </span>
                </div>
              </div>

              {effectiveButtons.length > 0 ? (
                <ButtonRows buttons={effectiveButtons} />
              ) : null}
            </div>
          </div>

          <p
            className={cn(
              "mt-3 text-center text-[#667781]/90 dark:text-slate-500",
              compact ? "text-[9px]" : "text-[10px]"
            )}
          >
            Preview only — how recipients usually see your message
          </p>
        </div>
      </div>
    </div>
  );
}
