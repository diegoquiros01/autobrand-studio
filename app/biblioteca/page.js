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
  const [filter, setFilter] = useState("todas");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const PER_PAGE = 20;

  const [lang, setLang] = useState("es");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);
  const en = lang === "en";

  const D = {
    bg3:"#10101C", border:"rgba(255,255,255,0.08)",
    text:"#fff", text2:"rgba(255,255,255,0.65)", text3:"rgba(255,255,255,0.4)",
    purple:"#7950F2", purpleLight:"#A78BFA",
  };

  const TIPOS = ["todas","Comercial","Branding","Educativo","Storytelling","Promocional","Posicionamiento"];

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase.from("generaciones").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) console.warn("Biblioteca load error:", error.message);
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
    if (!confirm(en ? "Delete this piece?" : "¿Eliminar esta pieza?")) return;
    try {
      const { error } = await supabase.from("generaciones").delete().eq("id", id);
      if (error) throw error;
      setGeneraciones(prev => prev.filter(g => g.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      alert((en ? "Error deleting: " : "Error al eliminar: ") + (e.message || "intenta de nuevo"));
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString(en ? "en-US" : "es-ES", { day:"numeric", month:"short", year:"numeric" });

  const searchFiltered = searchQuery.trim()
    ? generaciones.filter(g => {
        const q = searchQuery.toLowerCase();
        const matchPrompt = g.prompt?.toLowerCase().includes(q);
        const matchCopy = g.propuestas?.[0]?.hook?.toLowerCase().includes(q) ||
                          g.propuestas?.[0]?.copy?.toLowerCase().includes(q) ||
                          g.propuestas?.[0]?.hashtags?.toLowerCase().includes(q);
        return matchPrompt || matchCopy;
      })
    : generaciones;
  const allFiltered = filter === "todas" ? searchFiltered : searchFiltered.filter(g => g.tipo === filter);
  const totalPages = Math.ceil(allFiltered.length / PER_PAGE);
  const filtered = allFiltered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <AppLayout>
      <div style={{ padding:"32px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4, letterSpacing:"-0.4px" }}>{en ? "My library" : "Mi biblioteca"}</h1>
            <p style={{ fontSize:13, color:D.text2 }}>{en ? "Your saved pieces — editable and reusable anytime" : "Tus piezas guardadas — editables y reutilizables en cualquier momento"}</p>
          </div>
          <button className="btn-primary" onClick={() => router.push("/crear")}
            style={{ padding:"9px 18px", background:D.purple, color:"#fff", border:"none", borderRadius:8, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
            {en ? "+ New piece" : "+ Nueva pieza"}
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: 400 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder={en ? "Search by prompt, copy, or hashtags..." : "Buscar por prompt, copy o hashtags..."}
              style={{
                width: "100%", maxWidth: 400,
                background: "rgba(255,255,255,0.02)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 7, padding: "9px 11px 9px 36px",
                fontSize: 12.5, color: "#fff", outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={e => e.target.style.borderColor = "#7950F2"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
          {TIPOS.map(t => (
            <button key={t} onClick={() => { setFilter(t); setPage(1); }}
              style={{ padding:"5px 11px", borderRadius:14, fontSize:11.5, border: filter===t ? "0.5px solid rgba(121,80,242,0.35)" : "0.5px solid rgba(255,255,255,0.1)", background: filter===t ? "rgba(121,80,242,0.12)" : "transparent", color: filter===t ? "#A78BFA" : D.text3, fontWeight: filter===t ? 500 : 400, cursor:"pointer" }}>
              {t === "todas" ? (en ? "All" : "Todas") + " (" + searchFiltered.length + ")" : t + " (" + searchFiltered.filter(g => g.tipo === t).length + ")"}
            </button>
          ))}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(121,80,242,0.2)", borderTop: "3px solid #7950F2", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{en ? "Loading your library..." : "Cargando tu biblioteca..."}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background:"#10101C", border:"0.5px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:40, opacity:0.1, marginBottom:12 }}>◉</div>
            <div style={{ fontSize:15, color:D.text2, fontWeight:500, marginBottom:8 }}>
              {searchQuery.trim()
                ? (en ? `No pieces matching "${searchQuery}"` : `No hay piezas que coincidan con "${searchQuery}"`)
                : filter === "todas"
                  ? (en ? "You don't have any pieces yet" : "No tienes piezas todavía")
                  : (en ? "You don't have pieces of type " : "No tienes piezas de tipo ") + filter}
            </div>
            <div style={{ fontSize:13, color:D.text3, marginBottom:20 }}>
              {searchQuery.trim()
                ? (en ? "Try a different search term" : "Intenta con otro término de búsqueda")
                : (en ? "Generate your first piece and it will appear here" : "Genera tu primera pieza y aparecerá aquí")}
            </div>
            {searchQuery.trim() ? (
              <button onClick={() => { setSearchQuery(""); setPage(1); }}
                style={{ padding:"11px 24px", background:"rgba(255,255,255,0.06)", color:D.text2, border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:8, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
                {en ? "Clear search" : "Limpiar búsqueda"}
              </button>
            ) : (
              <button onClick={() => router.push("/crear")}
                style={{ padding:"11px 24px", background:D.purple, color:"#fff", border:"none", borderRadius:8, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
                {en ? "Create my first piece →" : "Crear mi primera pieza →"}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap:20, alignItems:"start" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(175px,1fr))", gap:12 }}>
              {filtered.map((g, idx) => (
                <div key={g.id} className="card-hover" onClick={() => setSelected(selected?.id === g.id ? null : g)}
                  style={{ background: selected?.id===g.id ? "rgba(121,80,242,0.08)" : "#10101C", border: selected?.id===g.id ? "1.5px solid " + D.purple : "0.5px solid rgba(255,255,255,0.06)", borderRadius:12, overflow:"hidden", cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e => { if (selected?.id !== g.id) e.currentTarget.style.borderColor="rgba(121,80,242,0.35)"; }}
                  onMouseLeave={e => { if (selected?.id !== g.id) e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}>
                  {g.url ? (
                    <img src={g.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                  ) : (
                    <div style={{ width:"100%", aspectRatio:"1", background:"linear-gradient(135deg,rgba(121,80,242,0.15),rgba(230,73,128,0.1))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, opacity:0.3 }}>◉</div>
                  )}
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:D.purpleLight, fontWeight:500, marginBottom:3 }}>{g.tipo}</div>
                    <div style={{ fontSize:12, color:D.text2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{g.prompt}</div>
                    <div style={{ fontSize:10, color:D.text3 }}>{formatDate(g.created_at)}</div>
                  </div>
                </div>
              ))}
              {totalPages > 1 && (
                <div style={{ gridColumn:"1 / -1", display:"flex", alignItems:"center", justifyContent:"center", gap:8, paddingTop:12 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding:"6px 14px", borderRadius:8, fontSize:12.5, background: page===1 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)", color: page===1 ? D.text3 : D.text2, border:"0.5px solid rgba(255,255,255,0.08)", cursor: page===1 ? "default" : "pointer" }}>
                    {en ? "← Previous" : "← Anterior"}
                  </button>
                  <span style={{ fontSize:11, color:D.text3 }}>{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding:"6px 14px", borderRadius:8, fontSize:12.5, background: page===totalPages ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)", color: page===totalPages ? D.text3 : D.text2, border:"0.5px solid rgba(255,255,255,0.08)", cursor: page===totalPages ? "default" : "pointer" }}>
                    {en ? "Next →" : "Siguiente →"}
                  </button>
                </div>
              )}
            </div>

            {selected && (
              <div style={{ background:"#10101C", border:"0.5px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"18px 20px", position:"sticky", top:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.08em" }}>{selected.tipo}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => deleteGeneracion(selected.id)}
                      style={{ padding:"4px 10px", borderRadius:6, fontSize:11, background:"rgba(220,38,38,0.1)", color:"#FCA5A5", border:"1px solid rgba(220,38,38,0.2)", cursor:"pointer" }}>
                      {en ? "Delete" : "Eliminar"}
                    </button>
                    <button onClick={() => setSelected(null)}
                      style={{ padding:"4px 10px", borderRadius:6, fontSize:11, background:D.bg3, color:D.text3, border:"1px solid " + D.border, cursor:"pointer" }}>
                      ✕
                    </button>
                  </div>
                </div>

                {selected.url && (
                  <img src={selected.url} alt="" style={{ width:"100%", borderRadius:10, display:"block", marginBottom:14, border:"0.5px solid rgba(255,255,255,0.06)" }} />
                )}

                <div style={{ background:"rgba(255,255,255,0.02)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"8px 12px", marginBottom:10 }}>
                  <div style={{ fontSize:10, color:D.text3, marginBottom:4 }}>Prompt</div>
                  <div style={{ fontSize:12, color:D.text2, lineHeight:1.5 }}>{selected.prompt}</div>
                </div>

                {selected.propuestas && selected.propuestas.length > 0 && (
                  <div style={{ background:"rgba(255,255,255,0.02)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"10px 12px", marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Copy</div>
                    <div style={{ fontSize:13, fontWeight:500, color:D.text, marginBottom:4 }}>{selected?.propuestas?.[0]?.hook}</div>
                    <div style={{ fontSize:12, color:D.text2, lineHeight:1.6, marginBottom:4 }}>{selected?.propuestas?.[0]?.copy}</div>
                    <div style={{ fontSize:12, color:D.purpleLight, marginBottom:4 }}>{selected?.propuestas?.[0]?.cta}</div>
                    {selected?.propuestas?.[0]?.hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.45)" }}>{selected?.propuestas?.[0]?.hashtags}</div>}
                  </div>
                )}

                <div style={{ fontSize:10, color:D.text3, marginBottom:14 }}>{formatDate(selected.created_at)}</div>

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {selected.url && (
                    <button onClick={() => { const a = document.createElement("a"); a.href = selected.url; a.download = "aistudiobrand-" + Date.now() + ".png"; a.click(); }}
                      style={{ width:"100%", padding:10, background:"rgba(255,255,255,0.06)", color:D.text2, border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:8, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
                      {en ? "⬇ Download image" : "⬇ Descargar imagen"}
                    </button>
                  )}
                  <button onClick={() => { navigator.clipboard.writeText((selected.propuestas?.[0]?.hook || "") + "\n\n" + (selected.propuestas?.[0]?.copy || "") + "\n\n" + (selected.propuestas?.[0]?.cta || "") + "\n\n" + (selected.propuestas?.[0]?.hashtags || "")); alert(en ? "Text copied!" : "¡Copy copiado!"); }}
                    style={{ width:"100%", padding:10, background:"rgba(255,255,255,0.06)", color:D.text2, border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:8, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
                    {en ? "⎘ Copy text" : "⎘ Copiar texto"}
                  </button>
                  <button className="btn-primary" onClick={() => router.push("/crear?prompt=" + encodeURIComponent(selected.prompt || "") + "&tipo=" + encodeURIComponent(selected.tipo || "Comercial"))}
                    style={{ width:"100%", padding:10, background:D.purple, color:"#fff", border:"none", borderRadius:8, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
                    {en ? "✦ Create similar piece" : "✦ Crear pieza similar"}
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