"use client";

import * as React from "react";
import { FileText, Loader2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type TemplateAuthenticatedMediaProps = {
  fileId: string;
  mimeType?: string;
  compact?: boolean;
  className?: string;
};

export function TemplateAuthenticatedMedia({
  fileId,
  mimeType,
  compact,
  className,
}: TemplateAuthenticatedMediaProps) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setUrl(null);
    setFailed(false);
    void (async () => {
      try {
        const res = await apiFetch(`/v1/templates/media/${fileId}`);
        if (!res.ok || cancelled) {
          if (!cancelled) setFailed(true);
          return;
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-lg bg-slate-100 p-4 text-center text-xs text-slate-500 dark:bg-slate-800/80 dark:text-slate-400",
          className
        )}
      >
        <FileText className="size-8 opacity-50" aria-hidden />
        <span>Could not load media</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-slate-100 py-8 dark:bg-slate-800/80",
          className
        )}
      >
        <Loader2 className="size-6 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  const mt = mimeType ?? "";

  if (mt.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob URL from authenticated API
      <img
        src={url}
        alt=""
        className={cn(
          "max-h-48 w-full rounded-lg object-cover",
          compact && "max-h-32",
          className
        )}
      />
    );
  }

  if (mt.startsWith("video/")) {
    return (
      <video
        src={url}
        controls
        className={cn("max-h-48 w-full rounded-lg", compact && "max-h-32", className)}
      />
    );
  }

  if (mt.startsWith("audio/")) {
    return (
      <audio src={url} controls className={cn("w-full", className)} />
    );
  }

  return (
    <a
      href={url}
      download
      className={cn(
        "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-sky-700 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300",
        className
      )}
    >
      <FileText className="size-4 shrink-0" aria-hidden />
      Download file
    </a>
  );
}
