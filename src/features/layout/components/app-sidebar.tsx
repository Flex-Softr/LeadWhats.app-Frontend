import { BrandMark } from "@/features/layout/components/brand-mark";
import { SidebarNav } from "@/features/layout/components/sidebar-nav";
import { SidebarFooter } from "@/features/layout/components/sidebar-footer";

export function AppSidebar() {
  return (
    <aside className="sticky top-4 z-30 hidden h-[calc(100vh-2rem)] w-[280px] shrink-0 flex-col rounded-3xl border border-white/70 bg-white/75 py-6 shadow-xl shadow-violet-500/[0.07] backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/75 sm:h-[calc(100vh-2.5rem)] lg:flex lg:h-[calc(100vh-3rem)] lg:w-[288px] lg:flex-col xl:w-[300px]">
      <div className="px-4">
        <BrandMark />
      </div>
      <div className="mx-4 my-5 h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent dark:via-violet-900/60" />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}
