import { NextRequest, NextResponse } from "next/server";
import { EventName, type SubscriptionNotification } from "@paddle/paddle-node-sdk";
import { getPaddle } from "@/lib/paddle";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/lib/subscription";

const SUBSCRIPTION_EVENTS = new Set([
  EventName.SubscriptionCreated,
  EventName.SubscriptionActivated,
  EventName.SubscriptionUpdated,
  EventName.SubscriptionCanceled,
  EventName.SubscriptionPastDue,
  EventName.SubscriptionPaused,
  EventName.SubscriptionResumed,
  EventName.SubscriptionTrialing,
]);

function mapPaddleStatus(status: SubscriptionNotification["status"]): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "paused":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "free";
  }
}

async function upsertFromSubscription(subscription: SubscriptionNotification) {
  const userId = subscription.customData?.user_id;
  if (!userId || typeof userId !== "string") {
    console.error(
      "[/api/paddle/webhook] subscription has no user_id in customData",
      subscription.id,
    );
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_customer_id: subscription.customerId,
      paddle_subscription_id: subscription.id,
      status: mapPaddleStatus(subscription.status),
      current_period_end: subscription.nextBilledAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paddle_customer_id" },
  );
  if (error) {
    console.error("[/api/paddle/webhook] upsert failed", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[/api/paddle/webhook] PADDLE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });
  }

  const signature = req.headers.get("paddle-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event;
  try {
    const paddle = getPaddle();
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error("[/api/paddle/webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    if (event && SUBSCRIPTION_EVENTS.has(event.eventType)) {
      await upsertFromSubscription(event.data as SubscriptionNotification);
    }
  } catch (err) {
    console.error(`[/api/paddle/webhook] failed handling ${event?.eventType}`, err);
    return NextResponse.json({ error: "webhook_handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
