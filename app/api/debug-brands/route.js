import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return Response.json({ error: "missing userId" });

  const { data, error } = await supabase.from("brand_profiles").select("id, nombre, tono, idioma").eq("user_id", userId);
  return Response.json({ data, error: error?.message || null, count: data?.length || 0 });
}
