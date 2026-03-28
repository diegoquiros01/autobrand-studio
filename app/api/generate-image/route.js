import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  const { prompt, brandProfile } = await request.json();

  const brandContext = brandProfile ? `
Marca: ${brandProfile.nombre}
Tono: ${brandProfile.tono}
Audiencia: ${brandProfile.audiencia}
` : "";

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: { responseModalities: ["image", "text"] }
  });

  const imagePrompt = `Create a professional Instagram post image.
${brandContext}
Concept: ${prompt}
Style: clean composition, vibrant colors, professional photography style, 
square format 1:1, social media ready, high quality.`;

  const result = await model.generateContent(imagePrompt);
  const response = await result.response;
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return Response.json({ 
        image: part.inlineData.data,
        mimeType: part.inlineData.mimeType
      });
    }
  }

  return Response.json({ error: "No image generated" }, { status: 500 });
}
