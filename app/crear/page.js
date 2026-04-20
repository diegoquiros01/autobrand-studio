"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { saveImage } from "../../lib/imageStore";
import AppLayout from "../components/AppLayout";

const TIPOS = ["Comercial","Branding","Educativo","Storytelling","Promocional","Posicionamiento"];
const FORMATOS = [
  { key:"square", label:"Post cuadrado", desc:"1:1 · Feed" },
  { key:"story", label:"Story vertical", desc:"9:16 · Stories/Reels" },
  { key:"carousel", label:"Carrusel", desc:"1:1 · Slides" },
];

const D = {
  bg3:"#16162d", border:"rgba(255,255,255,0.1)",
  text:"#fff", text2:"rgba(255,255,255,0.7)", text3:"rgba(255,255,255,0.4)",
  purple:"#7950F2", purpleLight:"#A78BFA",
};

function CrearContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);

  const goToStep = (n) => {
    setStep(n);
    if (n > maxStep) setMaxStep(n);
  };
  const [user, setUser] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);

  const [prompt, setPrompt] = useState("");
  const [idiomapieza, setIdiomaPieza] = useState("ADN");
  const [tipo, setTipo] = useState("Comercial");
  const [formato, setFormato] = useState("square");
  const [skipRefs, setSkipRefs] = useState(false);
  const [skipTalent, setSkipTalent] = useState(false);

  const [referencias, setReferencias] = useState([]);
  const refInput = useRef(null);

  const [talentos, setTalentos] = useState([]);
  const talentInput = useRef(null);

  const [generatingImg, setGeneratingImg] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genMsg, setGenMsg] = useState("");
  const [versiones, setVersiones] = useState([]);
  const [versionActiva, setVersionActiva] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [imgAprobada, setImgAprobada] = useState(false);

  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [copies, setCopies] = useState([]);
  const [copySeleccionado, setCopySeleccionado] = useState(null);
  const [editingCopy, setEditingCopy] = useState(null);
  const [editedText, setEditedText] = useState("");

  const [savedFinal, setSavedFinal] = useState(false);
  const [error, setError] = useState("");

  const [allBrands, setAllBrands] = useState([]);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  const loadBrandProfile = async (user) => {
    if (!user) return;
    // Load all brands for switcher
    const { data: brands } = await supabase.from("brand_profiles").select("id, nombre").eq("user_id", user.id).order("created_at", { ascending: true });
    setAllBrands(brands || []);

    // Load active brand
    const activeBrandId = localStorage.getItem("activeBrandId");
    let query;
    if (activeBrandId) {
      query = supabase.from("brand_profiles").select("*").eq("id", activeBrandId).single();
    } else if (brands && brands.length > 0) {
      query = supabase.from("brand_profiles").select("*").eq("id", brands[0].id).single();
    } else {
      const bp = localStorage.getItem("brandProfile");
      if (bp) setBrandProfile(JSON.parse(bp));
      return;
    }
    const { data } = await query;
    if (data) {
      const bp = {
        id: data.id, nombre: data.nombre, descripcion: data.descripcion,
        audiencia: data.audiencia, tono: data.tono,
        idioma: data.idioma, categorias: data.categorias,
        propuestaValor: data.propuesta_valor,
        instagramUrl: data.instagram_url, webUrl: data.web_url,
        personalidad: data.personalidad, coloresMarca: data.colores_marca,
        estiloVisual: data.estilo_visual, ejemplosCopy: data.ejemplos_copy,
      };
      setBrandProfile(bp);
      localStorage.setItem("brandProfile", JSON.stringify(bp));
      localStorage.setItem("activeBrandId", data.id);
    }
  };

  const switchBrandInCrear = async (brand) => {
    const { data } = await supabase.from("brand_profiles").select("*").eq("id", brand.id).single();
    if (data) {
      const bp = {
        id: data.id, nombre: data.nombre, descripcion: data.descripcion,
        audiencia: data.audiencia, tono: data.tono,
        idioma: data.idioma, categorias: data.categorias,
        propuestaValor: data.propuesta_valor,
        instagramUrl: data.instagram_url, webUrl: data.web_url,
        personalidad: data.personalidad, coloresMarca: data.colores_marca,
        estiloVisual: data.estilo_visual, ejemplosCopy: data.ejemplos_copy,
      };
      setBrandProfile(bp);
      localStorage.setItem("brandProfile", JSON.stringify(bp));
      localStorage.setItem("activeBrandId", data.id);
      window.dispatchEvent(new Event("brandChanged"));
    }
    setBrandDropdownOpen(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await loadBrandProfile(user);
      const qPrompt = searchParams.get("prompt");
      const qTipo = searchParams.get("tipo");
      if (qPrompt) setPrompt(qPrompt);
      if (qTipo) setTipo(qTipo);
    };
    init();

    // Reload ADN when user comes back to this tab or brand changes
    const handleFocus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await loadBrandProfile(user);
    };
    const handleBrandChanged = () => handleFocus();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("brandChanged", handleBrandChanged);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("brandChanged", handleBrandChanged);
    };
  }, []);

  const toBase64 = (file) => new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 512;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const data = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
      res(data);
    };
    img.onerror = rej;
    img.src = url;
  });

  const generarImagen = async (feedbackText = "") => {
    setGeneratingImg(true); setError(""); setGenProgress(0);
    const msgs = ["Art Director analizando tu marca...","Creando brief visual con IA...","Describiendo referencias y estilo...","Generando imagen con Gemini...","Componiendo la imagen...","Aplicando estilo de marca...","Validando calidad de imagen...","Ajustes finales del Art Director...","Casi listo..."];
    let mi = 0; setGenMsg(msgs[0]);
    const iv = setInterval(() => {
      setGenProgress(p => Math.min(p + Math.random() * 8, 90));
      mi = Math.min(mi + 1, msgs.length - 1); setGenMsg(msgs[mi]);
    }, 3000);
    try {
      const refB = referencias.length > 0 ? await Promise.all(referencias.map(async r => ({ data: await toBase64(r.file), mimeType: "image/jpeg" }))) : [];
      const talB = talentos.length > 0 ? await Promise.all(talentos.map(async t => ({ data: await toBase64(t.file), mimeType: "image/jpeg" }))) : [];
      const promptFinal = feedbackText ? prompt + ". Feedback del usuario: " + feedbackText : prompt;
      const res = await fetch("/api/generate-image", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt: promptFinal, brandProfile, referencias: refB, talentos: talB, editedCopy: prompt, userId: user?.id || "", idiomapieza: idiomapieza === "ADN" ? (brandProfile?.idioma || "") : idiomapieza, formato }),
      });
      const data = await res.json();
      if (data.error === "limit_reached") {
        setError("Alcanzaste tu límite de " + (data.limit || 20) + " generaciones este mes. Actualiza tu plan en Pricing.");
      } else if (data.image) {
        const newVersion = { image: data.image, mimeType: data.mimeType, feedback: feedbackText, timestamp: new Date().toLocaleTimeString() };
        setVersiones(prev => { const updated = [...prev, newVersion]; setVersionActiva(updated.length - 1); return updated; });
        setFeedback("");
        // Store in IndexedDB to avoid localStorage overflow
        saveImage("latest-" + Date.now(), { image: data.image, mimeType: data.mimeType }).catch(() => {});
      } else setError("No se pudo generar la imagen. Intenta de nuevo.");
    } catch(e) { setError("Error generando imagen: " + e.message); }
    clearInterval(iv); setGenProgress(100); setGeneratingImg(false); setGenMsg("");
  };

  const generarCopies = async () => {
    setGeneratingCopy(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt, tipo, brandProfile, userId: user?.id || "", idiomapieza: idiomapieza === "ADN" ? (brandProfile?.idioma || "") : idiomapieza }),
      });
      const data = await res.json();
      if (data.error === "limit_reached") {
        setError("Alcanzaste tu límite de " + (data.limit || 20) + " generaciones este mes. Actualiza tu plan en Pricing.");
      } else {
        setCopies((data.propuestas || []).slice(0, 3));
      }
    } catch(e) { setError("Error generando copies."); }
    setGeneratingCopy(false);
  };

  const [savingFinal, setSavingFinal] = useState(false);

  const guardarFinal = async (withCopy = true) => {
    const copy = withCopy ? copies.find(c => c.id === copySeleccionado) : null;
    if (versiones.length === 0) return;
    if (withCopy && !copy) return;
    setSavingFinal(true); setError("");
    try {
      const imgData = versiones[versionActiva];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Debes iniciar sesión para guardar."); setSavingFinal(false); return; }

      const res = await fetch("/api/guardar-pieza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          prompt, tipo,
          copy: copy || { hook: "", copy: prompt, cta: "", hashtags: "" },
          imageBase64: imgData.image,
          mimeType: imgData.mimeType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedFinal(true);
      } else {
        setError("Error guardando pieza: " + (data.error || "Intenta de nuevo"));
      }
    } catch(e) {
      setError("Error guardando pieza: " + e.message);
    }
    setSavingFinal(false);
  };

  const resetAll = () => {
    setStep(1); setMaxStep(1); setPrompt(""); setTipo("Comercial"); setFormato("square"); setIdiomaPieza("ADN");
    setReferencias([]); setTalentos([]); setSkipRefs(false); setSkipTalent(false);
    setVersiones([]); setCopies([]); setCopySeleccionado(null); setImgAprobada(false);
    setSavedFinal(false); setFeedback(""); setError("");
  };

  const steps = [{n:1,l:"Describe"},{n:2,l:"Referencias"},{n:3,l:"Talento"},{n:4,l:"Imagen"},{n:5,l:"Copy"},{n:6,l:"Arte final"}];

  const StepBar = () => (
    <div style={{ display:"flex", alignItems:"center", marginBottom:24, gap:0 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div onClick={() => s.n <= maxStep && setStep(s.n)}
              style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, background: step > s.n ? D.purple : step === s.n ? D.purple : "rgba(255,255,255,0.08)", color: step >= s.n ? "#fff" : D.text3, boxShadow: step === s.n ? "0 0 0 3px rgba(121,80,242,0.2)" : "none", cursor: s.n <= maxStep ? "pointer" : "default", opacity: s.n <= maxStep ? 1 : 0.5 }}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span style={{ fontSize:10, color: step >= s.n ? D.purpleLight : D.text3, whiteSpace:"nowrap" }}>{s.l}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width:32, height:1, background: step > s.n ? D.purple : "rgba(255,255,255,0.08)", margin:"0 4px", marginBottom:14 }} />}
        </div>
      ))}
    </div>
  );

  const BackBtn = ({ toStep }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <button onClick={() => setStep(toStep)} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 0", background:"none", border:"none", color:D.text3, fontSize:12, cursor:"pointer" }}>
        ← Paso anterior
      </button>
      {maxStep > step && (
        <button onClick={() => setStep(Math.min(step + 1, maxStep))} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 0", background:"none", border:"none", color:D.purpleLight, fontSize:12, cursor:"pointer" }}>
          Siguiente paso →
        </button>
      )}
    </div>
  );

  const NB = { width:"100%", padding:12, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", marginBottom:8, boxShadow:"0 4px 14px rgba(121,80,242,0.4)" };
  const SB = { width:"100%", padding:11, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, cursor:"pointer" };

  // Typing placeholder effect
  const placeholders = [
    "Quiero anunciar mis 3 spots de coaching 1:1...",
    "Lanzar mi nuevo programa de mentoría para latinas en tech...",
    "Promocionar mi descuento de Black Friday...",
    "Compartir 3 tips sobre productividad para emprendedoras...",
    "Celebrar que llegué a 10K seguidoras...",
  ];
  const [phIdx, setPhIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPhIdx(p => (p + 1) % placeholders.length), 3500);
    return () => clearInterval(iv);
  }, []);

  const UploadZone = ({ onClick, children }) => (
    <div onClick={onClick}
      style={{ border:"2px dashed rgba(121,80,242,0.3)", borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.15s", background:"rgba(121,80,242,0.04)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#7950F2"; e.currentTarget.style.background="rgba(121,80,242,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(121,80,242,0.3)"; e.currentTarget.style.background="rgba(121,80,242,0.04)"; }}>
      {children}
    </div>
  );

  // Instagram preview component
  const selectedCopy = copies.find(c => c.id === copySeleccionado);
  const hasImage = versiones.length > 0;
  const currentImage = hasImage ? versiones[versionActiva] : null;

  const InstagramPreview = () => (
    <div style={{ width:"100%", maxWidth:380, background:"#fff", borderRadius:10, boxShadow:"0 20px 60px rgba(0,0,0,0.7)", overflow:"hidden" }}>
      {/* IG Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px" }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#7950F2,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>
          {(brandProfile?.nombre || "M").charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"#000" }}>{brandProfile?.nombre || "tu_marca"}</div>
          <div style={{ fontSize:10, color:"#999" }}>{tipo}</div>
        </div>
      </div>
      {/* Image */}
      <div style={{ width:"100%", aspectRatio:"1", background:"#f0f0f0", position:"relative", overflow:"hidden" }}>
        {generatingImg ? (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f8f0ff,#fff0f5)" }}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg, transparent, rgba(121,80,242,0.15), transparent)", animation:"shimmer 1.5s infinite" }} />
            <div style={{ fontSize:11, color:"#7950F2", fontWeight:600, zIndex:1 }}>{genMsg}</div>
            <div style={{ fontSize:10, color:"#999", marginTop:4, zIndex:1 }}>{Math.round(Math.min(genProgress,95))}%</div>
          </div>
        ) : currentImage ? (
          <img src={"data:" + currentImage.mimeType + ";base64," + currentImage.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        ) : (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f8f0ff,#fff0f5)" }}>
            <div style={{ fontSize:40, opacity:0.15, marginBottom:4 }}>✦</div>
            <div style={{ fontSize:11, color:"#bbb" }}>Vista previa</div>
          </div>
        )}
      </div>
      {/* Copy */}
      <div style={{ padding:"12px 14px" }}>
        {selectedCopy ? (
          <div>
            <div style={{ fontSize:12, color:"#000", lineHeight:1.5 }}>
              <span style={{ fontWeight:600 }}>{brandProfile?.nombre || "tu_marca"}</span>{" "}
              {selectedCopy.hook}
            </div>
            <div style={{ fontSize:12, color:"#333", lineHeight:1.5, marginTop:4 }}>{selectedCopy.copy}</div>
            <div style={{ fontSize:12, color:"#7950F2", fontWeight:600, marginTop:4 }}>{selectedCopy.cta}</div>
            {selectedCopy.hashtags && <div style={{ fontSize:11, color:"#999", marginTop:4 }}>{selectedCopy.hashtags}</div>}
          </div>
        ) : (
          <div>
            <div style={{ fontSize:12, color:"#ccc", lineHeight:1.5 }}>
              <span style={{ fontWeight:600, color:"#bbb" }}>{brandProfile?.nombre || "tu_marca"}</span>{" "}
              {prompt ? prompt.substring(0, 80) + "..." : "Tu copy aparecerá aquí..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @media (max-width: 768px) {
          .crear-grid { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
      <div className="crear-grid" style={{ display:"grid", gridTemplateColumns:"minmax(340px, 480px) 1fr", height:"calc(100vh - 56px)" }}>
        {/* ═══ LEFT: EDITOR PANEL ═══ */}
        <div style={{ padding:"28px 24px", borderRight:"1px solid rgba(255,255,255,0.06)", overflowY:"auto", background:"#0D0D1F" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h1 style={{ fontSize:18, fontWeight:700, color:D.text, letterSpacing:"-0.03em" }}>Nueva pieza</h1>
            {brandProfile && (
              <div style={{ position:"relative" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(121,80,242,0.1)", borderRadius:20, padding:"3px 10px", border:"1px solid rgba(121,80,242,0.2)", cursor:"pointer" }} onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:D.purpleLight, display:"inline-block" }} />
                  <span style={{ fontSize:10, color:D.purpleLight, fontWeight:500 }}>{brandProfile.nombre || "Tu marca"}</span>
                  {allBrands.length > 1 && <span style={{ fontSize:8, color:"rgba(255,255,255,0.3)" }}>▼</span>}
                </div>
                {brandDropdownOpen && allBrands.length > 1 && (
                  <div style={{ position:"absolute", top:"100%", right:0, marginTop:6, background:"#16162d", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:4, zIndex:100, boxShadow:"0 8px 30px rgba(0,0,0,0.5)", minWidth:180 }}>
                    {allBrands.map(b => (
                      <div key={b.id} onClick={() => switchBrandInCrear(b)} style={{
                        display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:6, cursor:"pointer",
                        background: b.id === brandProfile?.id ? "rgba(121,80,242,0.15)" : "transparent",
                      }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background: b.id === brandProfile?.id ? D.purpleLight : "rgba(255,255,255,0.2)", display:"inline-block" }} />
                        <span style={{ fontSize:12, color:"#fff", fontWeight: b.id === brandProfile?.id ? 600 : 400 }}>{b.nombre || "Sin nombre"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <StepBar />

        {step === 1 && (
          <div>
            <div className="card-hover" style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:16, padding:20, marginBottom:14 }}>
              <label style={{ fontSize:13, color:D.text2, display:"block", marginBottom:8, fontWeight:500 }}>¿Qué quieres comunicar hoy?</label>
              <textarea className="input-focus" rows={4} value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder={placeholders[phIdx]}
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"11px 13px", fontSize:13, color:D.text, outline:"none", resize:"none" }} />
              <div style={{ fontSize:12, color:D.text3, marginTop:12, marginBottom:8 }}>¿Qué tipo de pieza es?</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipo(t)}
                    style={{ padding:"8px 6px", borderRadius:8, fontSize:11.5, border: tipo===t ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: tipo===t ? "rgba(121,80,242,0.12)" : "transparent", color: tipo===t ? D.purpleLight : D.text2, fontWeight: tipo===t ? 500 : 400, cursor:"pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:12, color:D.text3, marginTop:12, marginBottom:8 }}>Formato</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                {FORMATOS.map(f => (
                  <button key={f.key} onClick={() => setFormato(f.key)}
                    style={{ padding:"8px 6px", borderRadius:8, fontSize:11.5, border: formato===f.key ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: formato===f.key ? "rgba(121,80,242,0.12)" : "transparent", color: formato===f.key ? D.purpleLight : D.text2, fontWeight: formato===f.key ? 500 : 400, cursor:"pointer", textAlign:"center" }}>
                    <div>{f.label}</div>
                    <div style={{ fontSize:9, opacity:0.6, marginTop:2 }}>{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
              <div style={{ marginTop:14, marginBottom:14 }}>
                <div style={{ fontSize:12, color:D.text3, marginBottom:8 }}>Idioma de esta pieza</div>
                <div style={{ display:"flex", gap:6 }}>
                  {[
                    { key:"ADN", label:"Según mi ADN", desc: brandProfile?.idioma || "Auto" },
                    { key:"Español", label:"Español" },
                    { key:"Inglés", label:"English" },
                    { key:"Spanglish", label:"Spanglish" },
                  ].map(op => (
                    <button key={op.key} onClick={() => setIdiomaPieza(op.key)}
                      style={{ padding:"7px 12px", borderRadius:8, fontSize:11.5, border: idiomapieza===op.key ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: idiomapieza===op.key ? "rgba(121,80,242,0.12)" : "transparent", color: idiomapieza===op.key ? D.purpleLight : D.text2, fontWeight: idiomapieza===op.key ? 500 : 400, cursor:"pointer", textAlign:"center" }}>
                      <div>{op.label}</div>
                      {op.desc && <div style={{ fontSize:9, opacity:0.6, marginTop:1 }}>{op.desc}</div>}
                    </button>
                  ))}
                </div>
              </div>
            <button className="btn-primary" onClick={() => prompt.trim() && goToStep(2)}
              style={{ ...NB, background: !prompt.trim() ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", cursor: !prompt.trim() ? "not-allowed" : "pointer" }}>
              Continuar → Agregar referencias visuales
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <BackBtn toStep={1} />
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:16, padding:20, marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:4 }}>Referencias visuales</div>
              <div style={{ fontSize:12, color:D.text2, marginBottom:16, lineHeight:1.6 }}>
                Sube fotos que inspiren el estilo de tu pieza — pueden ser fotos tuyas, de tu producto, de tu estilo visual o de diseños que te gustan. Hasta 3 imágenes.
              </div>
              <input ref={refInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,3).map(f => ({ file:f, url:URL.createObjectURL(f) })); setReferencias(arr); }} />
              {referencias.length > 0 ? (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                    {referencias.map((r,i) => (
                      <div key={i} style={{ position:"relative" }}>
                        <img src={r.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:9, display:"block", border:"1.5px solid rgba(121,80,242,0.4)" }} />
                        <button onClick={() => setReferencias(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:4, right:4, width:20, height:20, borderRadius:"50%", background:"#DC2626", border:"none", color:"#fff", fontSize:10, cursor:"pointer" }}>x</button>
                      </div>
                    ))}
                    {referencias.length < 3 && (
                      <div onClick={() => refInput.current.click()}
                        style={{ aspectRatio:"1", border:"2px dashed rgba(121,80,242,0.3)", borderRadius:9, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6, background:"rgba(121,80,242,0.04)" }}>
                        <span style={{ fontSize:24, color:D.purpleLight, opacity:0.5 }}>+</span>
                        <span style={{ fontSize:10, color:D.text3 }}>Agregar foto</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:D.text3 }}>{referencias.length}/3 referencias subidas</div>
                </div>
              ) : (
                <UploadZone onClick={() => refInput.current.click()}>
                  <div style={{ fontSize:32, marginBottom:10, opacity:0.4 }}>🖼</div>
                  <div style={{ fontSize:13, color:D.text, fontWeight:500, marginBottom:4 }}>Toca aquí para subir fotos de referencia</div>
                  <div style={{ fontSize:12, color:D.text3, lineHeight:1.5 }}>Selecciona hasta 3 imágenes desde tu computadora o celular<br/>JPG, PNG · Máx. 10MB cada una</div>
                </UploadZone>
              )}
            </div>
            <button className="btn-primary" onClick={() => goToStep(3)} style={NB}>Continuar → Agregar foto de talento</button>
            <button onClick={() => { setReferencias([]); setSkipRefs(true); goToStep(3); }} style={SB}>Saltar — continuar sin referencias</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <BackBtn toStep={2} />
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:16, padding:20, marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:4 }}>Foto de talento</div>
              <div style={{ fontSize:12, color:D.text2, marginBottom:16, lineHeight:1.6 }}>
                Sube fotos de personas que quieres incluir en la imagen — puede ser una foto tuya, de tu equipo o de modelos. La IA las incorporará naturalmente en la composición. Hasta 3 fotos.
              </div>
              <input ref={talentInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,3).map(f => ({ file:f, url:URL.createObjectURL(f) })); setTalentos(prev => [...prev,...arr].slice(0,3)); }} />
              {talentos.length > 0 ? (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                    {talentos.map((t,i) => (
                      <div key={i} style={{ position:"relative" }}>
                        <img src={t.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:9, display:"block", border:"1.5px solid rgba(121,80,242,0.4)" }} />
                        <button onClick={() => setTalentos(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:4, right:4, width:20, height:20, borderRadius:"50%", background:"#DC2626", border:"none", color:"#fff", fontSize:10, cursor:"pointer" }}>x</button>
                      </div>
                    ))}
                    {talentos.length < 3 && (
                      <div onClick={() => talentInput.current.click()}
                        style={{ aspectRatio:"1", border:"2px dashed rgba(121,80,242,0.3)", borderRadius:9, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6, background:"rgba(121,80,242,0.04)" }}>
                        <span style={{ fontSize:24, color:D.purpleLight, opacity:0.5 }}>+</span>
                        <span style={{ fontSize:10, color:D.text3 }}>Agregar foto</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:D.text3 }}>{talentos.length}/3 fotos de talento</div>
                </div>
              ) : (
                <UploadZone onClick={() => talentInput.current.click()}>
                  <div style={{ fontSize:32, marginBottom:10, opacity:0.4 }}>🧑‍🤝‍🧑</div>
                  <div style={{ fontSize:13, color:D.text, fontWeight:500, marginBottom:4 }}>Toca aquí para subir fotos de personas</div>
                  <div style={{ fontSize:12, color:D.text3, lineHeight:1.5 }}>Fotos tuyas, de tu equipo o modelos<br/>La IA las incluirá en la imagen final</div>
                </UploadZone>
              )}
            </div>
            <button className="btn-primary" onClick={() => { goToStep(4); generarImagen(); }} style={{ ...NB, background:"linear-gradient(135deg,#E64980,#7950F2)" }}>
              Generar imagen con IA →
            </button>
            <button onClick={() => { setTalentos([]); setSkipTalent(true); goToStep(4); generarImagen(); }} style={SB}>
              Generar sin talento
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <BackBtn toStep={3} />
            <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", color:D.purpleLight }}>{tipo}</span>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", color:D.purpleLight }}>{FORMATOS.find(f => f.key === formato)?.label || "Post cuadrado"}</span>
              {skipRefs && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:D.text3 }}>Sin referencias</span>}
              {skipTalent && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:D.text3 }}>Sin talento</span>}
            </div>
            <div>
              {/* Image area */}
              <div style={{ background:"linear-gradient(135deg,rgba(121,80,242,0.1),rgba(230,73,128,0.08))", borderRadius:12, minHeight:260, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, position:"relative", overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
                {generatingImg ? (
                  <div style={{ textAlign:"center", padding:24 }}>
                    <div style={{ fontSize:13, color:D.purpleLight, marginBottom:12, fontWeight:500 }}>{genMsg}</div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", width:200, margin:"0 auto" }}>
                      <div style={{ height:"100%", width: Math.min(genProgress,95) + "%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4, transition:"width 0.5s" }} />
                    </div>
                    <div style={{ fontSize:11, color:D.text3, marginTop:8 }}>Art Director + Gemini · 30-45s</div>
                    <div style={{ fontSize:10, color:"rgba(121,80,242,0.5)", marginTop:4 }}>{Math.round(Math.min(genProgress,95))}%</div>
                  </div>
                ) : versiones.length > 0 ? (
                  <img src={"data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image} alt="" style={{ width:"100%", display:"block", borderRadius:12 }} />
                ) : (
                  <div style={{ textAlign:"center", opacity:0.2 }}>
                    <div style={{ fontSize:40, marginBottom:6 }}>◉</div>
                    <div style={{ fontSize:11, color:D.text }}>La imagen aparecerá aquí</div>
                  </div>
                )}
              </div>

              {/* Version thumbnails */}
              {versiones.length > 1 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:10, color:D.text3, marginBottom:6 }}>Versiones:</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {versiones.map((v,i) => (
                      <div key={i} onClick={() => setVersionActiva(i)}
                        style={{ position:"relative", width:40, height:40, borderRadius:6, overflow:"hidden", cursor:"pointer", border: versionActiva === i ? "2px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
                        <img src={"data:" + v.mimeType + ";base64," + v.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        <div style={{ position:"absolute", bottom:1, right:2, fontSize:8, color:"rgba(255,255,255,0.6)" }}>v{i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback + actions — stacked below */}
              <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:D.text, marginBottom:4 }}>¿Qué quieres cambiar?</div>
                <div style={{ fontSize:11, color:D.text3, marginBottom:8 }}>Describe qué ajustar y regenera una nueva versión</div>
                <textarea className="input-focus" value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
                  placeholder="Ej: Hazla más colorida. Cambia el fondo..."
                  style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:12, color:D.text, outline:"none", resize:"none", marginBottom:8 }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { if (!generatingImg && feedback.trim()) generarImagen(feedback); }} disabled={generatingImg || !feedback.trim()}
                    style={{ flex:1, padding:9, background: generatingImg || !feedback.trim() ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor: generatingImg || !feedback.trim() ? "not-allowed" : "pointer" }}>
                    {generatingImg ? "Generando..." : "↺ Regenerar"}
                  </button>
                  {versiones.length > 0 && !generatingImg && (
                    <button onClick={() => { setImgAprobada(true); guardarFinal(false); generarCopies(); goToStep(5); }}
                      style={{ flex:1, padding:9, background:"rgba(64,192,87,0.12)", border:"1px solid rgba(64,192,87,0.3)", color:"#86EFAC", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      ✓ Aprobar → Copy
                    </button>
                  )}
                </div>
              </div>

              {/* References + talent thumbs */}
              {(referencias.length > 0 || talentos.length > 0) && (
                <div style={{ display:"flex", gap:10, marginTop:12 }}>
                  {referencias.length > 0 && (
                    <div style={{ flex:1, background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:10 }}>
                      <div style={{ fontSize:10, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Referencias</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {referencias.map((r,i) => <img key={i} src={r.url} alt="" style={{ width:36, height:36, objectFit:"cover", borderRadius:6, display:"block" }} />)}
                      </div>
                    </div>
                  )}
                  {talentos.length > 0 && (
                    <div style={{ flex:1, background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:10 }}>
                      <div style={{ fontSize:10, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Talento</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {talentos.map((t,i) => <img key={i} src={t.url} alt="" style={{ width:36, height:36, objectFit:"cover", borderRadius:6, display:"block" }} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <div style={{ marginTop:10, background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5" }}>{error}</div>}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <BackBtn toStep={4} />
            {generatingCopy ? (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <div style={{ fontSize:14, color:D.text2, marginBottom:12 }}>Generando copies con IA...</div>
                <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", maxWidth:200, margin:"0 auto" }}>
                  <div style={{ height:"100%", width:"70%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4 }} />
                </div>
              </div>
            ) : error === "LIMIT_REACHED" ? (
              <div style={{ background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.25)", borderRadius:12, padding:20, textAlign:"center" }}>
                <div style={{ fontSize:15, fontWeight:500, color:D.purpleLight, marginBottom:8 }}>Alcanzaste tu límite mensual</div>
                <div style={{ fontSize:13, color:D.text2, marginBottom:16 }}>Actualiza tu plan para continuar generando.</div>
                <button onClick={() => router.push("/pricing")} style={{ padding:"10px 24px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>Ver planes →</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13, color:D.text2, marginBottom:14 }}>Selecciona y edita tu copy favorito</div>
                {copies.map(c => (
                  <div key={c.id} style={{ background: copySeleccionado===c.id ? "rgba(121,80,242,0.08)" : D.bg3, border: copySeleccionado===c.id ? "1.5px solid " + D.purple : "1px solid " + D.border, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
                    {editingCopy === c.id ? (
                      <div>
                        <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={7}
                          style={{ width:"100%", background:"rgba(121,80,242,0.06)", border:"1px solid " + D.purple, borderRadius:8, padding:"10px 12px", fontSize:12, color:D.text, outline:"none", resize:"none", marginBottom:8 }} />
                        <button onClick={() => { const updated = copies.map(x => x.id===c.id ? { ...x, hook: editedText.split("\n")[0], copy: editedText } : x); setCopies(updated); setEditingCopy(null); }}
                          style={{ padding:"6px 14px", background:D.purple, color:"#fff", border:"none", borderRadius:7, fontSize:12, cursor:"pointer" }}>Guardar edición</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:10, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Opción {c.id}</div>
                        <div style={{ fontSize:13, fontWeight:500, color:D.text, marginBottom:5 }}>{c.hook}</div>
                        <div style={{ fontSize:12, color:D.text2, lineHeight:1.65, marginBottom:5 }}>{c.copy}</div>
                        <div style={{ fontSize:12, color:D.purpleLight, fontWeight:500, marginBottom:5 }}>{c.cta}</div>
                        {c.hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.5)", marginBottom:10 }}>{c.hashtags}</div>}
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => { setCopySeleccionado(c.id); setEditedText(c.hook + "\n\n" + c.copy + "\n\n" + c.cta + (c.hashtags ? "\n\n" + c.hashtags : "")); }}
                            style={{ padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:500, background: copySeleccionado===c.id ? D.purple : "rgba(255,255,255,0.06)", color: copySeleccionado===c.id ? "#fff" : D.text2, border: copySeleccionado===c.id ? "none" : "1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>
                            {copySeleccionado===c.id ? "✓ Seleccionado" : "Seleccionar"}
                          </button>
                          <button onClick={() => { setEditingCopy(c.id); setEditedText(c.hook + "\n\n" + c.copy + "\n\n" + c.cta + (c.hashtags ? "\n\n" + c.hashtags : "")); }}
                            style={{ padding:"5px 12px", borderRadius:6, fontSize:11, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>
                            ✏ Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {copySeleccionado && (
                  <button onClick={() => { guardarFinal(); goToStep(6); }} disabled={savingFinal}
                    style={{ width:"100%", padding:13, background: savingFinal ? "rgba(64,192,87,0.3)" : "linear-gradient(135deg,#40C057,#2F9E44)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor: savingFinal ? "not-allowed" : "pointer", marginTop:6 }}>
                    {savingFinal ? "Guardando..." : "Guardar arte final →"}
                  </button>
                )}
                {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5", marginTop:8 }}>{error}</div>}
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div>
            {savedFinal && (
              <div style={{ background:"rgba(64,192,87,0.1)", border:"1px solid rgba(64,192,87,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:24, height:24, background:"#40C057", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", flexShrink:0 }}>✓</div>
                <span style={{ fontSize:13, color:"#86EFAC", fontWeight:500 }}>Guardado en tu biblioteca</span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:500, color:D.text }}>Arte final</div>
                <div style={{ fontSize:12, color:D.text2 }}>{tipo} · {FORMATOS.find(f => f.key === formato)?.label || "Post cuadrado"}</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              <div>
                {versiones.length > 0 && (
                  <img src={"data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image} alt="" style={{ width:"100%", borderRadius:12, display:"block", border:"1px solid rgba(255,255,255,0.1)" }} />
                )}
                <button onClick={() => {
                  if (versiones.length > 0) {
                    const a = document.createElement("a");
                    a.href = "data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image;
                    a.download = "aistudiobrand-" + Date.now() + ".png";
                    a.click();
                  }
                }} style={{ width:"100%", padding:10, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", marginTop:8 }}>
                  ⬇ Descargar imagen
                </button>
              </div>

              <div>
                {copies.find(c => c.id === copySeleccionado) && (() => {
                  const copy = copies.find(c => c.id === copySeleccionado);
                  return (
                    <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:16, padding:16, height:"100%" }}>
                      <div style={{ fontSize:10, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Copy final</div>
                      <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:8, lineHeight:1.4 }}>{copy.hook}</div>
                      <div style={{ fontSize:12, color:D.text2, lineHeight:1.7, marginBottom:8 }}>{copy.copy}</div>
                      <div style={{ fontSize:12, color:D.purpleLight, fontWeight:500, marginBottom:8 }}>{copy.cta}</div>
                      {copy.hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.5)", marginBottom:14 }}>{copy.hashtags}</div>}
                      <button onClick={() => {
                        const text = copy.hook + "\n\n" + copy.copy + "\n\n" + copy.cta + (copy.hashtags ? "\n\n" + copy.hashtags : "");
                        navigator.clipboard.writeText(text);
                      }} style={{ width:"100%", padding:9, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:12, cursor:"pointer" }}>
                        ⎘ Copiar texto
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={resetAll} style={{ flex:1, padding:11, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                + Nueva pieza
              </button>
              <button onClick={() => router.push("/biblioteca")} style={{ flex:1, padding:11, background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                Ver biblioteca →
              </button>
            </div>
          </div>
        )}
        </div>

        {/* ═══ RIGHT: PREVIEW PANEL ═══ */}
        <div style={{ background:"#080814", display:"flex", alignItems:"center", justifyContent:"center", padding:40, position:"relative", overflow:"hidden" }}>
          {/* Ambient glow */}
          <div style={{ position:"absolute", top:"20%", left:"30%", width:300, height:300, background:"radial-gradient(circle, rgba(121,80,242,0.06) 0%, transparent 60%)", filter:"blur(60px)", pointerEvents:"none" }} />

          {step <= 3 && !hasImage && (
            <div style={{ textAlign:"center" }}>
              <InstagramPreview />
              <div style={{ marginTop:16, fontSize:11, color:"rgba(255,255,255,0.2)" }}>Vista previa en tiempo real</div>
            </div>
          )}

          {step >= 4 && (
            <div style={{ textAlign:"center" }}>
              <InstagramPreview />
              {versiones.length > 1 && (
                <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:14 }}>
                  {versiones.map((v,i) => (
                    <div key={i} onClick={() => setVersionActiva(i)}
                      style={{ width:40, height:40, borderRadius:8, overflow:"hidden", cursor:"pointer", border: versionActiva === i ? "2px solid #7950F2" : "1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
                      <img src={"data:" + v.mimeType + ";base64," + v.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop:12, fontSize:11, color:"rgba(255,255,255,0.2)" }}>
                {step === 6 && savedFinal ? "Guardado en tu biblioteca" : versiones.length > 0 ? "v" + (versionActiva + 1) + " de " + versiones.length : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function Crear() {
  return (
    <Suspense fallback={null}>
      <CrearContent />
    </Suspense>
  );
}
