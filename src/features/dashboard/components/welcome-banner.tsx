"use client";

import { MessageCircle } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { useSubscription } from "@/features/billing/subscription-context";
import { userDisplayName } from "@/lib/user-display";

type WelcomeBannerProps = {
  devicesOnline: number;
  messagesToday: number;
};

export function WelcomeBanner({
  devicesOnline,
  messagesToday,
}: WelcomeBannerProps) {
  const { license, hydrated } = useSubscription();
  const { user } = useAuth();
  const tierLine = hydrated ? license.tierLabel : "…";
  const who = user ? userDisplayName(user) : "…";

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/60 bg-gradient-to-r from-violet-600/95 via-fuchsia-600/90 to-indigo-600/95 px-5 py-5 text-white shadow-md shadow-violet-500/15 backdrop-blur-sm sm:rounded-lg sm:px-6 sm:py-6 dark:border-violet-500/20">
      <div className="relative z-10 max-w-2xl space-y-3">
        <h2 className="text-base font-semibold leading-snug tracking-tight sm:text-lg">
          Welcome back — here&apos;s your automation pulse today.
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs leading-relaxed text-white/90 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
            {devicesOnline} devices online
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.7)]" />
            {messagesToday} messages today
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-white/50" />
            {tierLine} · {who}
          </span>
        </div>
      </div>
      <MessageCircle
        className="pointer-events-none absolute -right-4 -bottom-6 size-28 text-white/12 sm:size-36"
        strokeWidth={1}
      />
    </div>
  );
}
