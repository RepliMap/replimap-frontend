"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PlanType, BillingCycle } from "@/config/pricing";

interface UpgradeButtonProps {
  plan: PlanType;
  billing: BillingCycle;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  disabled?: boolean;
}

export function UpgradeButton({
  plan,
  billing,
  children,
  variant = "default",
  className,
  disabled = false,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading || disabled}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
