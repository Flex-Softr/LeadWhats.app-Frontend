import Link from "next/link";
import { Construction } from "lucide-react";

import { ADMIN_BASE_PATH } from "@/config/admin-navigation";
import type { AdminModuleDefinition } from "@/features/admin/lib/admin-module-registry";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminModuleViewProps = {
  module: AdminModuleDefinition;
};

export function AdminModuleView({ module }: AdminModuleViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          {module.subtitle}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {module.title}
        </h2>
        <p className="max-w-3xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          {module.purpose}
        </p>
      </div>

      {module.kpis && module.kpis.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {module.kpis.map((k) => (
            <Badge
              key={k.label}
              variant="secondary"
              className="rounded-lg px-3 py-1.5 text-xs font-normal"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {k.label}:{" "}
              </span>
              {k.value}
              {k.hint ? (
                <span className="ml-1 text-muted-foreground">({k.hint})</span>
              ) : null}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Integrations to wire</CardTitle>
            <CardDescription>
              Suggested backends and services for this module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {module.integrations.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500/80" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Suggested UI panels</CardTitle>
            <CardDescription>
              Split into tabs, routes, or slide-overs as you grow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {module.panels.map((p) => (
              <div key={p.name}>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {p.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
            <Construction className="size-7 text-slate-400" />
          </div>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Data tables, filters, and actions go here. The registry above keeps
            product and engineering aligned on what each screen owns.
          </p>
          <Link
            href={ADMIN_BASE_PATH}
            className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
          >
            ← Back to command center
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
