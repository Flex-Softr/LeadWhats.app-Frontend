import { MessageCircleMore } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3 py-1 px-2">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8d6ae8] to-[#5d35bd] text-white shadow-[0_12px_24px_rgba(93,53,189,0.28)]">
        <MessageCircleMore className="size-[21px]" strokeWidth={2.1} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[1.45rem] font-extrabold tracking-tight text-[#21172d] dark:text-white">
          FlexoWhats
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">
          SaaS Messaging Dashboard
        </p>
      </div>
    </div>
  );
}
