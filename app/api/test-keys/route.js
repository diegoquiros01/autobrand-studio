export async function GET() {
  const results = {};

  // Check Anthropic
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 5, messages: [{ role: "user", content: "hi" }] }),
    });
    results.anthropic = { status: res.status, ok: res.ok };
    if (!res.ok) results.anthropic.error = (await res.text()).substring(0, 100);
  } catch(e) { results.anthropic = { error: e.message }; }

  // Check Gemini
  try {
    const key = process.env.GEMINI_API_KEY || "";
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
    results.gemini = { status: res.status, ok: res.ok };
    if (!res.ok) results.gemini.error = (await res.text()).substring(0, 100);
  } catch(e) { results.gemini = { error: e.message }; }

  return Response.json(results);
}
