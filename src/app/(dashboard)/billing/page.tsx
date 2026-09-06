import { Suspense } from "react";
import { BillingClient } from "@/features/billing/components/billing-client";

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingClient />
    </Suspense>
  );
}
