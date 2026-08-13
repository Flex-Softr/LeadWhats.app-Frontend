import { AppHeader } from "@/features/layout/components/app-header";
import { AppSidebar } from "@/features/layout/components/app-sidebar";
import { SidebarProvider } from "@/features/layout/sidebar-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden bg-background dark:bg-slate-950">
          <AppHeader />
          <main className="flex-1 overflow-auto px-3 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
