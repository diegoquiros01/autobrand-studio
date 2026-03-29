import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response("Webhook error: " + err.message, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      if (userId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0].price.id;
        const plan = priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID ? "professional" : "enterprise";
        await supabase.from("profiles").update({
          plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("id", userId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const { data: profile } = await supabase.from("profiles").select("id").eq("stripe_subscription_id", sub.id).single();
      if (profile) {
        const priceId = sub.items.data[0].price.id;
        const plan = priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID ? "professional" : "enterprise";
        await supabase.from("profiles").update({
          plan: sub.status === "active" ? plan : "free",
          plan_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("id", profile.id);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const { data: profile } = await supabase.from("profiles").select("id").eq("stripe_subscription_id", sub.id).single();
      if (profile) {
        await supabase.from("profiles").update({
          plan: "free",
          stripe_subscription_id: null,
          plan_expires_at: null,
        }).eq("id", profile.id);
      }
      break;
    }
  }

  return Response.json({ received: true });
}