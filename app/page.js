"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TIPOS = ["Comercial","Branding","Educativo","Storytelling","Posicionamiento"];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [tipo, setTipo] = useState("Comercial");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [brandProfile, setBrandProfile] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("brandProfile");
    if (saved) setBrandProfile(JSON.parse(saved));
  }, []);

  const generar = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setProposals([]);
    setSelected(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tipo, brandProfile }),
      });
      const data = await res.json();
      setProposals(data.propuestas);
    } catch (e) {
      setError("Hubo un error. Intenta de nuevo.");
    }
    setLoading(false);
  };

  const irAResultado = () => {
    const prop = proposals.find(p => p.id === selected);
    localStorage.setItem("selectedPropuesta", JSON.stringify(prop));
    router.push("/resultado");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"Inter, sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid #F0F0F0", background:"#fff", gap:8, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:"#0A0A0A" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:4, marginLeft:"auto", alignItems:"center" }}>
          <button style={{ padding:"7px 14px", borderRadius:8, fontSize:13.5, color:"#444", cursor:"pointer", background:"none", border:"none" }} onClick={() => router.push("/brand-profile")}>Brand Profile</button>
          <button style={{ padding:"7px 14px", borderRadius:8, fontSize:13.5, color:"#444", cursor:"pointer", background:"none", border:"none" }} onClick={() => router.push("/pricing")}>Precios</button>
          <button style={{ padding:"7px 16px", background:"#fff", color:"#0A0A0A", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer" }} onClick={() => router.push("/login")}>Iniciar sesión</button>
          <button style={{ padding:"8px 18px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", marginLeft:4 }} onClick={() => router.push("/login")}>Empieza gratis</button>
        </div>
      </nav>

      <div style={{ padding:"56px 40px 40px", textAlign:"center", background:"#fff" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F3F0FF", color:"#6741D9", fontSize:12.5, fontWeight:500, padding:"5px 14px", borderRadius:20, marginBottom:20 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#7950F2", display:"inline-block" }}></span>
          IA que aprende tu marca
        </div>
        <div style={{ fontSize:36, fontWeight:500, color:"#0A0A0A", lineHeight:1.15, marginBottom:14, letterSpacing:"-0.03em" }}>
          Contenido que suena<br />
          <span style={{ background:"linear-gradient(135deg,#7950F2,#4C6EF5,#F03E3E)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            exactamente como tú
          </span>
        </div>
        <div style={{ fontSize:16, color:"#555", lineHeight:1.65, maxWidth:520, margin:"0 auto 28px" }}>
          AiStudioBrand aprende el ADN de tu marca y genera contenido para Instagram en segundos.
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:16 }}>
          <button style={{ padding:"13px 28px", background:"#7950F2", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer" }} onClick={() => document.getElementById("gen-section").scrollIntoView({ behavior:"smooth" })}>
            Empieza gratis →
          </button>
          <button style={{ padding:"12px 26px", background:"#fff", color:"#0A0A0A", border:"1.5px solid #E0E0E0", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer" }} onClick={() => router.push("/login")}>
            Ver demo
          </button>
        </div>
        <div style={{ fontSize:12.5, color:"#999" }}>20 generaciones gratis · Sin tarjeta de crédito</div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 28px 40px" }} id="gen-section">
        {brandProfile ? (
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#F3F0FF", borderRadius:20, padding:"6px 14px 6px 8px", marginBottom:20, cursor:"pointer" }} onClick={() => router.push("/brand-profile")}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#7950F2", display:"inline-block" }}></span>
            <span style={{ fontSize:13, color:"#6741D9", fontWeight:500 }}>{brandProfile.nombre} · {brandProfile.tono} · {brandProfile.idioma}</span>
            <span style={{ fontSize:11, color:"#9775FA", marginLeft:4 }}>editar</span>
          </div>
        ) : (
          <div style={{ background:"#FFFBEB", border:"1px solid #F0C040", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <span style={{ fontSize:13, color:"#92400E" }}>Configura tu Brand Profile para mejores resultados</span>
            <button onClick={() => router.push("/brand-profile")} style={{ fontSize:12, color:"#7950F2", border:"1px solid #7950F2", background:"transparent", padding:"5px 12px", borderRadius:7, cursor:"pointer" }}>Configurar →</button>
          </div>
        )}

        <div style={{ background:"#fff", border:"1.5px solid #E8E8E8", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <label style={{ fontSize:13, fontWeight:500, color:"#333", marginBottom:8, display:"block" }}>
            ¿Qué quieres comunicar hoy?
          </label>
          <textarea
            rows={3}
            placeholder="Ej: Quiero anunciar mi nueva receta de tacos de pollo..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{ width:"100%", border:"1.5px solid #E8E8E8", borderRadius:10, padding:"12px 14px", fontSize:14, background:"#FAFAFA", color:"#0A0A0A", outline:"none", resize:"none", fontFamily:"Inter, sans-serif" }}
          />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:14 }}>
            {TIPOS.map(t => (
              <button key={t} onClick={() => setTipo(t)} style={{ padding:"6px 14px", borderRadius:20, fontSize:13, border: tipo===t ? "1.5px solid #7950F2" : "1.5px solid #E0E0E0", color: tipo===t ? "#6741D9" : "#555", background: tipo===t ? "#F3F0FF" : "#fff", fontWeight: tipo===t ? 500 : 400, cursor:"pointer" }}>
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={generar}
            disabled={!prompt.trim() || loading}
            style={{ width:"100%", marginTop:16, padding:14, background: (!prompt.trim() || loading) ? "#C5B8FB" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor: (!prompt.trim() || loading) ? "not-allowed" : "pointer", fontFamily:"Inter, sans-serif" }}
          >
            {loading ? "Generando con IA..." : "✦ Generar 5 versiones"}
          </button>
        </div>

        {error && <div style={{ marginTop:16, padding:14, background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:9, color:"#DC2626", fontSize:14 }}>{error}</div>}

        {loading && (
          <div style={{ textAlign:"center", padding:"32px 0", color:"#7950F2", fontWeight:500 }}>
            Analizando tu marca y generando propuestas...
          </div>
        )}

        {proposals.length > 0 && (
          <div style={{ marginTop:24 }}>
            <div style={{ fontSize:12, fontWeight:500, color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              5 propuestas generadas · Selecciona una
            </div>
            {proposals.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p.id)}
                style={{ background:"#fff", border: selected===p.id ? "1.5px solid #7950F2" : "1.5px solid #EAEAEA", borderRadius:14, padding:"18px 20px", marginBottom:10, cursor:"pointer", boxShadow: selected===p.id ? "0 0 0 3px #F3F0FF" : "none" }}
              >
                <div style={{ fontSize:11, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Propuesta {p.id}</div>
                <div style={{ fontSize:15, fontWeight:500, color:"#0A0A0A", marginBottom:8, lineHeight:1.4 }}>{p.hook}</div>
                <div style={{ fontSize:13, color:"#666", lineHeight:1.65, marginBottom:8 }}>{p.copy}</div>
                <div style={{ fontSize:13, color:"#7950F2", fontWeight:500 }}>{p.cta}</div>
              </div>
            ))}
            {selected && (
              <button
                onClick={irAResultado}
                style={{ width:"100%", padding:13, background:"linear-gradient(135deg,#E64980,#7950F2)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", marginTop:8, fontFamily:"Inter, sans-serif" }}
              >
                Generar imagen con IA para esta propuesta →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
