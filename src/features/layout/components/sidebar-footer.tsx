export function SidebarFooter() {
  return (
    <div className="mt-auto px-4 pb-2 pt-5">
      <div className="rounded-lg bg-[#f4efff] px-3 py-3 text-center dark:bg-slate-900">
        <p className="text-xs font-semibold text-[#5630a7] dark:text-violet-300">
          FlexoWhats
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
          Modern messaging · ©{" "}
        {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
