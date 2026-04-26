import { AdminBrandMark } from "@/features/admin/components/admin-brand-mark";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminMobileSidebar } from "@/features/admin/components/admin-mobile-sidebar";
import { AdminSidebarFooter } from "@/features/admin/components/admin-sidebar-footer";
import { AdminSidebarNav } from "@/features/admin/components/admin-sidebar-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(251,191,36,0.12),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(51,65,85,0.12),transparent_45%)] dark:bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(251,191,36,0.08),transparent_50%)]"
        aria-hidden
      />
      <div className="flex w-full gap-3 p-4 sm:gap-4 sm:p-5 lg:gap-5 lg:p-6 xl:p-8">
        <aside className="sticky top-4 z-30 hidden h-[calc(100vh-2rem)] w-[280px] shrink-0 flex-col rounded-3xl border border-slate-200/90 bg-white/85 py-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/80 sm:h-[calc(100vh-2.5rem)] lg:flex lg:h-[calc(100vh-3rem)] lg:w-[288px] xl:w-[300px]">
          <div className="px-4">
            <AdminBrandMark />
          </div>
          <div className="mx-4 my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
          <AdminSidebarNav />
          <AdminSidebarFooter />
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/50 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)]">
          <div className="flex items-center gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-slate-800/80 lg:hidden">
            <AdminMobileSidebar />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Admin
            </span>
          </div>
          <AdminHeader />
          <main className="flex-1 overflow-auto px-5 py-8 sm:px-7 sm:py-9 md:px-8 md:py-10 lg:px-10 lg:py-11">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
