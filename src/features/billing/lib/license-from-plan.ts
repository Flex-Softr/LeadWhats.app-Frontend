import type { PlanId } from "@/types/billing";
import type { UserLicense } from "@/types/dashboard";

/** Maps subscription plan to header / UI license copy */
export function licenseFromPlan(planId: PlanId): UserLicense {
  switch (planId) {
    case "free":
      return {
        tier: "trial",
        tierLabel: "Free plan",
        statusLabel: "Upgrade available",
        statusVariant: "secondary",
        daysRemaining: undefined,
        isUpgraded: false,
      };
    case "pro":
      return {
        tier: "extended",
        tierLabel: "Pro",
        statusLabel: "Active",
        statusVariant: "outline",
        daysRemaining: undefined,
        isUpgraded: true,
      };
    case "business":
      return {
        tier: "enterprise",
        tierLabel: "Business",
        statusLabel: "Active",
        statusVariant: "outline",
        daysRemaining: undefined,
        isUpgraded: true,
      };
    default:
      return licenseFromPlan("free");
  }
}
