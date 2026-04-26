import { SubscriptionProvider } from "@/features/billing/subscription-context";
import { ContactsProvider } from "@/features/contacts/contacts-provider";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { DashboardShell } from "@/features/layout/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <ContactsProvider>
        <SubscriptionProvider>
          <DashboardShell>{children}</DashboardShell>
        </SubscriptionProvider>
      </ContactsProvider>
    </RequireAuth>
  );
}
