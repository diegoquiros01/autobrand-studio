import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, prompt, tipo, copy, imageBase64, mimeType } = await request.json();
    
    if (!userId || !imageBase64) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    const byteCharacters = Buffer.from(imageBase64, "base64");
    const ext = (mimeType || "image/png").split("/")[1] || "png";
    const fileName = userId + "/resultados/" + Date.now() + "." + ext;

    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(fileName, byteCharacters, {
        contentType: mimeType || "image/png",
        upsert: true
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return Response.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: insertError } = await supabase.from("generaciones").insert({
      user_id: userId,
      prompt: prompt,
      tipo: tipo,
      propuestas: [copy],
      imagen_url: fileName,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ success: true, fileName });
  } catch(e) {
    console.error("guardar-pieza error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}