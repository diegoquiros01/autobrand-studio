import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 120;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIMITS = { free: 20, professional: 200, enterprise: 1000 };

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const claude = new Anthropic();

// ─── STEP 1: Claude generates visual brief ───
async function generateVisualBrief(prompt, brandProfile, referencias, talentos, editedCopy, idiomapieza, feedback, formato) {
  const bp = brandProfile || {};
  const brandBlock = [
    bp.nombre ? "Brand: " + bp.nombre : "",
    bp.descripcion ? "Description: " + bp.descripcion : "",
    bp.audiencia ? "Target audience: " + bp.audiencia : "",
    bp.tono ? "Tone of voice: " + bp.tono : "",
    bp.idioma ? "Language: " + bp.idioma : "",
    bp.propuestaValor ? "Value proposition: " + bp.propuestaValor : "",
    bp.categorias && bp.categorias.length > 0 ? "Content categories: " + bp.categorias.join(", ") : "",
    bp.personalidad ? "Brand personality: " + bp.personalidad : "",
    bp.colores_marca && bp.colores_marca.length > 0 ? "Brand colors: " + bp.colores_marca.join(", ") : "",
    bp.estilo_visual ? "Visual style: " + bp.estilo_visual : "",
  ].filter(Boolean).join("\n");

  const idiomaText = idiomapieza && idiomapieza !== "ADN"
    ? idiomapieza
    : (bp.idioma || "Español");

  const content = [];

  // Send reference images to Claude (vision) so it can describe them in the brief
  if (referencias && referencias.length > 0) {
    referencias.forEach(ref => {
      content.push({
        type: "image",
        source: { type: "base64", media_type: ref.mimeType, data: ref.data },
      });
    });
  }

  // Send talent photos to Claude (vision) so it can describe the people
  if (talentos && talentos.length > 0) {
    talentos.forEach(t => {
      content.push({
        type: "image",
        source: { type: "base64", media_type: t.mimeType, data: t.data },
      });
    });
  }

  const refNote = referencias && referencias.length > 0
    ? "I've attached " + referencias.length + " reference image(s). Analyze their visual style, colors, composition, and mood — the generated image should match this aesthetic."
    : "No reference images provided. Base the visual style on the brand DNA.";

  const talentNote = talentos && talentos.length > 0
    ? "I've attached " + talentos.length + " talent photo(s). Describe these people precisely (appearance, features, clothing) and place them naturally and prominently in the scene."
    : "No talent photos. The image should not include specific people unless the concept requires generic silhouettes.";

  const feedbackNote = feedback
    ? "\n\nPREVIOUS ATTEMPT FEEDBACK: " + feedback + "\nAdjust the brief to address these issues."
    : "";

  const copyNote = editedCopy
    ? "\nPost copy context: " + editedCopy.substring(0, 200)
    : "";

  content.push({
    type: "text",
    text: `You are an expert Art Director for social media brands. Create a detailed visual brief IN ENGLISH for an AI image generator (Gemini).

BRAND DNA:
${brandBlock}

CREATOR'S CONCEPT: ${prompt}
${copyNote}

${refNote}

${talentNote}

FORMAT: ${formato === "story" ? "Vertical 9:16 (Instagram Story/Reels)" : formato === "carousel" ? "Square 1:1 (Instagram carousel slide)" : "Square 1:1 (Instagram feed post)"}
LANGUAGE FOR TEXT OVERLAYS: ${idiomaText}
${feedbackNote}

Your brief MUST specify:
1. COMPOSITION: Exact layout, element placement, visual hierarchy, background
2. COLOR PALETTE: Specific colors aligned with the brand (use brand colors if provided, or derive from references)
3. PHOTOGRAPHY STYLE: Lighting, camera angle, depth of field, mood, texture
4. TALENT: If talent photos provided, describe exactly how to incorporate them (pose, position, expression)
5. TEXT OVERLAY: If applicable, what text to include, placement, and style
6. FORMAT: Use the FORMAT specified above, Instagram-optimized, content within safe zones
7. DO NOT INCLUDE: List 3-5 things to explicitly avoid (common AI mistakes: extra fingers, distorted text, logo errors, etc.)

Respond with ONLY pure JSON, no backticks:
{"brief": "the complete visual brief as one detailed paragraph in English", "style_notes": "additional style directives and things to avoid as one paragraph"}`,
  });

  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content }],
  });

  const text = message.content[0].text;
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

// ─── STEP 2: Gemini generates image from brief ───
async function generateImageFromBrief(brief, styleNotes, referencias, talentos, retryWithoutRefs) {
  const imagePrompt = [
    "Create a professional Instagram post image. Square 1:1 format, high resolution, social media ready.",
    "",
    "VISUAL BRIEF:",
    brief,
    "",
    "STYLE DIRECTIVES:",
    styleNotes,
  ].join("\n");

  const contents = [{ text: imagePrompt }];

  if (!retryWithoutRefs && referencias && referencias.length > 0) {
    referencias.forEach(ref => {
      contents.push({ inlineData: { data: ref.data, mimeType: ref.mimeType } });
    });
  }

  if (talentos && talentos.length > 0) {
    talentos.forEach(t => {
      contents.push({ inlineData: { data: t.data, mimeType: t.mimeType } });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [{ role: "user", parts: contents }],
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { image: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }
    return null;
  } catch (err) {
    console.error("Gemini error" + (retryWithoutRefs ? " (retry)" : "") + ":", err.message);
    // If first attempt with refs failed, retry without refs
    if (!retryWithoutRefs && referencias && referencias.length > 0) {
      console.log("Retrying Gemini without reference images...");
      return generateImageFromBrief(brief, styleNotes, null, talentos, true);
    }
    return null;
  }
}

// ─── STEP 3: Claude validates the generated image ───
async function validateImage(imageBase64, imageMimeType, brief, brandProfile) {
  const bp = brandProfile || {};
  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: imageMimeType, data: imageBase64 },
        },
        {
          type: "text",
          text: `You are a brand quality control specialist reviewing an AI-generated image for Instagram.

Brand: ${bp.nombre || "Unknown"} | Tone: ${bp.tono || "N/A"} | Audience: ${bp.audiencia || "N/A"}

Original visual brief: ${brief}

Evaluate this image on:
- Brand alignment (does it match the brand's identity?)
- Composition quality (clean, professional, Instagram-ready?)
- Concept accuracy (does it match what was requested?)
- Technical quality (no artifacts, distortions, or AI errors?)

Score 1-10 overall. Approve if score >= 6.

Respond with ONLY pure JSON, no backticks:
{"approved": true, "score": 8, "issues": "brief description of any problems", "suggested_adjustments": "what to change in the brief for a better result"}`,
        },
      ],
    }],
  });

  const text = message.content[0].text;
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Legacy fallback prompt (used if Claude brief fails) ───
function buildLegacyPrompt(prompt, brandProfile, referencias, talentos, editedCopy, idiomapieza) {
  const bp = brandProfile || {};
  const brandContext = [
    "Brand: " + (bp.nombre || ""),
    "Description: " + (bp.descripcion || ""),
    "Audience: " + (bp.audiencia || ""),
    "Tone: " + (bp.tono || ""),
    "Language: " + (bp.idioma || ""),
    "Value proposition: " + (bp.propuestaValor || ""),
    bp.categorias && bp.categorias.length > 0 ? "Categories: " + bp.categorias.join(", ") : "",
  ].filter(Boolean).join(" ");

  return [
    "Create a professional Instagram post image for a social media creator.",
    brandContext ? "BRAND DNA: " + brandContext : "",
    "CONCEPT: " + prompt + ".",
    editedCopy ? "POST COPY CONTEXT: " + editedCopy.substring(0, 200) : "",
    referencias && referencias.length > 0 ? " Use the " + referencias.length + " reference image(s) as visual style inspiration." : "",
    talentos && talentos.length > 0 ? " Include the " + talentos.length + " person(s) from the talent photo(s) naturally." : "",
    formato === "story" ? "FORMAT: Vertical 9:16 for Instagram Stories/Reels." : "FORMAT: Square 1:1 for Instagram feed.",
    "STYLE: Clean composition, vibrant colors, professional photography, social media ready.",
    idiomapieza ? "TEXT IN IMAGE (if any): Use " + idiomapieza + "." : "",
  ].filter(Boolean).join(" ");
}

// ─── Main handler ───
export async function POST(request) {
  const { prompt, brandProfile, referencias, talentos, editedCopy, userId, idiomapieza, formato } = await request.json();
  console.log("=== ART DIRECTOR PIPELINE ===");
  console.log("Prompt:", prompt?.substring(0, 100));
  console.log("Brand:", brandProfile?.nombre);
  console.log("Refs:", referencias?.length || 0, "| Talent:", talentos?.length || 0);

  // ─── Rate limiting (unchanged) ───
  if (userId) {
    const mesActual = new Date().toISOString().slice(0, 7);
    const { data: profile } = await supabase.from("profiles").select("plan, generaciones_mes, mes_actual").eq("id", userId).single();
    if (profile) {
      const genCount = profile.mes_actual === mesActual ? (profile.generaciones_mes || 0) : 0;
      const limit = LIMITS[profile.plan || "free"];
      if (genCount >= limit) {
        return Response.json({ error: "limit_reached", plan: profile.plan, limit }, { status: 403 });
      }
      await supabase.from("profiles").update({
        generaciones_mes: profile.mes_actual === mesActual ? genCount + 1 : 1,
        mes_actual: mesActual,
      }).eq("id", userId);
    }
  }

  // ─── STEP 1: Generate visual brief with Claude ───
  let briefResult = null;
  let usedLegacy = false;
  try {
    console.log("STEP 1: Generating visual brief with Claude...");
    const t1 = Date.now();
    briefResult = await generateVisualBrief(prompt, brandProfile, referencias, talentos, editedCopy, idiomapieza, null, formato);
    console.log("STEP 1 done (" + (Date.now() - t1) + "ms). Brief:", briefResult.brief?.substring(0, 150));
  } catch (err) {
    console.error("STEP 1 failed, using legacy prompt:", err.message);
    usedLegacy = true;
  }

  // ─── STEP 2: Generate image with Gemini ───
  console.log("STEP 2: Generating image with Gemini...");
  const t2 = Date.now();
  let imageResult;

  if (usedLegacy) {
    // Fallback: use legacy prompt directly with Gemini
    const legacyPrompt = buildLegacyPrompt(prompt, brandProfile, referencias, talentos, editedCopy, idiomapieza);
    imageResult = await generateImageFromBrief(legacyPrompt, "", referencias, talentos, false);
  } else {
    imageResult = await generateImageFromBrief(briefResult.brief, briefResult.style_notes, referencias, talentos, false);
  }

  console.log("STEP 2 done (" + (Date.now() - t2) + "ms). Got image:", !!imageResult);

  if (!imageResult) {
    return Response.json({ error: "No image generated" }, { status: 500 });
  }

  // ─── STEP 3: Validate image with Claude ───
  if (!usedLegacy) {
    try {
      console.log("STEP 3: Validating image with Claude...");
      const t3 = Date.now();
      const validation = await validateImage(imageResult.image, imageResult.mimeType, briefResult.brief, brandProfile);
      console.log("STEP 3 done (" + (Date.now() - t3) + "ms). Score:", validation.score, "Approved:", validation.approved);

      if (!validation.approved || validation.score < 6) {
        console.log("Image rejected. Issues:", validation.issues);
        console.log("RETRY: Generating adjusted brief...");
        try {
          const adjustedBrief = await generateVisualBrief(
            prompt, brandProfile, referencias, talentos, editedCopy, idiomapieza,
            "Previous attempt issues: " + validation.issues + ". Adjustments needed: " + validation.suggested_adjustments,
            formato
          );
          console.log("RETRY: Regenerating image...");
          const retryResult = await generateImageFromBrief(adjustedBrief.brief, adjustedBrief.style_notes, referencias, talentos, false);
          if (retryResult) {
            imageResult = retryResult;
            console.log("RETRY: Success, using new image");
          }
        } catch (retryErr) {
          console.error("RETRY failed, using original image:", retryErr.message);
        }
      }
    } catch (valErr) {
      console.error("STEP 3 failed, skipping validation:", valErr.message);
    }
  }

  return Response.json({ image: imageResult.image, mimeType: imageResult.mimeType });
}
