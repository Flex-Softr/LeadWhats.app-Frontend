import { Construction } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
            <Construction className="size-7 text-slate-400" />
          </div>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            This area is ready for your workflow. Hook up APIs and real data when
            you move beyond the static frontend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
