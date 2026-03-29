import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { priceId, userId, email } = await request.json();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: process.env.NEXT_PUBLIC_SITE_URL + "/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.NEXT_PUBLIC_SITE_URL + "/pricing",
    customer_email: email,
    metadata: { userId: userId || "" },
  });

  return Response.json({ url: session.url });
}