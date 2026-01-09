import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckoutStatus } from "./checkout-status";
import { DashboardContent } from "./dashboard-content";

// Force dynamic rendering - this page requires auth
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName =
    user.firstName || user.emailAddresses[0]?.emailAddress || "User";

  return (
    <div className="min-h-screen bg-background pt-20">
      <Suspense fallback={null}>
        <CheckoutStatus />
      </Suspense>
      <DashboardContent displayName={displayName} />
    </div>
  );
}
