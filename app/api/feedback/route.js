import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Save feedback for a piece
export async function POST(request) {
  try {
    const { generacionId, rating, feedbackText, feedbackTags } = await request.json();

    if (!generacionId || !rating || rating < 1 || rating > 5) {
      return Response.json({ error: "generacionId and rating (1-5) required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("generaciones")
      .update({
        rating,
        feedback_text: feedbackText || null,
        feedback_tags: feedbackTags && feedbackTags.length > 0 ? feedbackTags : null,
        rated_at: new Date().toISOString(),
      })
      .eq("id", generacionId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// Get recent feedback for a user (used to inject into generation prompts)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("generaciones")
      .select("rating, feedback_text, feedback_tags, tipo, prompt")
      .eq("user_id", userId)
      .not("rating", "is", null)
      .order("rated_at", { ascending: false })
      .limit(15);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Build a summary for prompt injection
    const loved = data.filter(d => d.rating >= 4);
    const disliked = data.filter(d => d.rating <= 2);

    const summary = {
      totalRated: data.length,
      lovedPatterns: loved.map(d => ({
        feedback: d.feedback_text,
        tags: d.feedback_tags,
        tipo: d.tipo,
      })).filter(d => d.feedback || (d.tags && d.tags.length > 0)),
      dislikedPatterns: disliked.map(d => ({
        feedback: d.feedback_text,
        tags: d.feedback_tags,
        tipo: d.tipo,
      })).filter(d => d.feedback || (d.tags && d.tags.length > 0)),
    };

    return Response.json({ feedback: data, summary });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
