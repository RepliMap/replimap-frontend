"use client";

import useSWR from "swr";

export interface License {
  plan: "free" | "solo" | "pro" | "team";
  billing: "monthly" | "annual" | "lifetime" | null;
  status: "active" | "cancelled" | "past_due" | null;
  scansRemaining: number;
  scansUsed: number;
  stripeCustomerId: string | null;
  expiresAt: string | null;
}

const fetcher = async (url: string): Promise<License> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`License fetch failed: ${res.status}`);
  }
  return res.json();
};

interface UseLicenseOptions {
  // Enable polling (e.g., after checkout)
  polling?: boolean;
  // Polling interval in milliseconds (default: 2000)
  pollingInterval?: number;
}

const DEFAULT_LICENSE: License = {
  plan: "free",
  billing: null,
  status: null,
  scansRemaining: 3,
  scansUsed: 0,
  stripeCustomerId: null,
  expiresAt: null,
};

export function useLicense(options: UseLicenseOptions = {}) {
  const { polling = false, pollingInterval = 2000 } = options;

  const { data, error, isLoading, mutate } = useSWR<License>(
    "/api/license",
    fetcher,
    {
      // Only poll during payment flow
      refreshInterval: polling ? pollingInterval : 0,

      // Only revalidate on focus during payment flow
      // This saves unnecessary backend requests
      revalidateOnFocus: polling,

      // Don't retry on error - graceful degradation
      shouldRetryOnError: false,

      // Keep previous data while revalidating
      keepPreviousData: true,

      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,
    }
  );

  const license = data || DEFAULT_LICENSE;
  const isPaidPlan = license.plan !== "free";

  return {
    license,
    isLoading,
    isError: !!error,
    mutate,
    isPaidPlan,
    // Expose error details for debugging
    errorDetails: error?.message,
  };
}
