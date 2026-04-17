import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

async function fetchWebContent(url) {
  try {
    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      url = "https://" + url;
    }
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AiStudioBrand/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Extract meaningful text: strip tags, scripts, styles
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3000); // Limit to ~3000 chars to avoid token bloat
    return cleaned || null;
  } catch (e) {
    console.error("fetchWebContent error for " + url + ":", e.message);
    return null;
  }
}

export async function POST(request) {
  try {
    const { images, instagramUrl, tiktokUrl, webUrl, sources } = await request.json();

    const content = [];

    // Screenshots (vision)
    if (images && images.length > 0) {
      images.forEach(img => {
        content.push({ type: "image", source: { type: "base64", media_type: img.mimeType, data: img.data } });
      });
    }

    // Fetch web page content if selected
    let webContent = null;
    if (sources && sources.includes("web") && webUrl) {
      console.log("Fetching web content from:", webUrl);
      webContent = await fetchWebContent(webUrl);
      if (webContent) {
        console.log("Web content fetched:", webContent.substring(0, 100) + "...");
      }
    }

    // Build analysis context
    const sourcesInfo = [];
    if (instagramUrl) sourcesInfo.push("Instagram: " + instagramUrl);
    if (tiktokUrl) sourcesInfo.push("TikTok: " + tiktokUrl);
    if (webUrl) sourcesInfo.push("Web: " + webUrl);
    if (images && images.length > 0) sourcesInfo.push(images.length + " screenshots de posts adjuntos (analízalos visualmente)");

    const webBlock = webContent
      ? "\n\nCONTENIDO EXTRAÍDO DE LA WEB (" + webUrl + "):\n" + webContent
      : "";

    content.push({
      type: "text",
      text: `Analiza esta marca y extrae su Brand Profile completo.

FUENTES DISPONIBLES:
${sourcesInfo.length > 0 ? sourcesInfo.map(s => "- " + s).join("\n") : "- Sin fuentes específicas"}
${webBlock}

Analiza en profundidad:
- Estilo visual: colores dominantes, composición, filtros, estética general (de screenshots si hay)
- Tono de voz: cómo habla, qué evita, frases recurrentes
- Audiencia objetivo: quién le sigue y a quién le habla
- Tipo de contenido y propuesta de valor
- Personalidad de marca: voz, actitud, manera de comunicar
- Si hay contenido de la web, usa esa información para enriquecer la descripción y propuesta de valor

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
}`,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content }],
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
