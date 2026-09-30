import { NextResponse } from "next/server";
import { getPaddle } from "@/lib/paddle";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/subscription";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Subscription>();

  if (!subscription?.paddle_customer_id || !subscription.paddle_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  try {
    const paddle = getPaddle();
    const session = await paddle.customerPortalSessions.create(
      subscription.paddle_customer_id,
      [subscription.paddle_subscription_id],
    );
    return NextResponse.json({ url: session.urls.general.overview });
  } catch (err) {
    console.error("[/api/paddle/portal]", err);
    return NextResponse.json({ error: "portal_failed" }, { status: 502 });
  }
}
