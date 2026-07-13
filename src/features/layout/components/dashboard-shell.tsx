import { AppHeader } from "@/features/layout/components/app-header";
import { AppSidebar } from "@/features/layout/components/app-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#a66cff] via-[#7d4ce0] to-[#3a10b7] p-2 text-slate-950 sm:p-5 lg:p-7 dark:from-[#251056] dark:via-[#180b3d] dark:to-[#070315]">
      <div className="flex w-full overflow-hidden rounded-lg bg-[#f6f3fb] shadow-[0_30px_90px_rgba(36,9,94,0.28)] ring-1 ring-white/40 dark:bg-slate-950 dark:ring-white/10">
        <AppSidebar />
        <div className="flex min-h-[calc(100vh-1rem)] min-w-0 flex-1 flex-col bg-[#f7f4fc] dark:bg-slate-950 sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3.5rem)]">
          <AppHeader />
          <main className="flex-1 overflow-auto px-3 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
