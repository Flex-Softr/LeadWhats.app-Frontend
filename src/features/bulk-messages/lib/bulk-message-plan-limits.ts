import type { PlanId } from "@/types/billing";

/** Max custom + AI message contents per bulk TEXT campaign (mirrors backend). */
export function maxBulkMessageContentsForPlan(planId: PlanId): number {
  switch (planId) {
    case "pro":
      return 5;
    case "business":
      return 20;
    case "free":
    default:
      // 1 custom seed + 1 AI rewrite (mirrors backend).
      return 2;
  }
}
