import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import {
  getPriceId,
  isOneTimePayment,
  PlanType,
  BillingCycle,
} from "@/config/pricing";
import { getAttributionForStripe } from "@/lib/tracking";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to continue" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const { plan, billing } = (await req.json()) as {
      plan: PlanType;
      billing: BillingCycle;
    };

    // Validate input
    if (!plan || !billing) {
      return NextResponse.json(
        { error: "Missing plan or billing cycle" },
        { status: 400 }
      );
    }

    // Get price ID from config
    const priceId = getPriceId(plan, billing);
    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan/billing combination: ${plan}/${billing}` },
        { status: 400 }
      );
    }

    const isOneTime = isOneTimePayment(billing);
    const customerEmail = user?.emailAddresses[0]?.emailAddress;

    // Get attribution data for analytics
    const attribution = getAttributionForStripe();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // URLs
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
      // Customer
      customer_email: customerEmail,
      // Metadata - passed to webhook
      metadata: {
        clerkUserId: userId,
        plan: plan,
        billing: billing,
        ...attribution,
      },
      // For subscriptions, add metadata to subscription too
      ...(!isOneTime && {
        subscription_data: {
          metadata: {
            clerkUserId: userId,
            plan: plan,
            billing: billing,
          },
        },
      }),
      // SaaS best practices
      allow_promotion_codes: true,
      tax_id_collection: { enabled: true },
      // Collect billing address for tax compliance
      billing_address_collection: "required",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
