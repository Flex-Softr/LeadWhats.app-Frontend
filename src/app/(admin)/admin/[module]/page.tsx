import { notFound } from "next/navigation";

import { AdminModuleView } from "@/features/admin/components/admin-module-view";
import { AdminBillingView } from "@/features/admin/components/admin-billing-view";
import { AdminComplianceView } from "@/features/admin/components/admin-compliance-view";
import { AdminModerationView } from "@/features/admin/components/admin-moderation-view";
import { AdminScreenView } from "@/features/admin/components/admin-screen-view";
import { AdminFleetView } from "@/features/admin/components/admin-fleet-view";
import { AdminSubscriptionsView } from "@/features/admin/components/admin-subscriptions-view";
import { AdminTenantsView } from "@/features/admin/components/admin-tenants-view";
import { AdminUsageView } from "@/features/admin/components/admin-usage-view";
import { AdminUsersView } from "@/features/admin/components/admin-users-view";
import {
  ADMIN_MODULE_IDS,
  ADMIN_MODULE_REGISTRY,
  isAdminModuleId,
} from "@/features/admin/lib/admin-module-registry";
import { isAdminScreenDataModule } from "@/features/admin/lib/admin-screen-modules";

type PageProps = {
  params: Promise<{ module: string }>;
};

export function generateStaticParams() {
  return ADMIN_MODULE_IDS.map((module) => ({ module }));
}

export default async function AdminModulePage({ params }: PageProps) {
  const { module } = await params;
  if (!isAdminModuleId(module)) {
    notFound();
  }

  const def = ADMIN_MODULE_REGISTRY[module];
  if (module === "subscriptions") {
    return <AdminSubscriptionsView module={def} />;
  }
  if (module === "billing") {
    return <AdminBillingView module={def} />;
  }
  if (module === "tenants") {
    return <AdminTenantsView module={def} />;
  }
  if (module === "users") {
    return <AdminUsersView module={def} />;
  }
  if (module === "usage") {
    return <AdminUsageView module={def} />;
  }
  if (module === "fleet") {
    return <AdminFleetView module={def} />;
  }
  if (module === "compliance") {
    return <AdminComplianceView module={def} />;
  }
  if (module === "moderation") {
    return <AdminModerationView module={def} />;
  }
  if (isAdminScreenDataModule(module)) {
    return <AdminScreenView module={def} />;
  }
  return <AdminModuleView module={def} />;
}
