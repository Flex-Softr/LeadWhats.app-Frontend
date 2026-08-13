export function SidebarFooter({ isCollapsed }: { isCollapsed?: boolean }) {
  if (isCollapsed) {
    return (
      <div className="mt-auto px-2 pb-3 pt-3 text-center">
        <div
          className="rounded-xl bg-gradient-to-br from-violet-600/15 to-indigo-600/15 p-2.5 text-[10px] font-extrabold text-violet-700 dark:from-violet-500/20 dark:to-indigo-500/20 dark:text-violet-300"
          title={`FlexoWhats © ${new Date().getFullYear()}`}
        >
          FW
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto px-3.5 pb-3 pt-4">
      <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 via-purple-50/50 to-indigo-50/80 px-3.5 py-3 text-center shadow-xs dark:border-violet-900/40 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-indigo-950/40">
        <p className="text-xs font-bold text-violet-950 dark:text-violet-200">
          FlexoWhats
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-violet-600/80 dark:text-violet-400/80">
          Modern messaging · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
