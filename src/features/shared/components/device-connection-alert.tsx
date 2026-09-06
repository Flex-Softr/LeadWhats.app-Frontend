"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeviceConnectionAlertProps = {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
};

export function DeviceConnectionAlert({
  title = "No WhatsApp Device Connected",
  description = "An active, connected WhatsApp device is required to perform actions on this page. Please connect a device to get started.",
  actionText = "Connect Device",
  actionHref = "/devices",
  className,
}: DeviceConnectionAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        "dark:border-amber-500/35 dark:bg-amber-500/15",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300">
          <Smartphone className="size-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-200">
            {title}
          </h4>
          <p className="text-xs text-amber-900/85 dark:text-amber-300/85 sm:text-sm">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0 sm:self-center">
        <Button
          render={<Link href={actionHref} />}
          nativeButton={false}
          size="sm"
          className="h-9 w-full gap-1.5 rounded-lg bg-amber-600 font-semibold text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 sm:w-auto"
        >
          <span>{actionText}</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
