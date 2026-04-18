import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { priceId, userId, email } = await request.json();

    // Verify userId exists in DB if provided
    if (userId) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).single();
      if (!profile) {
        return Response.json({ error: "Usuario no válido" }, { status: 401 });
      }
    }

    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.NEXT_PUBLIC_SITE_URL + "/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL + "/pricing",
      metadata: { userId: userId || "" },
    };

    if (email) sessionParams.customer_email = email;

    const session = await stripe.checkout.sessions.create(sessionParams);
    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json({ error: "Error al crear sesión de pago" }, { status: 500 });
  }
}