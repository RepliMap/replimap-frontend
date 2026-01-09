"use client";

import Link from "next/link";
import { useLicense } from "@/hooks/use-license";
import { UpgradeButton } from "@/components/upgrade-button";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardContentProps {
  displayName: string;
}

export function DashboardContent({ displayName }: DashboardContentProps) {
  const { license, isPaidPlan, isLoading } = useLicense();
  const [copied, setCopied] = useState(false);

  const copyLicenseKey = () => {
    navigator.clipboard.writeText("RM-XXXX-XXXX-XXXX-XXXX");
    setCopied(true);
    toast.success("License key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {displayName}
          </h1>
          <p className="text-muted-foreground">Your RepliMap Dashboard</p>
        </div>

        {license.stripeCustomerId && (
          <ManageBillingButton customerId={license.stripeCustomerId} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="font-semibold text-foreground mb-2">License</h3>
          <p className="text-2xl font-bold text-emerald-400 capitalize">
            {isLoading ? "..." : license.plan}
            {license.billing && ` (${license.billing})`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {license.plan === "free"
              ? `${license.scansRemaining} scans remaining`
              : "Unlimited scans"}
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="font-semibold text-foreground mb-2">Usage</h3>
          <p className="text-2xl font-bold text-foreground">
            {license.scansUsed} Scans
          </p>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="font-semibold text-foreground mb-2">Quick Start</h3>
          <code className="text-sm text-emerald-400 bg-slate-900 px-3 py-2 rounded block">
            pip install replimap
          </code>
        </div>
      </div>

      {/* Upgrade Section - Free users only */}
      {!isPaidPlan && !isLoading && (
        <div className="p-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Upgrade Your Plan
          </h3>
          <p className="text-muted-foreground mb-6">
            Unlock unlimited scans, Terraform export, and more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold">Solo</h4>
              <p className="text-2xl font-bold mt-1">
                $49
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              <UpgradeButton
                plan="solo"
                billing="monthly"
                className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600"
              >
                Upgrade
              </UpgradeButton>
            </div>

            <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Solo</h4>
                <span className="text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded font-medium">
                  LIFETIME
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">$299</p>
              <UpgradeButton
                plan="solo"
                billing="lifetime"
                className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600"
              >
                Buy Lifetime
              </UpgradeButton>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold">Pro</h4>
              <p className="text-2xl font-bold mt-1">
                $99
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              <UpgradeButton
                plan="pro"
                billing="monthly"
                variant="outline"
                className="w-full mt-3"
              >
                Upgrade
              </UpgradeButton>
            </div>

            <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Pro</h4>
                <span className="text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded font-medium">
                  LIFETIME
                </span>
              </div>
              <p className="text-2xl font-bold mt-1">$499</p>
              <UpgradeButton
                plan="pro"
                billing="lifetime"
                variant="outline"
                className="w-full mt-3"
              >
                Buy Lifetime
              </UpgradeButton>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            See all plans on the{" "}
            <Link href="/#pricing" className="text-emerald-400 hover:underline">
              pricing page
            </Link>
            .
          </p>
        </div>
      )}

      {/* License Key - Paid users only */}
      {isPaidPlan && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Your License Key
          </h3>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-emerald-400 bg-slate-900 px-4 py-3 rounded font-mono">
              RM-XXXX-XXXX-XXXX-XXXX
            </code>
            <Button variant="outline" size="sm" onClick={copyLicenseKey}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Activate:{" "}
            <code className="text-emerald-400">
              replimap license activate YOUR_KEY
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
