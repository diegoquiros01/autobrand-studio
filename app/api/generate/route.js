import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIMITS = { free: 20, professional: 200, enterprise: 1000 };

export async function POST(request) {
  const { prompt, tipo, brandProfile, userId } = await request.json();

  if (userId) {
    const mesActual = new Date().toISOString().slice(0, 7);
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, generaciones_mes, mes_actual")
      .eq("id", userId)
      .single();

    if (profile) {
      const genCount = profile.mes_actual === mesActual ? (profile.generaciones_mes || 0) : 0;
      const limit = LIMITS[profile.plan || "free"];
      if (genCount >= limit) {
        return Response.json({ error: "limit_reached", plan: profile.plan, limit }, { status: 403 });
      }
      const newCount = profile.mes_actual === mesActual ? genCount + 1 : 1;
      await supabase.from("profiles").update({
        generaciones_mes: newCount,
        mes_actual: mesActual,
      }).eq("id", userId);
    }
  }

  const brandContext = brandProfile ? `
MARCA: ${brandProfile.nombre}
DESCRIPCIÓN: ${brandProfile.descripcion}
AUDIENCIA: ${brandProfile.audiencia}
TONO: ${brandProfile.tono}
IDIOMA: ${brandProfile.idioma}
PROPUESTA DE VALOR: ${brandProfile.propuestaValor}
${brandProfile.idioma === "Spanglish" ? "IMPORTANTE: Mezcla español e inglés naturalmente." : ""}
` : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Eres experto en marketing para redes sociales.

${brandContext}

Genera 5 propuestas de Instagram tipo "${tipo}" para: "${prompt}"

Cada propuesta: hook (1 linea), copy (maximo 80 palabras), cta (1 linea), hashtags (6-8 hashtags relevantes separados por espacios).

Responde SOLO JSON puro sin backticks:
{"propuestas":[{"id":1,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"},{"id":2,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"},{"id":3,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"},{"id":4,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"},{"id":5,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"}]}`,
      },
    ],
  });

  const text = message.content[0].text;
  const clean = text.replace(/```json
?/g, "").replace(/```
?/g, "").trim();
  const data = JSON.parse(clean);
  return Response.json(data);
}