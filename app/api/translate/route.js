import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const maxDuration = 30;

export async function POST(request) {
  try {
    const { hook, copy, cta, hashtags, targetLang } = await request.json();
    if (!targetLang) return Response.json({ error: "missing targetLang" }, { status: 400 });

    const ALLOWED_LANGS = ["Español", "English", "Spanglish", "Spanish", "Inglés"];
    if (!ALLOWED_LANGS.includes(targetLang)) return Response.json({ error: "unsupported language" }, { status: 400 });

    const text = [hook, copy, cta, hashtags].filter(Boolean).join("\n---\n");

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Translate this Instagram post to ${targetLang}. Keep the same tone, style, emojis, and formatting. Return ONLY a JSON object with these fields: hook, copy, cta, hashtags. No extra text.

Original (separated by ---):
${text}

Return JSON only:`
      }],
    });

    const raw = msg.content[0]?.text || "";
    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Response.json({ success: true, translated: parsed });
    }
    return Response.json({ error: "Could not parse translation" }, { status: 500 });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
