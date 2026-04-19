import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "../../../lib/rateLimit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { allowed } = checkRateLimit(request, 5);
  if (!allowed) return Response.json({ error: "Demasiadas solicitudes. Espera un momento." }, { status: 429 });

  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: "Campos requeridos: name, email, message" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    // Sanitize inputs (strip HTML tags)
    const clean = (s) => s.replace(/<[^>]*>/g, "").slice(0, 2000);

    // Save to Supabase — create table if first time:
    // CREATE TABLE IF NOT EXISTS contact_messages (
    //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //   name TEXT, email TEXT, subject TEXT, message TEXT,
    //   created_at TIMESTAMPTZ DEFAULT now()
    // );
    await supabase.from("contact_messages").insert({
      name: clean(name),
      email: clean(email),
      subject: clean(subject || ""),
      message: clean(message),
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Error procesando mensaje" }, { status: 500 });
  }
}
