"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api";

type DeviceProfileAvatarProps = {
  deviceId: string;
  size?: "default" | "sm" | "lg";
  ringClassName: string;
  fallback: ReactNode;
};

/**
 * Loads the WhatsApp account photo via the API (Bearer + server-side CDN fetch).
 * Signed pps.whatsapp.net URLs are unreliable in <img src> across browsers.
 */
export function DeviceProfileAvatar({
  deviceId,
  size = "lg",
  ringClassName,
  fallback,
}: DeviceProfileAvatarProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await apiFetch(
          `/v1/devices/${encodeURIComponent(deviceId)}/profile-photo`
        );
        if (cancelled) return;
        if (!res.ok) {
          setBlobUrl(null);
          return;
        }
        const blob = await res.blob();
        const next = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(next);
          return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = next;
        setBlobUrl(next);
      } catch {
        if (!cancelled) setBlobUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [deviceId]);

  return (
    <Avatar size={size} className={ringClassName}>
      {blobUrl ? (
        <AvatarImage src={blobUrl} alt="" />
      ) : null}
      <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
