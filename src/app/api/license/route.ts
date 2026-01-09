import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export interface License {
  plan: "free" | "solo" | "pro" | "team";
  billing: "monthly" | "annual" | "lifetime" | null;
  status: "active" | "cancelled" | "past_due" | null;
  scansRemaining: number;
  scansUsed: number;
  stripeCustomerId: string | null;
  expiresAt: string | null;
}

// Default license for unauthenticated or error states
const DEFAULT_LICENSE: License = {
  plan: "free",
  billing: null,
  status: null,
  scansRemaining: 3,
  scansUsed: 0,
  stripeCustomerId: null,
  expiresAt: null,
};

export async function GET() {
  try {
    const { userId, getToken } = await auth();

    // Unauthenticated users get free license
    if (!userId) {
      return NextResponse.json(DEFAULT_LICENSE);
    }

    // Get Clerk JWT token for backend authentication
    const token = await getToken();

    if (!token) {
      console.error("Failed to get Clerk token for user:", userId);
      return NextResponse.json(DEFAULT_LICENSE);
    }

    // Securely call Backend with token forwarding
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      console.error("NEXT_PUBLIC_API_URL not configured");
      return NextResponse.json(DEFAULT_LICENSE);
    }

    const res = await fetch(`${backendUrl}/api/licenses/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Don't cache - always fetch fresh license data
      cache: "no-store",
    });

    if (!res.ok) {
      // Log error but don't expose to client
      console.error(
        `Backend license fetch failed: ${res.status} ${res.statusText}`
      );

      // If backend is down or returns error, fallback to free
      // This prevents dashboard from breaking
      return NextResponse.json(DEFAULT_LICENSE);
    }

    const licenseData = await res.json();
    return NextResponse.json(licenseData);
  } catch (error) {
    console.error("License fetch error:", error);

    // Graceful degradation - return free license on any error
    return NextResponse.json(DEFAULT_LICENSE);
  }
}
