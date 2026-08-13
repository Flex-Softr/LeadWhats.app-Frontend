import { RequirePlatformAdmin } from "@/features/admin/components/require-platform-admin";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequirePlatformAdmin>{children}</RequirePlatformAdmin>;
}
