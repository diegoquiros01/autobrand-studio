"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Biblioteca() {
  const router = useRouter();
  const [generaciones, setGeneraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);

  const D = {
    bg:"#0D0D1F", bg2:"#111122", bg3:"rgba(255,255,255,0.04)",
    border:"rgba(255,255,255,0.08)", text:"#fff", text2:"rgba(255,255,255,0.55)",
    text3:"rgba(255,255,255,0.3)", purple:"#7950F2", purpleLight:"#A78BFA",
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) await loadGeneraciones(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const loadGeneraciones = async (userId) => {
    const { data } = await supabase
      .from("generaciones")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const withUrls = await Promise.all(data.map(async (g) => {
        if (g.imagen_url) {
          const { data: urlData } = supabase.storage.from("assets").getPublicUrl(g.imagen_url);
          return { ...g, url: urlData.publicUrl };
        }
        return g;
      }));
      setGeneraciones(withUrls);
    }
  };

  const deleteGeneracion = async (id) => {
    await supabase.from("generaciones").delete().eq("id", id);
    setGeneraciones(prev => prev.filter(g => g.id !== id));
    if (selected && selected.id === id) setSelected(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day:"numeric", month:"short", year:"numeric" });
  };

  return (
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid " + D.border, background:D.bg2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:D.purple, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:D.text }}>Ai<span style={{ color:D.purpleLight }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
          <button onClick={() => router.push("/generar")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Generador</button>
          <button onClick={() => router.push("/brand-profile")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Brand Profile</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 28px" }}>
        <div style={{ marginBottom:28, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:500, color:D.text, marginBottom:6, letterSpacing:"-0.02em" }}>Mi biblioteca</h1>
            <p style={{ fontSize:14, color:D.text2 }}>Todas las piezas que has generado con AiStudioBrand.</p>
          </div>
          <button onClick={() => router.push("/generar")} style={{ padding:"10px 20px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer" }}>
            + Nueva pieza
          </button>
        </div>

        {!user ? (
          <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:"40px 24px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12, opacity:0.2, color:"#fff" }}>◉</div>
            <div style={{ fontSize:15, color:D.text2, fontWeight:500, marginBottom:8 }}>Inicia sesión para ver tu biblioteca</div>
            <div style={{ fontSize:13, color:D.text3, marginBottom:20 }}>Tus generaciones se guardan automáticamente cuando tienes una cuenta</div>
            <button onClick={() => router.push("/login")} style={{ padding:"11px 24px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:500, cursor:"pointer" }}>
              Iniciar sesión →
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:D.text3 }}>Cargando tu biblioteca...</div>
        ) : generaciones.length === 0 ? (
          <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:40, opacity:0.1, marginBottom:12, color:"#fff" }}>◉</div>
            <div style={{ fontSize:15, color:D.text2, fontWeight:500, marginBottom:8 }}>No tienes piezas todavía</div>
            <div style={{ fontSize:13, color:D.text3, marginBottom:20 }}>Genera tu primera pieza y aparecerá aquí automáticamente</div>
            <button onClick={() => router.push("/generar")} style={{ padding:"11px 24px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:500, cursor:"pointer" }}>
              Crear mi primera pieza →
            </button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap:20, alignItems:"start" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12 }}>
              {generaciones.map(g => (
                <div key={g.id} onClick={() => setSelected(selected && selected.id === g.id ? null : g)}
                  style={{ background: selected && selected.id === g.id ? "rgba(121,80,242,0.08)" : D.bg3, border: selected && selected.id === g.id ? "1.5px solid " + D.purple : "1px solid " + D.border, borderRadius:12, overflow:"hidden", cursor:"pointer", transition:"all 0.15s" }}>
                  {g.url ? (
                    <img src={g.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                  ) : (
                    <div style={{ width:"100%", aspectRatio:"1", background:"linear-gradient(135deg,rgba(121,80,242,0.2),rgba(230,73,128,0.1))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, opacity:0.3, color:"#fff" }}>◉</div>
                  )}
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ fontSize:11, color:D.purpleLight, fontWeight:500, marginBottom:3 }}>{g.tipo}</div>
                    <div style={{ fontSize:12, color:D.text2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.prompt}</div>
                    <div style={{ fontSize:10, color:D.text3, marginTop:4 }}>{formatDate(g.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:20, position:"sticky", top:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.08em" }}>{selected.tipo}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => deleteGeneracion(selected.id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, background:"rgba(220,38,38,0.1)", color:"#FCA5A5", border:"1px solid rgba(220,38,38,0.2)", cursor:"pointer" }}>Eliminar</button>
                    <button onClick={() => setSelected(null)} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, background:"rgba(255,255,255,0.05)", color:D.text3, border:"1px solid " + D.border, cursor:"pointer" }}>Cerrar</button>
                  </div>
                </div>

                {selected.url && (
                  <img src={selected.url} alt="" style={{ width:"100%", borderRadius:10, display:"block", marginBottom:14, border:"1px solid " + D.border }} />
                )}

                <div style={{ fontSize:12, color:D.text3, marginBottom:8 }}>Prompt: {selected.prompt}</div>
                <div style={{ fontSize:11, color:D.text3, marginBottom:14 }}>{formatDate(selected.created_at)}</div>

                {selected.propuestas && selected.propuestas.length > 0 && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Copy usado</div>
                    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid " + D.border, borderRadius:8, padding:12 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:D.text, marginBottom:4 }}>{selected.propuestas[0].hook}</div>
                      <div style={{ fontSize:12, color:D.text2, lineHeight:1.6, marginBottom:4 }}>{selected.propuestas[0].copy}</div>
                      <div style={{ fontSize:12, color:D.purpleLight }}>{selected.propuestas[0].cta}</div>
                      {selected.propuestas[0].hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.6)", marginTop:6 }}>{selected.propuestas[0].hashtags}</div>}
                    </div>
                  </div>
                )}

                {selected.url && (
                  <button onClick={() => { const a = document.createElement("a"); a.href = selected.url; a.download = "aistudiobrand.png"; a.click(); }}
                    style={{ width:"100%", padding:11, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid " + D.border, borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", marginTop:14, fontFamily:"Inter, sans-serif" }}>
                    Descargar imagen
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}