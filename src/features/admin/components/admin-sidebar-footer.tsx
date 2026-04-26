export function AdminSidebarFooter() {
  return (
    <div className="mt-auto border-t border-slate-200/80 px-4 pb-3 pt-4 dark:border-slate-800/80">
      <p className="px-1 text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
        FlexoWhats Admin · workspace owners &amp; admins only · ©{" "}
        {new Date().getFullYear()}
      </p>
    </div>
  );
}
