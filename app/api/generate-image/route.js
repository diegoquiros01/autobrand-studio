import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  const { prompt, brandProfile } = await request.json();

  const brandContext = brandProfile
    ? "Brand: " + brandProfile.nombre + ". Tone: " + brandProfile.tono + ". Audience: " + brandProfile.audiencia + "."
    : "";

  const imagePrompt = "Create a professional Instagram post image. " + brandContext + " Concept: " + prompt + ". Style: clean composition, vibrant colors, professional photography, square 1:1 format, social media ready.";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: imagePrompt,
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return Response.json({
        image: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      });
    }
  }

  return Response.json({ error: "No image generated" }, { status: 500 });
}