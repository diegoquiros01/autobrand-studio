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

// Sanitize tono — unwrap nested JSON strings to get clean value
function sanitizeTono(tono) {
  if (!tono) return "";
  let val = tono;
  // Unwrap nested JSON strings
  for (let i = 0; i < 20; i++) {
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        val = parsed;
      } catch(e) { break; }
    } else { break; }
  }
  // At this point val should be a clean string or array
  if (Array.isArray(val)) {
    // Recursively clean array elements
    return val.map(v => sanitizeTono(v)).filter(Boolean).join(", ");
  }
  return typeof val === "string" ? val : "";
}

// POST: save/update brand profile
export async function POST(request) {
  try {
    const { brandId, userId, payload, forceNew } = await request.json();
    if (!userId || !payload) return Response.json({ error: "missing data" }, { status: 400 });
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) return Response.json({ error: "invalid userId" }, { status: 400 });

    // Sanitize tono to prevent nested JSON corruption
    if (payload.tono) {
      payload.tono = sanitizeTono(payload.tono);
    }
    // Log payload for debugging (temporary)
    console.log("brands POST:", { brandId, userId, forceNew, payloadKeys: Object.keys(payload), tono: payload.tono, tonoType: typeof payload.tono });

    if (brandId) {
      // Update existing
      const { error } = await supabase.from("brand_profiles").update(payload).eq("id", brandId);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ success: true, brandId });
    } else if (forceNew) {
      // Force create new brand (for ?new=true flow)
      const { data: inserted, error } = await supabase.from("brand_profiles").insert({ ...payload, user_id: userId }).select("id").single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ success: true, brandId: inserted.id });
    } else {
      // No brandId, no forceNew — find existing or create
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
    return Response.json({ error: e.message, stack: e.stack?.split('\n')[0] }, { status: 500 });
  }
}
