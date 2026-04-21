import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: list brands for user
export async function GET(request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const brandId = url.searchParams.get("brandId");
  if (!userId && !brandId) return Response.json({ error: "missing userId or brandId" });

  if (brandId) {
    // Load full brand profile by ID
    const { data, error } = await supabase.from("brand_profiles").select("*").eq("id", brandId).maybeSingle();
    return Response.json({ brand: data, error: error?.message || null });
  }

  // List all brands for user
  const { data, error } = await supabase.from("brand_profiles").select("id, nombre, tono, idioma").eq("user_id", userId);
  return Response.json({ data, error: error?.message || null, count: data?.length || 0 });
}

// POST: save/update brand profile
export async function POST(request) {
  try {
    const { brandId, userId, payload } = await request.json();
    if (!userId || !payload) return Response.json({ error: "missing data" }, { status: 400 });

    if (brandId) {
      // Update existing
      const { error } = await supabase.from("brand_profiles").update(payload).eq("id", brandId);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ success: true, brandId });
    } else {
      // Check if user already has a profile
      const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", userId).limit(1);
      if (existing && existing.length > 0) {
        const { error } = await supabase.from("brand_profiles").update(payload).eq("id", existing[0].id);
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ success: true, brandId: existing[0].id });
      } else {
        const { data: inserted, error } = await supabase.from("brand_profiles").insert({ ...payload, user_id: userId }).select("id").single();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ success: true, brandId: inserted.id });
      }
    }
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
