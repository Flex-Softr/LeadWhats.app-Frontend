"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthFieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold tracking-tight text-foreground"
    >
      {children}
    </label>
  );
}

type IconInputProps = Omit<React.ComponentProps<typeof Input>, "className"> & {
  id: string;
  icon: LucideIcon;
  className?: string;
};

export function AuthIconInput({
  id,
  icon: Icon,
  className,
  ...props
}: IconInputProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        className={cn(
          "h-11 rounded-xl border-slate-200/90 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950/50",
          className
        )}
        {...props}
      />
    </div>
  );
}

type AuthPasswordFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "className"
> & {
  id: string;
  className?: string;
};

export function AuthPasswordField({
  id,
  className,
  ...props
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Lock
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        className={cn(
          "h-11 rounded-xl border-slate-200/90 bg-white pr-11 pl-10 dark:border-slate-700 dark:bg-slate-950/50",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
