"use client";

import { Suspense } from "react";
import { InviteCallbackForm } from "@/components/auth/InviteCallbackForm";
import { FullPageLoader } from "@/components/ui/loader";

export default function InviteCallbackPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <InviteCallbackForm />
    </Suspense>
  );
}
