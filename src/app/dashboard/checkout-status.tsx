"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLicense } from "@/hooks/use-license";
import { Loader2 } from "lucide-react";

export function CheckoutStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkout = searchParams.get("checkout");
  const plan = searchParams.get("plan");

  const [isActivating, setIsActivating] = useState(false);

  // Enable polling only after successful checkout
  const { license } = useLicense({
    polling: isActivating,
    pollingInterval: 2000,
  });

  useEffect(() => {
    if (checkout === "success") {
      setIsActivating(true);
      toast.loading("Activating your license...", { id: "activating" });
    } else if (checkout === "cancelled") {
      toast.info("Checkout cancelled");
      router.replace("/dashboard");
    }
  }, [checkout, router]);

  // Check if license has been activated
  useEffect(() => {
    if (isActivating && license.plan !== "free") {
      // License activated!
      setIsActivating(false);
      toast.dismiss("activating");
      toast.success(`Successfully upgraded to ${license.plan}!`, {
        duration: 5000,
      });
      router.replace("/dashboard");
    }
  }, [isActivating, license.plan, router]);

  // Timeout after 30 seconds
  useEffect(() => {
    if (!isActivating) return;

    const timeout = setTimeout(() => {
      setIsActivating(false);
      toast.dismiss("activating");
      toast.error(
        "License activation is taking longer than expected. Please refresh the page.",
        {
          duration: 10000,
        }
      );
      router.replace("/dashboard");
    }, 30000);

    return () => clearTimeout(timeout);
  }, [isActivating, router]);

  if (isActivating) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Activating Your License
          </h2>
          <p className="text-muted-foreground">
            Please wait while we set up your {plan} plan...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
