import { AuthMarketingPanel } from "@/features/auth/components/auth-marketing-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
        <AuthMarketingPanel />
        <div className="flex flex-1 flex-col justify-center bg-white px-6 py-10 shadow-[inset_1px_0_0_0] shadow-slate-200/80 dark:bg-slate-950 dark:shadow-slate-800/80 lg:px-12 xl:px-20">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
