import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  const { prompt, tipo, brandProfile } = await request.json();

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
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const data = JSON.parse(clean);
  return Response.json(data);
}
