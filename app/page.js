"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const S = {
  nav: { display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid #F0F0F0", background:"#fff", gap:8, position:"sticky", top:0, zIndex:100 },
  logoIcon: { width:32, height:32, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13, letterSpacing:"-0.02em", cursor:"pointer" },
  logoText: { fontSize:16, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.01em", cursor:"pointer" },
  navLink: { padding:"7px 14px", borderRadius:8, fontSize:13.5, color:"#444", cursor:"pointer", background:"none", border:"none", transition:"background 0.12s" },
  navOutline: { padding:"7px 16px", background:"#fff", color:"#0A0A0A", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", transition:"all 0.12s" },
  navCta: { padding:"8px 18px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", marginLeft:4 },
  hero: { padding:"56px 40px 40px", textAlign:"center", background:"#fff" },
  eyebrow: { display:"inline-flex", alignItems:"center", gap:6, background:"#F3F0FF", color:"#6741D9", fontSize:12.5, fontWeight:500, padding:"5px 14px", borderRadius:20, marginBottom:20 },
  eyebrowDot: { width:6, height:6, borderRadius:"50%", background:"#7950F2" },
  heroTitle: { fontSize:36, fontWeight:500, color:"#0A0A0A", lineHeight:1.15, marginBottom:14, letterSpacing:"-0.03em" },
  heroSub: { fontSize:16, color:"#555", lineHeight:1.65, maxWidth:520, margin:"0 auto 28px" },
  heroBtns: { display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:16 },
  btnBig: { padding:"13px 28px", background:"#7950F2", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer" },
  btnBigOut: { padding:"12px 26px", background:"#fff", color:"#0A0A0A", border:"1.5px solid #E0E0E0", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer" },
  heroNote: { fontSize:12.5, color:"#999" },
  genWrap: { maxWidth:680, margin:"0 auto", padding:"0 28px 40px" },
  brandPill: { display:"inline-flex", alignItems:"center", gap:8, background:"#F3F0FF", borderRadius:20, padding:"6px 14px 6px 8px", marginBottom:20, cursor:"pointer" },
  brandDot: { width:8, height:8, borderRadius:"50%", background:"#7950F2" },
  genCard: { background:"#fff", border:"1.5px solid #E8E8E8", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" },
  genLabel: { fontSize:13, fontWeight:500, color:"#333", marginBottom:8, display:"block" },
  genTextarea: { width:"100%", border:"1.5px solid #E8E8E8", borderRadius:10, padding:"12px 14px", fontSize:14, background:"#FAFAFA", color:"#0A0A0A", outline:"none", minHeight:80 },
  pillRow: { display:"flex", gap:6, flexWrap:"wrap", marginTop:14 },
  genBtn: { width:"100%", marginTop:16, padding:14, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer" },
  genBtnDis: { width:"100%", marginTop:16, padding:14, background:"#C5B8FB", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"not-allowed" },
  progBar: { height:4, background:"#F0EDFF", borderRadius:4, overflow:"hidden", marginTop:12 },
  progFill: (w) => ({ height:"100%", width:w+"%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4, transition:"width 2.2s ease" }),
  propsLabel: { fontSize:12, fontWeight:500, color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 },
  propCard: (sel) => ({ background:"#fff", border: sel ? "1.5px solid #7950F2" : "1.5px solid #EAEAEA", borderRadius:14, padding:"18px 20px", marginBottom:10, cursor:"pointer", boxShadow: sel ? "0 0 0 3px #F3F0FF" : "none" }),
  propNum: { fontSize:11, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 },
  propHook: { fontSize:15, fontWeight:500, color:"#0A0A0A", marginBottom:8, lineHeight:1.4 },
  propCopy: { fontSize:13, color:"#666", lineHeight:1.65, marginBottom:8 },
  propCta: { fontSize:13, color:"#7950F2", fontWeight:500 },
  imgBtn: { width:"100%", padding:13, background:"linear-gradient(135deg,#E64980,#7950F2)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", marginTop:8 },
  errBox: { background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:9, padding:14, color:"#DC2626", marginBottom:16, fontSize:14 },
};

const TIPOS = ["Comercial","Branding","Educativo","Storytelling","Posicionamiento"];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [tipo, setTipo] = useState("Comercial");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(0);
    setTimeout(() => setProgress(85), 100);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tipo, brandProfile }),
      });
      const data = await res.json();
      setProgress(100);
      setTimeout(() => {
        setProposals(data.propuestas);
        setLoading(false);
        setProgress(0);
      }, 300);
    } catch (e) {
      setError("Hubo un error. Intenta de nuevo.");
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }} onClick={() => router.push("/")}>
          <div style={S.logoIcon}>Ai</div>
          <span style={S.logoText}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:4, marginLeft:"auto", alignItems:"center" }}>
          <button style={S.navLink} onClick={() => router.push("/brand-profile")}>Brand Profile</button>
          <button style={S.navLink} onClick={() => router.push("/pricing")}>Precios</button>
          <button style={S.navOutline} onClick={() => router.push("/login")}>Iniciar sesión</button>
          <button style={S.navCta} onClick={() => router.push("/login")}>Empieza gratis</button>
        </div>
      </nav>

      <div style={S.hero}>
        <div style={S.eyebrow}><span style={S.eyebrowDot}></span> IA que aprende tu marca</div>
        <div style={S.heroTitle}>
          Contenido que suena<br />
          <span style={{ background:"linear-gradient(135deg,#7950F2,#4C6EF5,#F03E3E)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            exactamente como tú
          </span>
        </div>
        <div style={S.heroSub}>AiStudioBrand aprende el ADN de tu marca y genera contenido para Instagram en segundos — alineado a tu estilo, tono y audiencia.</div>
        <div style={S.heroBtns}>
          <button style={S.btnBig} onClick={() => document.getElementById("gen-section").scrollIntoView({ behavior:"smooth" })}>Empieza gratis →</button>
          <button style={S.btnBigOut} onClick={() => router.push("/login")}>Ver demo</button>
        </div>
        <div style={S.heroNote}>20 generaciones gratis · Sin tarjeta de crédito</div>
      </div>

      <div style={S.genWrap} id="gen-section">
        {brandProfile ? (
          <div style={S.brandPill} onClick={() => router.push("/brand-profile")}>
            <span style={S.brandDot}></span>
            <span style={{ fontSize:13, color:"#6741D9", fontWeight:500 }}>{brandProfile.nombre} · {brandProfile.tono} · {brandProfile.idioma}</span>
            <span style={{ fontSize:11, color:"#9775FA", marginLeft:4 }}>editar</span>
          </div>
        ) : (
          <div style={{ background:"#FFFBEB", border:"1px solid #F0C040", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <span style={{ fontSize:13, color:"#92400E" }}>Configura tu Brand Profile para mejores resultados</span>
            <button onClick={() => router.push("/brand-profile")} style={{ fontSize:12, color:"#7950F2", border:"1px solid #7950F2", background:"transparent", padding:"5px 12px", borderRadius:7, cursor:"pointer", whiteSpace:"nowrap" }}>Configurar →</button>
          </div>
        )}

        <div style={S.genCard}>
          <label style={S.genLabel}>¿Qué quieres comunicar hoy?</label>
          <textarea
            style={S.genTextarea}
            rows={3}
            placeholder='Ej: "Quiero anunciar mi nueva receta de arroz con pollo para mamás ocupadas..."'
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <div style={S.pillRow}>
            {TIPOS.map(t => (
              <button key={t} onClick={() => setTipo(t)} style={{ padding:"6px 14px", borderRadius:20, fontSize:13, border: tipo===t ? "1.5px solid #7950F2" : "1.5px solid #E0E0E0", color: tipo===t ? "#6741D9" : "#555", background: tipo===t ? "#F3F0FF" : "#fff", fontWeight: tipo===t ? 500 : 400, cursor:"pointer" }}>
                {t}
              </button>
            ))}
          </div>
          <button
            style={!prompt.trim() || loading ? S.genBtnDis : S.genBtn}
            onClick={generar}
            disabled={!prompt.trim() || loading}
          >
            {loading ? "Generando con IA..." : "✦ Generar 5 versiones"}
          </button>
          {loading && (
            <div style={S.progBar}>
              <div style={S.progFill(progress)} />
            </div>
          )}
        </div>

        {error && <div style={{ ...S.errBox, marginTop:16 }}>{error}</div>}

        {proposals.length > 0 && (
          <div style={{ marginTop:24 }}>
            <div style={S.propsLabel}>5 propuestas generadas · Selecciona una</div>
            {proposals.map(p => (
              <div key={p.id} style={S.propCard(selected===p.id)} onClick={() => setSelected(p.id)}>
                <div style={S.propNum}>Propuesta {p.id}</div>
                <div style={S.propHook}>{p.hook}</div>
                <div style={S.propCopy}>{p.copy}</div>
                <div style={S.propCta}>{p.cta}</div>
              </div>
            ))}
            {selected && (
              <button style={S.imgBtn} onClick={() => router.push("/resultado")}>
                🎨 Generar imagen con IA para esta propuesta →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
