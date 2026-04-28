import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "../../../lib/rateLimit";

const client = new Anthropic();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIMITS = { free: 20, professional: 200, enterprise: 1000 };

async function getUserFeedbackContext(userId) {
  if (!userId) return "";
  const { data } = await supabase
    .from("generaciones")
    .select("rating, feedback_text, feedback_tags, tipo")
    .eq("user_id", userId)
    .not("rating", "is", null)
    .order("rated_at", { ascending: false })
    .limit(15);
  if (!data || data.length === 0) return "";

  const loved = data.filter(d => d.rating >= 4 && (d.feedback_text || (d.feedback_tags && d.feedback_tags.length > 0)));
  const disliked = data.filter(d => d.rating <= 2 && (d.feedback_text || (d.feedback_tags && d.feedback_tags.length > 0)));

  if (loved.length === 0 && disliked.length === 0) return "";

  let block = "\nAPRENDIZAJES DEL USUARIO (aplícalos al generar):";
  if (loved.length > 0) {
    block += "\nLo que le GUSTA:";
    loved.forEach(d => {
      const parts = [];
      if (d.feedback_text) parts.push(d.feedback_text);
      if (d.feedback_tags && d.feedback_tags.length > 0) parts.push("tags: " + d.feedback_tags.join(", "));
      block += "\n- " + (d.tipo ? "[" + d.tipo + "] " : "") + parts.join(" — ");
    });
  }
  if (disliked.length > 0) {
    block += "\nLo que NO le gusta (EVÍTALO):";
    disliked.forEach(d => {
      const parts = [];
      if (d.feedback_text) parts.push(d.feedback_text);
      if (d.feedback_tags && d.feedback_tags.length > 0) parts.push("tags: " + d.feedback_tags.join(", "));
      block += "\n- " + (d.tipo ? "[" + d.tipo + "] " : "") + parts.join(" — ");
    });
  }
  return block;
}

export async function POST(request) {
  const { allowed } = checkRateLimit(request, 20);
  if (!allowed) return Response.json({ error: "Demasiadas solicitudes. Espera un momento." }, { status: 429 });
  try {
    const { prompt, tipo, brandProfile, userId, idiomapieza } = await request.json();

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

    const bp = brandProfile || {};
    const brandContext = brandProfile ? `
ADN DE MARCA:
- Marca: ${bp.nombre || ""}
- Descripción: ${bp.descripcion || ""}
- Audiencia objetivo: ${bp.audiencia || ""}
- Tono de voz: ${bp.tono || ""}
- Idioma: ${bp.idioma || ""}
- Propuesta de valor única: ${bp.propuestaValor || ""}
${bp.categorias && bp.categorias.length > 0 ? "- Categorías de contenido: " + bp.categorias.join(", ") : ""}
${bp.personalidad ? "- Personalidad y voz: " + bp.personalidad : ""}
${bp.estiloVisual ? "- Estilo visual: " + bp.estiloVisual : ""}
${bp.ejemplosCopy && bp.ejemplosCopy.length > 0 ? "- Ejemplos de copy de referencia:\n" + bp.ejemplosCopy.filter(e => e).map((e, i) => '  ' + (i + 1) + '. "' + e + '"').join("\n") : ""}
${bp.idioma === "Spanglish" ? "IMPORTANTE: Esta marca habla en Spanglish — mezcla español e inglés de forma natural y auténtica, como lo haría una latina bicultural en EE.UU." : ""}
${bp.idioma === "Español" ? "IMPORTANTE: El ADN de esta marca es en español." : ""}
${bp.idioma === "Inglés" ? "IMPORTANT: This brand communicates in English." : ""}
INSTRUCCIÓN CLAVE: El copy debe sonar EXACTAMENTE como esta marca — usa su tono, personalidad y habla directamente a su audiencia específica. Si hay ejemplos de copy, imita ese estilo.
` : "";

    // Fetch user feedback learnings
    const feedbackContext = await getUserFeedbackContext(userId);

    const idiomaFinal = idiomapieza && idiomapieza !== "ADN" ? idiomapieza : (bp.idioma || "Español");
    const idiomaInstruccion =
      idiomaFinal === "Español" ? "INSTRUCCIÓN OBLIGATORIA: Todo el copy DEBE estar en español. Sin excepciones." :
      idiomaFinal === "Inglés" ? "MANDATORY INSTRUCTION: All copy MUST be in English. No exceptions." :
      idiomaFinal === "Spanglish" ? "INSTRUCCIÓN OBLIGATORIA: El copy DEBE estar en Spanglish — mezcla natural de español e inglés como hablan las latinas biculturales en EE.UU." :
      "INSTRUCCIÓN OBLIGATORIA: Todo el copy DEBE estar en español.";

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Eres experto en marketing para redes sociales.

${brandContext}
${feedbackContext}

Genera 3 propuestas de Instagram tipo "${tipo}" para: "${prompt}"

${idiomaInstruccion}

Cada propuesta: hook (1 linea), copy (maximo 80 palabras), cta (1 linea), hashtags (6-8 hashtags relevantes separados por espacios).

Responde SOLO JSON puro sin backticks:
{"propuestas":[{"id":1,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"},{"id":2,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"},{"id":3,"hook":"...","copy":"...","cta":"...","hashtags":"#tag1 #tag2 #tag3"}]}`,
        },
      ],
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(clean);
    return Response.json(data);
  } catch (e) {
    console.error("generate error:", e);
    return Response.json({ error: "Error generando copies: " + e.message }, { status: 500 });
  }
}
