import { Suspense } from "react";

import { BillingSuccessClient } from "@/features/billing/components/billing-success-client";

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md py-16 text-center text-sm text-muted-foreground">
          Confirming your subscription…
        </div>
      }
    >
      <BillingSuccessClient />
    </Suspense>
  );
}
