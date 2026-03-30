"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";

export default function Biblioteca() {
  const router = useRouter();
  const [generaciones, setGeneraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const D = {
    bg3:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)",
    text:"#fff", text2:"rgba(255,255,255,0.55)", text3:"rgba(255,255,255,0.3)",
    purple:"#7950F2", purpleLight:"#A78BFA",
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("generaciones").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const withUrls = await Promise.all(data.map(async g => {
          if (g.imagen_url) {
            const { data: urlData } = supabase.storage.from("assets").getPublicUrl(g.imagen_url);
            return { ...g, url: urlData.publicUrl };
          }
          return g;
        }));
        setGeneraciones(withUrls);
      }
      setLoading(false);
    };
    init();
  }, []);

  const deleteGeneracion = async (id) => {
    await supabase.from("generaciones").delete().eq("id", id);
    setGeneraciones(prev => prev.filter(g => g.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("es-ES", { day:"numeric", month:"short", year:"numeric" });

  return (
    <AppLayout>
      <div style={{ padding:"32px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4, letterSpacing:"-0.02em" }}>Mi biblioteca</h1>
            <p style={{ fontSize:13, color:D.text2 }}>Todas tus piezas — activos vivos que puedes editar y reutilizar</p>
          </div>
          <button onClick={() => router.push("/crear")}
            style={{ padding:"9px 18px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
            + Nueva pieza
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:D.text3 }}>Cargando tu biblioteca...</div>
        ) : generaciones.length === 0 ? (
          <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:40, opacity:0.1, marginBottom:12 }}>◉</div>
            <div style={{ fontSize:15, color:D.text2, fontWeight:500, marginBottom:8 }}>No tienes piezas todavía</div>
            <div style={{ fontSize:13, color:D.text3, marginBottom:20 }}>Genera tu primera pieza y aparecerá aquí</div>
            <button onClick={() => router.push("/crear")}
              style={{ padding:"11px 24px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:500, cursor:"pointer" }}>
              Crear mi primera pieza →
            </button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:12 }}>
              {generaciones.map(g => (
                <div key={g.id} onClick={() => setSelected(selected?.id === g.id ? null : g)}
                  style={{ background: selected?.id===g.id ? "rgba(121,80,242,0.08)" : D.bg3, border: selected?.id===g.id ? "1.5px solid " + D.purple : "1px solid " + D.border, borderRadius:12, overflow:"hidden", cursor:"pointer" }}>
                  {g.url ? (
                    <img src={g.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                  ) : (
                    <div style={{ width:"100%", aspectRatio:"1", background:"linear-gradient(135deg,rgba(121,80,242,0.15),rgba(230,73,128,0.1))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, opacity:0.3 }}>◉</div>
                  )}
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:D.purpleLight, fontWeight:500, marginBottom:3 }}>{g.tipo}</div>
                    <div style={{ fontSize:12, color:D.text2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.prompt}</div>
                    <div style={{ fontSize:10, color:D.text3, marginTop:3 }}>{formatDate(g.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:20, position:"sticky", top:20, maxHeight:"calc(100vh - 120px)", overflowY:"auto" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.08em" }}>{selected.tipo}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => deleteGeneracion(selected.id)}
                      style={{ padding:"4px 10px", borderRadius:6, fontSize:11, background:"rgba(220,38,38,0.1)", color:"#FCA5A5", border:"1px solid rgba(220,38,38,0.2)", cursor:"pointer" }}>
                      Eliminar
                    </button>
                    <button onClick={() => setSelected(null)}
                      style={{ padding:"4px 10px", borderRadius:6, fontSize:11, background:D.bg3, color:D.text3, border:"1px solid " + D.border, cursor:"pointer" }}>
                      ✕
                    </button>
                  </div>
                </div>

                {selected.url && (
                  <img src={selected.url} alt="" style={{ width:"100%", borderRadius:10, display:"block", marginBottom:14, border:"1px solid " + D.border }} />
                )}

                <div style={{ fontSize:12, color:D.text3, marginBottom:6 }}>Prompt: {selected.prompt}</div>
                <div style={{ fontSize:11, color:D.text3, marginBottom:14 }}>{formatDate(selected.created_at)}</div>

                {selected.propuestas && selected.propuestas.length > 0 && (
                  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid " + D.border, borderRadius:9, padding:12, marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Copy</div>
                    <div style={{ fontSize:13, fontWeight:500, color:D.text, marginBottom:4 }}>{selected.propuestas[0].hook}</div>
                    <div style={{ fontSize:12, color:D.text2, lineHeight:1.6, marginBottom:4 }}>{selected.propuestas[0].copy}</div>
                    <div style={{ fontSize:12, color:D.purpleLight }}>{selected.propuestas[0].cta}</div>
                    {selected.propuestas[0].hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.5)", marginTop:5 }}>{selected.propuestas[0].hashtags}</div>}
                  </div>
                )}

                <div style={{ display:"flex", gap:8 }}>
                  {selected.url && (
                    <button onClick={() => { const a = document.createElement("a"); a.href = selected.url; a.download = "aistudiobrand.png"; a.click(); }}
                      style={{ flex:1, padding:10, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid " + D.border, borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                      Descargar
                    </button>
                  )}
                  <button onClick={() => router.push("/crear")}
                    style={{ flex:1, padding:10, background:D.purple, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                    Nueva similar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}