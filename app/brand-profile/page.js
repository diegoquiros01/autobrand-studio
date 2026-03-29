"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function BrandProfile() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    nombre: "",
    descripcion: "",
    audiencia: "",
    tono: "",
    idioma: "Español",
    categorias: [],
    propuestaValor: "",
  });

  const tonos = ["Empoderador", "Cercano", "Profesional", "Divertido", "Inspiracional", "Educativo"];
  const idiomas = ["Español", "Inglés", "Spanglish"];
  const cats = ["Coaching", "Lifestyle", "Moda", "Belleza", "Negocio", "Motivación", "Educación", "Fitness", "Recetas", "Familia"];

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from("brand_profiles").select("*").eq("user_id", user.id).single();
        if (data) {
          setProfile({
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            audiencia: data.audiencia || "",
            tono: data.tono || "",
            idioma: data.idioma || "Español",
            categorias: data.categorias || [],
            propuestaValor: data.propuesta_valor || "",
          });
          localStorage.setItem("brandProfile", JSON.stringify({
            nombre: data.nombre, descripcion: data.descripcion,
            audiencia: data.audiencia, tono: data.tono,
            idioma: data.idioma, categorias: data.categorias,
            propuestaValor: data.propuesta_valor,
          }));
        }
      } else {
        const saved = localStorage.getItem("brandProfile");
        if (saved) setProfile(JSON.parse(saved));
      }
      setLoading(false);
    };
    init();
  }, []);

  const toggleCat = (cat) => {
    setProfile(p => ({
      ...p,
      categorias: p.categorias.includes(cat)
        ? p.categorias.filter(c => c !== cat)
        : [...p.categorias, cat]
    }));
  };

  const guardar = async () => {
    setSaving(true);
    localStorage.setItem("brandProfile", JSON.stringify(profile));
    if (user) {
      const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", user.id).single();
      if (existing) {
        await supabase.from("brand_profiles").update({
          nombre: profile.nombre, descripcion: profile.descripcion,
          audiencia: profile.audiencia, tono: profile.tono,
          idioma: profile.idioma, categorias: profile.categorias,
          propuesta_valor: profile.propuestaValor,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      } else {
        await supabase.from("brand_profiles").insert({
          user_id: user.id, nombre: profile.nombre,
          descripcion: profile.descripcion, audiencia: profile.audiencia,
          tono: profile.tono, idioma: profile.idioma,
          categorias: profile.categorias, propuesta_valor: profile.propuestaValor,
        });
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/generar"), 1200);
  };

  const D = {
    bg:"#0D0D1F", bg2:"#111122", bg3:"rgba(255,255,255,0.04)",
    border:"rgba(255,255,255,0.08)", text:"#fff", text2:"rgba(255,255,255,0.55)",
    purple:"#7950F2", purpleLight:"#A78BFA",
  };

  const inp = { width:"100%", border:"1px solid " + D.border, borderRadius:8, padding:"10px 13px", fontSize:14, fontFamily:"Inter, sans-serif", background:"rgba(255,255,255,0.04)", color:D.text, outline:"none" };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:D.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:14, color:D.text2 }}>Cargando...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid " + D.border, background:D.bg2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:D.purple, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:D.text }}>Ai<span style={{ color:D.purpleLight }}>Studio</span>Brand</span>
        </div>
        <button style={{ marginLeft:"auto", fontSize:13, color:D.text2, background:"none", border:"none", cursor:"pointer" }} onClick={() => router.push("/generar")}>
          Volver al generador
        </button>
      </nav>

      <div style={{ maxWidth:660, margin:"0 auto", padding:"40px 24px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>Configuración</div>
          <h1 style={{ fontSize:28, fontWeight:500, color:D.text, letterSpacing:"-0.03em", marginBottom:8 }}>Brand Profile</h1>
          <p style={{ color:D.text2, fontSize:14 }}>
            {user ? "Tu perfil se guarda en tu cuenta y estará disponible en todos tus dispositivos." : "Inicia sesión para guardar tu perfil en todos tus dispositivos."}
          </p>
          {!user && (
            <button onClick={() => router.push("/login")} style={{ marginTop:10, padding:"7px 16px", background:D.purple, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>
              Iniciar sesión →
            </button>
          )}
        </div>

        <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:24, marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:500, color:D.text2, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Tu marca</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:6 }}>Nombre de tu marca o cuenta</label>
              <input style={inp} placeholder="Ej: @soyluciana.co" value={profile.nombre} onChange={e => setProfile(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:6 }}>Que haces? (2-3 oraciones)</label>
              <textarea style={{ ...inp, minHeight:80, resize:"none" }} placeholder="Ej: Soy coach de negocios para mujeres latinas en EE.UU..." value={profile.descripcion} onChange={e => setProfile(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:6 }}>A quien le hablas?</label>
              <input style={inp} placeholder="Ej: Mujeres latinas de 28-42 anos en EE.UU." value={profile.audiencia} onChange={e => setProfile(p => ({ ...p, audiencia: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:6 }}>Propuesta de valor unica</label>
              <input style={inp} placeholder="Ej: Combino estrategia de negocios con identidad cultural latina" value={profile.propuestaValor} onChange={e => setProfile(p => ({ ...p, propuestaValor: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:24, marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:500, color:D.text2, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Comunicacion</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:10 }}>Idioma principal</label>
              <div style={{ display:"flex", gap:8 }}>
                {idiomas.map(i => (
                  <button key={i} onClick={() => setProfile(p => ({ ...p, idioma: i }))}
                    style={{ padding:"8px 16px", borderRadius:8, border: profile.idioma===i ? "2px solid " + D.purple : "1px solid " + D.border, background: profile.idioma===i ? "rgba(121,80,242,0.15)" : "transparent", color: profile.idioma===i ? D.purpleLight : D.text2, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:10 }}>Tono de voz</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {tonos.map(t => (
                  <button key={t} onClick={() => setProfile(p => ({ ...p, tono: t }))}
                    style={{ padding:"7px 14px", borderRadius:8, border: profile.tono===t ? "2px solid " + D.purple : "1px solid " + D.border, background: profile.tono===t ? "rgba(121,80,242,0.15)" : "transparent", color: profile.tono===t ? D.purpleLight : D.text2, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:10 }}>Categorias de contenido</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {cats.map(c => (
                  <button key={c} onClick={() => toggleCat(c)}
                    style={{ padding:"7px 14px", borderRadius:8, border: profile.categorias.includes(c) ? "2px solid " + D.purple : "1px solid " + D.border, background: profile.categorias.includes(c) ? "rgba(121,80,242,0.15)" : "transparent", color: profile.categorias.includes(c) ? D.purpleLight : D.text2, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={guardar} disabled={saving}
          style={{ padding:"14px", background: saving ? "rgba(121,80,242,0.4)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:500, cursor: saving ? "not-allowed" : "pointer", width:"100%", fontFamily:"Inter, sans-serif" }}>
          {saved ? "Guardado!" : saving ? "Guardando..." : user ? "Guardar Brand Profile" : "Guardar (solo en este dispositivo)"}
        </button>
      </div>
    </div>
  );
}