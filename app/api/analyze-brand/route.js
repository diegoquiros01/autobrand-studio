import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  try {
  const { images, instagramUrl } = await request.json();

  const content = [];

  if (images && images.length > 0) {
    images.forEach(img => {
      content.push({ type:"image", source:{ type:"base64", media_type: img.mimeType, data: img.data } });
    });
  }

  content.push({
    type: "text",
    text: `Analiza este contenido de Instagram${instagramUrl ? " de " + instagramUrl : ""} y extrae el Brand Profile completo de esta creadora.

Analiza en profundidad:
- Estilo visual: colores dominantes, composición, filtros, estética general
- Tono de voz: cómo habla, qué evita, frases recurrentes
- Audiencia objetivo: quién le sigue y a quién le habla
- Tipo de contenido y propuesta de valor
- Personalidad de marca: voz, actitud, manera de comunicar

Responde SOLO JSON puro sin backticks:
{
  "profile": {
    "nombre": "nombre de la cuenta o marca",
    "descripcion": "descripcion de quien es y que hace (2-3 oraciones)",
    "audiencia": "descripcion de la audiencia objetivo",
    "tono": "uno de: Empoderador, Cercano, Profesional, Divertido, Inspiracional, Educativo",
    "idioma": "uno de: Español, Inglés, Spanglish",
    "categorias": ["categoria1", "categoria2"],
    "propuestaValor": "propuesta de valor unica en una oracion",
    "personalidad": "descripcion detallada de como habla la marca, que evita, frases tipicas, actitud (2-3 oraciones)",
    "coloresMarca": ["#hex1", "#hex2", "#hex3"],
    "estiloVisual": "descripcion del estilo visual: composicion, filtros, estetica (1-2 oraciones)",
    "ejemplosCopy": ["ejemplo de texto tipico 1", "ejemplo de texto tipico 2", "ejemplo de texto tipico 3"]
  }
}`
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role:"user", content }],
  });

  const text = message.content[0].text;
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const data = JSON.parse(clean);
  return Response.json(data);
  } catch (e) {
    console.error("analyze-brand error:", e);
    return Response.json({ error: "Error analizando marca: " + e.message }, { status: 500 });
  }
}
