import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  const { images, instagramUrl } = await request.json();

  const content = [];

  if (images && images.length > 0) {
    images.forEach(img => {
      content.push({ type:"image", source:{ type:"base64", media_type: img.mimeType, data: img.data } });
    });
  }

  content.push({
    type: "text",
    text: `Analiza este contenido de Instagram${instagramUrl ? " de " + instagramUrl : ""} y extrae el Brand Profile de esta creadora.

Analiza el estilo visual, tono de voz, audiencia objetivo, tipo de contenido y propuesta de valor.

Responde SOLO JSON puro sin backticks:
{
  "profile": {
    "nombre": "nombre de la cuenta o marca",
    "descripcion": "descripcion de quien es y que hace (2-3 oraciones)",
    "audiencia": "descripcion de la audiencia objetivo",
    "tono": "uno de: Empoderador, Cercano, Profesional, Divertido, Inspiracional, Educativo",
    "idioma": "uno de: Español, Inglés, Spanglish",
    "categorias": ["categoria1", "categoria2"],
    "propuestaValor": "propuesta de valor unica en una oracion"
  }
}`
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role:"user", content }],
  });

  const text = message.content[0].text;
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const data = JSON.parse(clean);
  return Response.json(data);
}