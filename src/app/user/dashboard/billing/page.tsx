import { Suspense } from "react";

import { BillingClient } from "@/features/billing/components/billing-client";

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-16 text-center text-sm text-muted-foreground">
          Loading billing…
        </div>
      }
    >
      <BillingClient />
    </Suspense>
  );
}
