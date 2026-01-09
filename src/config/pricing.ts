/**
 * Stripe Pricing Configuration
 *
 * Uses Vercel environment variables to determine Test vs Live mode.
 * - Preview deployments use Test Stripe keys (safe for testing)
 * - Production deployments use Live Stripe keys (real payments)
 */

// Determine environment using Vercel's environment variable
// NEXT_PUBLIC_VERCEL_ENV: 'production' | 'preview' | 'development'
// This prevents Preview deployments from accidentally using Live keys
const APP_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV;
const isLive = APP_ENV === "production";

// Stripe Price IDs - replace with your actual IDs from Stripe Dashboard
// Test mode IDs for development/preview, Live mode IDs for production
export const PRICING_CONFIG = {
  solo: {
    name: "Solo",
    monthly: {
      priceId: isLive
        ? "price_live_solo_monthly"
        : "price_1SiMWsAKLIiL9hdweoTnH17A",
      price: 49,
    },
    annual: {
      priceId: isLive ? "price_live_solo_annual" : "price_1SiMpmAKLIiL9hdwhhn1dAVG",
      price: 490,
    },
    lifetime: {
      priceId: isLive
        ? "price_live_solo_lifetime"
        : "price_1SnWcwAKLIiL9hdw5dyMAIfw",
      price: 299,
    },
  },
  pro: {
    name: "Pro",
    monthly: {
      priceId: isLive ? "price_live_pro_monthly" : "price_1SiMYgAKLIiL9hdwZLjLUOPm",
      price: 99,
    },
    annual: {
      priceId: isLive ? "price_live_pro_annual" : "price_1SiMqMAKLIiL9hdwj1EgfQMs",
      price: 990,
    },
    lifetime: {
      priceId: isLive ? "price_live_pro_lifetime" : "price_1SnWdSAKLIiL9hdwRH0bMHtw",
      price: 499,
    },
  },
  team: {
    name: "Team",
    monthly: {
      priceId: isLive ? "price_live_team_monthly" : "price_1SiMZvAKLIiL9hdw8LAIvjrS",
      price: 199,
    },
    annual: {
      priceId: isLive ? "price_live_team_annual" : "price_1SiMrJAKLIiL9hdwF8xq4poz",
      price: 1990,
    },
    // Team has no lifetime option
  },
} as const;

export type PlanType = keyof typeof PRICING_CONFIG;
export type BillingCycle = "monthly" | "annual" | "lifetime";

/**
 * Get Stripe Price ID for a plan/billing combination
 */
export function getPriceId(
  plan: PlanType,
  billing: BillingCycle
): string | null {
  const planConfig = PRICING_CONFIG[plan];
  if (!planConfig) return null;

  // Type-safe access to billing options
  if (billing === "monthly" && "monthly" in planConfig) {
    return planConfig.monthly.priceId;
  }
  if (billing === "annual" && "annual" in planConfig) {
    return planConfig.annual.priceId;
  }
  if (billing === "lifetime" && "lifetime" in planConfig) {
    return (planConfig as typeof PRICING_CONFIG.solo).lifetime.priceId;
  }

  return null;
}

/**
 * Check if billing cycle is a one-time payment (lifetime)
 */
export function isOneTimePayment(billing: BillingCycle): boolean {
  return billing === "lifetime";
}

/**
 * Get current Stripe mode for debugging/display
 */
export function getStripeMode(): "live" | "test" {
  return isLive ? "live" : "test";
}

/**
 * Get price amount for a plan/billing combination
 */
export function getPriceAmount(
  plan: PlanType,
  billing: BillingCycle
): number | null {
  const planConfig = PRICING_CONFIG[plan];
  if (!planConfig) return null;

  // Type-safe access to billing options
  if (billing === "monthly" && "monthly" in planConfig) {
    return planConfig.monthly.price;
  }
  if (billing === "annual" && "annual" in planConfig) {
    return planConfig.annual.price;
  }
  if (billing === "lifetime" && "lifetime" in planConfig) {
    return (planConfig as typeof PRICING_CONFIG.solo).lifetime.price;
  }

  return null;
}
