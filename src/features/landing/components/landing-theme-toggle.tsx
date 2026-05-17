"use client";

import * as React from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LandingThemeToggleProps = {
  className?: string;
};

const themes = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    gradient: "from-slate-500 to-slate-700",
  },
] as const;

export function LandingThemeToggle({
  className,
}: LandingThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const selectedTheme =
    themes.find((item) => item.id === theme) || themes[2];

  const SelectedIcon = selectedTheme.icon;

  return (
    <Select
      value={theme}
      onValueChange={(value) =>
        setTheme(value as "light" | "dark" | "system")
      }
      disabled={!mounted}
    >
      <SelectTrigger
        aria-label="Theme"
        className={cn(
          "mr-3 h-[80px] w-[70px] py-[20px] rounded-lg border border-slate-200/90 bg-white/70 dark:border-slate-800/90 dark:bg-[#071226]/90 px-1.5 text-slate-600 dark:text-white shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl",
          "hover:bg-white/80 dark:hover:bg-[#071226]/90 focus:ring-0 focus:ring-offset-0",
          className
        )}
      >
        <div className="flex w-full items-center justify-evenly">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg",
              selectedTheme.gradient
            )}
          >
            <SelectedIcon className="size-5" strokeWidth={2.2} />
          </div>

          {/* <ChevronDown className="size-4 text-slate-300 opacity-80" /> */}
        </div>

        <SelectValue className="hidden" />
      </SelectTrigger>

      <SelectContent
        align="end"
        className="min-w-[180px] rounded-lg border border-slate-200/90 bg-white/100 dark:border-slate-800/90 dark:bg-[#071226]/100 text-slate-600 dark:text-white"
      >
        {themes.map(({ id, label, icon: Icon, gradient }) => (
          <SelectItem
            key={id}
            value={id}
            className="rounded-xl focus:bg-white/5"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-white dark:text-slate-600",
                    gradient
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </div>

                <span>{label}</span>
              </div>

            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}