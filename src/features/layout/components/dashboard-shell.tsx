import { AppHeader } from "@/features/layout/components/app-header";
import { AppSidebar } from "@/features/layout/components/app-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.14),transparent_55%),radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(99,102,241,0.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="flex w-full gap-3 py-4 px-1 sm:gap-4 sm:p-5 lg:gap-5 lg:p-6 xl:p-8">
        <AppSidebar />
        <div className="flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/60 bg-slate-50/80 shadow-[0_8px_40px_-12px_rgba(91,33,182,0.12)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/40 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)]">
          <AppHeader />
          <main className="flex-1 overflow-auto px-2 py-8 sm:px-7 sm:py-9 md:px-8 md:py-10 lg:px-10 lg:py-11">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
