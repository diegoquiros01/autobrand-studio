import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  const { prompt, brandProfile, referencias, talentos, editedCopy } = await request.json();

  const brandContext = brandProfile ? [
    "Brand: " + (brandProfile.nombre || ""),
    "Description: " + (brandProfile.descripcion || ""),
    "Audience: " + (brandProfile.audiencia || ""),
    "Tone: " + (brandProfile.tono || ""),
    "Language: " + (brandProfile.idioma || ""),
    "Value proposition: " + (brandProfile.propuestaValor || ""),
    brandProfile.categorias && brandProfile.categorias.length > 0 ? "Categories: " + brandProfile.categorias.join(", ") : "",
    brandProfile.idioma === "Spanglish" ? "IMPORTANT: The brand communicates in Spanglish — mix Spanish and English naturally." : "",
  ].filter(Boolean).join(" ") : "";

  const refContext = referencias && referencias.length > 0
    ? " Use the " + referencias.length + " reference image(s) provided as visual style inspiration."
    : "";

  const talentContext = talentos && talentos.length > 0
    ? " Include the " + talentos.length + " person(s) from the talent photo(s) naturally and prominently in the scene."
    : "";

  const copyContext = editedCopy
    ? " The post copy is: " + editedCopy.substring(0, 200)
    : "";

  const imagePrompt = [
    "Create a professional Instagram post image for a social media creator.",
    brandContext ? "BRAND DNA: " + brandContext : "",
    "CONCEPT: " + prompt + ".",
    copyContext ? "POST COPY CONTEXT: " + copyContext : "",
    refContext,
    talentContext,
    "STYLE REQUIREMENTS: Clean composition, vibrant colors, professional photography quality, square 1:1 format, social media ready, high quality. The image must feel authentic to the brand DNA described above.",
  ].filter(Boolean).join(" ");

  const contents = [{ text: imagePrompt }];

  if (referencias && referencias.length > 0) {
    referencias.forEach(ref => {
      contents.push({ inlineData: { data: ref.data, mimeType: ref.mimeType } });
    });
  }

  if (talentos && talentos.length > 0) {
    talentos.forEach(t => {
      contents.push({ inlineData: { data: t.data, mimeType: t.mimeType } });
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [{ role: "user", parts: contents }],
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