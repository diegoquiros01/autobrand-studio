"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { saveImage } from "../../lib/imageStore";
import AppLayout from "../components/AppLayout";
import ADNContextPanel from '../components/adn/ADNContextPanel';
import ChipSelector from '../components/adn/ChipSelector';

const TIPOS = ["Comercial","Branding","Educativo","Storytelling","Promocional","Posicionamiento"];
const FORMATOS_DATA = [
  { key:"square", label_es:"Post cuadrado", label_en:"Square post", desc:"1:1 · Feed" },
  { key:"story", label_es:"Story vertical", label_en:"Vertical story", desc:"9:16 · Stories/Reels" },
  { key:"carousel", label_es:"Carrusel", label_en:"Carousel", desc:"1:1 · Slides" },
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
  const [showRefs, setShowRefs] = useState(false);
  const [showTalent, setShowTalent] = useState(false);

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
  const [translatingCopy, setTranslatingCopy] = useState(null);

  const [savedFinal, setSavedFinal] = useState(false);
  const [error, setError] = useState("");

  const [allBrands, setAllBrands] = useState([]);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  const [lang, setLang] = useState("es");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    const handler = () => { const s = localStorage.getItem("lang"); if (s) setLang(s); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const en = lang === "en";

  const FORMATOS = FORMATOS_DATA.map(f => ({ key: f.key, label: en ? f.label_en : f.label_es, desc: f.desc }));

  const TIPO_OPTIONS = [
    { id: "Comercial", label: en ? "Comercial · Sells" : "Comercial · Vende" },
    { id: "Branding", label: en ? "Branding · Builds" : "Branding · Construye" },
    { id: "Educativo", label: en ? "Educativo · Teaches" : "Educativo · Enseña" },
    { id: "Storytelling", label: en ? "Storytelling · Connects" : "Storytelling · Conecta" },
    { id: "Promocional", label: en ? "Promocional · Offers" : "Promocional · Ofrece" },
    { id: "Posicionamiento", label: en ? "Posicionamiento · Positions" : "Posicionamiento · Posiciona" },
  ];

  const dataToProfile = (data) => ({
    id: data.id, nombre: data.nombre, descripcion: data.descripcion,
    audiencia: data.audiencia, tono: data.tono,
    idioma: data.idioma, categorias: data.categorias,
    propuestaValor: data.propuesta_valor,
    instagramUrl: data.instagram_url, webUrl: data.web_url,
    personalidad: data.personalidad, coloresMarca: data.colores_marca,
    estiloVisual: data.estilo_visual, ejemplosCopy: data.ejemplos_copy,
  });

  const loadBrandProfile = async (user) => {
    // Load all brands via server API
    if (user) {
      try {
        const res = await fetch("/api/brands?userId=" + user.id);
        const json = await res.json();
        setAllBrands(json.data || []);
      } catch(e) {}
    }

    // Load active brand
    const activeBrandId = localStorage.getItem("activeBrandId");
    const targetId = activeBrandId || (user ? null : null);
    if (targetId) {
      try {
        const res = await fetch("/api/brands?brandId=" + targetId);
        const json = await res.json();
        if (json.brand) {
          const bp = dataToProfile(json.brand);
          setBrandProfile(bp);
          localStorage.setItem("brandProfile", JSON.stringify(bp));
          localStorage.setItem("activeBrandId", json.brand.id);
          return;
        }
      } catch(e) {}
    }

    // Fallback: localStorage cache
    const cached = localStorage.getItem("brandProfile");
    if (cached) { try { setBrandProfile(JSON.parse(cached)); } catch(e) {} }
  };

  const switchBrandInCrear = async (brand) => {
    try {
      const res = await fetch("/api/brands?brandId=" + brand.id);
      const json = await res.json();
      if (json.brand) {
        const bp = dataToProfile(json.brand);
        setBrandProfile(bp);
        localStorage.setItem("brandProfile", JSON.stringify(bp));
        localStorage.setItem("activeBrandId", json.brand.id);
        window.dispatchEvent(new Event("brandChanged"));
      }
    } catch(e) {}
    setBrandDropdownOpen(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
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
    const msgs = en
      ? ["Art Director analyzing your brand...","Creating visual brief with AI...","Describing references and style...","Generating image with Gemini...","Composing the image...","Applying brand style...","Validating image quality...","Final Art Director adjustments...","Almost ready..."]
      : ["Art Director analizando tu marca...","Creando brief visual con IA...","Describiendo referencias y estilo...","Generando imagen con Gemini...","Componiendo la imagen...","Aplicando estilo de marca...","Validando calidad de imagen...","Ajustes finales del Art Director...","Casi listo..."];
    let mi = 0; setGenMsg(msgs[0]);
    const iv = setInterval(() => {
      setGenProgress(p => Math.min(p + Math.random() * 8, 90));
      mi = Math.min(mi + 1, msgs.length - 1); setGenMsg(msgs[mi]);
    }, 3000);
    try {
      const refB = referencias.length > 0 ? await Promise.all(referencias.map(async r => ({ data: await toBase64(r.file), mimeType: "image/jpeg" }))) : [];
      const talB = talentos.length > 0 ? await Promise.all(talentos.map(async t => ({ data: await toBase64(t.file), mimeType: "image/jpeg" }))) : [];
      const promptFinal = feedbackText ? prompt + ". Feedback del usuario: " + feedbackText : prompt;
      const imgController = new AbortController();
      const imgTimeout = setTimeout(() => imgController.abort(), 120000);
      const res = await fetch("/api/generate-image", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt: promptFinal, brandProfile, referencias: refB, talentos: talB, editedCopy: prompt, userId: user?.id || "", idiomapieza: idiomapieza === "ADN" ? (brandProfile?.idioma || "") : idiomapieza, formato }),
        signal: imgController.signal,
      });
      clearTimeout(imgTimeout);
      const data = await res.json();
      if (data.error === "limit_reached") {
        setError(en ? "You reached your limit of " + (data.limit || 20) + " generations this month. Upgrade your plan in Pricing." : "Alcanzaste tu límite de " + (data.limit || 20) + " generaciones este mes. Actualiza tu plan en Pricing.");
      } else if (data.image) {
        const newVersion = { image: data.image, mimeType: data.mimeType, feedback: feedbackText, timestamp: new Date().toLocaleTimeString() };
        setVersiones(prev => { const updated = [...prev, newVersion]; setVersionActiva(updated.length - 1); return updated; });
        setFeedback("");
        // Store in IndexedDB to avoid localStorage overflow
        saveImage("latest-" + Date.now(), { image: data.image, mimeType: data.mimeType }).catch(() => {});
      } else setError(en ? "Could not generate the image. Try again." : "No se pudo generar la imagen. Intenta de nuevo.");
    } catch(e) {
      if (e.name === "AbortError") { setError(en ? "Image generation timed out. Try again." : "La generación de imagen tardó demasiado. Intenta de nuevo."); }
      else { setError("Error generando imagen: " + e.message); }
    }
    clearInterval(iv); setGenProgress(100); setGeneratingImg(false); setGenMsg("");
  };

  const translateCopy = async (copyItem, targetLang) => {
    setTranslatingCopy(copyItem.id);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: copyItem.hook,
          copy: copyItem.copy,
          cta: copyItem.cta,
          hashtags: copyItem.hashtags,
          targetLang,
        }),
      });
      const data = await res.json();
      if (data.translated) {
        const t = data.translated;
        setCopies(prev => prev.map(c => c.id === copyItem.id ? { ...c, hook: t.hook || c.hook, copy: t.copy || c.copy, cta: t.cta || c.cta, hashtags: t.hashtags || c.hashtags } : c));
      }
    } catch(e) { console.warn("Translation error:", e); }
    setTranslatingCopy(null);
  };

  const generarCopies = async () => {
    setGeneratingCopy(true); setError("");
    try {
      const copyController = new AbortController();
      const copyTimeout = setTimeout(() => copyController.abort(), 60000);
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt, tipo, brandProfile, userId: user?.id || "", idiomapieza: idiomapieza === "ADN" ? (brandProfile?.idioma || "") : idiomapieza }),
        signal: copyController.signal,
      });
      clearTimeout(copyTimeout);
      const data = await res.json();
      if (data.error === "limit_reached") {
        setError(en ? "You reached your limit of " + (data.limit || 20) + " generations this month. Upgrade your plan in Pricing." : "Alcanzaste tu límite de " + (data.limit || 20) + " generaciones este mes. Actualiza tu plan en Pricing.");
      } else {
        setCopies((data.propuestas || []).slice(0, 3));
      }
    } catch(e) {
      if (e.name === "AbortError") { setError(en ? "Copy generation timed out. Try again." : "La generación de copies tardó demasiado. Intenta de nuevo."); }
      else { setError(en ? "Error generating copies." : "Error generando copies."); }
    }
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
      if (!user) { setError(en ? "You must sign in to save." : "Debes iniciar sesión para guardar."); setSavingFinal(false); return; }

      // Save directly to Supabase storage + DB using service role API
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
      if (!res.ok) {
        const text = await res.text();
        setError((en ? "Error saving (" : "Error guardando (") + res.status + "): " + text);
        setSavingFinal(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSavedFinal(true);
      } else {
        setError((en ? "Error saving piece: " : "Error guardando pieza: ") + (data.error || (en ? "Try again" : "Intenta de nuevo")));
      }
    } catch(e) {
      setError((en ? "Error saving piece: " : "Error guardando pieza: ") + e.message);
    }
    setSavingFinal(false);
  };

  const resetAll = () => {
    setStep(1); setMaxStep(1); setPrompt(""); setTipo("Comercial"); setFormato("square"); setIdiomaPieza("ADN");
    setReferencias([]); setTalentos([]); setSkipRefs(false); setSkipTalent(false);
    setShowRefs(false); setShowTalent(false);
    setVersiones([]); setCopies([]); setCopySeleccionado(null); setImgAprobada(false);
    setSavedFinal(false); setFeedback(""); setError("");
  };

  const steps = [{n:1,l:"Describe"},{n:2,l:en ? "Image + Copy" : "Imagen + Copy"},{n:3,l:"Final"}];

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
        {en ? "← Previous step" : "← Paso anterior"}
      </button>
      {maxStep > step && (
        <button onClick={() => setStep(Math.min(step + 1, maxStep))} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 0", background:"none", border:"none", color:D.purpleLight, fontSize:12, cursor:"pointer" }}>
          {en ? "Next step →" : "Siguiente paso →"}
        </button>
      )}
    </div>
  );

  const NB = { width:"100%", padding:12, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", marginBottom:8, boxShadow:"0 4px 14px rgba(121,80,242,0.4)" };
  const SB = { width:"100%", padding:11, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, cursor:"pointer" };

  // Typing placeholder effect
  const placeholders = en ? [
    "I want to announce my 3 coaching 1:1 spots...",
    "Launch my new mentorship program for Latinas in tech...",
    "Promote my Black Friday discount...",
    "Share 3 tips about productivity for entrepreneurs...",
    "Celebrate reaching 10K followers...",
  ] : [
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

  const selectedCopy = copies.find(c => c.id === copySeleccionado);

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
            <h1 style={{ fontSize:18, fontWeight:700, color:D.text, letterSpacing:"-0.03em" }}>{en ? "New piece" : "Nueva pieza"}</h1>
            {brandProfile && (
              <div style={{ position:"relative" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(121,80,242,0.1)", borderRadius:20, padding:"3px 10px", border:"1px solid rgba(121,80,242,0.2)", cursor: step === 1 ? "pointer" : "default", opacity: step === 1 ? 1 : 0.5 }} onClick={() => step === 1 && setBrandDropdownOpen(!brandDropdownOpen)}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:D.purpleLight, display:"inline-block" }} />
                  <span style={{ fontSize:10, color:D.purpleLight, fontWeight:500 }}>{brandProfile.nombre || (en ? "Your brand" : "Tu marca")}</span>
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
                        <span style={{ fontSize:12, color:"#fff", fontWeight: b.id === brandProfile?.id ? 600 : 400 }}>{b.nombre || (en ? "Unnamed" : "Sin nombre")}</span>
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
              <label style={{ fontSize:13, color:D.text2, display:"block", marginBottom:8, fontWeight:500 }}>{en ? "What do you want to communicate today?" : "¿Qué quieres comunicar hoy?"}</label>
              <textarea className="input-focus" rows={4} value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder={placeholders[phIdx]}
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"11px 13px", fontSize:13, color:D.text, outline:"none", resize:"none" }} />
              <div style={{ fontSize:12, color:D.text3, marginTop:12, marginBottom:8 }}>{en ? "What type of piece?" : "¿Qué tipo de pieza es?"}</div>
              <ChipSelector
                mode="single"
                en={en}
                options={TIPO_OPTIONS}
                value={tipo}
                onChange={setTipo}
                showCounter={false}
              />
              <div style={{ fontSize:12, color:D.text3, marginTop:12, marginBottom:8 }}>{en ? "Format" : "Formato"}</div>
              <ChipSelector
                mode="single"
                en={en}
                options={FORMATOS.map(f => ({ id: f.key, label: f.label + " · " + f.desc }))}
                value={formato}
                onChange={setFormato}
                showCounter={false}
              />
            </div>
              <div style={{ marginTop:14, marginBottom:14 }}>
                <div style={{ fontSize:12, color:D.text3, marginBottom:8 }}>
                  {en ? "Language for this piece" : "Idioma de esta pieza"}
                  {brandProfile?.idioma && <span style={{ fontSize:10, color:D.purpleLight, marginLeft:8 }}>ADN: {brandProfile.idioma}</span>}
                </div>
                <ChipSelector
                  mode="single"
                  en={en}
                  options={[
                    { id: "ADN", label: en ? "From DNA" : "Según ADN" },
                    { id: "Español", label: "Español" },
                    { id: "Inglés", label: "English" },
                    { id: "Spanglish", label: "Spanglish" },
                  ]}
                  value={idiomapieza}
                  onChange={setIdiomaPieza}
                  showCounter={false}
                />
              </div>

            {/* Collapsible: Visual References (optional) */}
            <div style={{ marginTop:16 }}>
              <button onClick={() => setShowRefs(!showRefs)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:D.bg3, border:"1px solid " + D.border, borderRadius:10, color:D.text2, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                <span>{en ? "Visual References (optional)" : "Referencias visuales (opcional)"} {referencias.length > 0 ? "(" + referencias.length + ")" : ""}</span>
                <span style={{ fontSize:11 }}>{showRefs ? "\u25B2" : "\u25BC"}</span>
              </button>
              {showRefs && (
                <div style={{ marginTop:10, background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:12, color:D.text2, marginBottom:12, lineHeight:1.6 }}>
                    {en ? "Upload photos that inspire your piece's style — they can be photos of you, your product, your visual style or designs you like. Up to 3 images." : "Sube fotos que inspiren el estilo de tu pieza — pueden ser fotos tuyas, de tu producto, de tu estilo visual o de diseños que te gustan. Hasta 3 imágenes."}
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
                            <span style={{ fontSize:10, color:D.text3 }}>{en ? "Add photo" : "Agregar foto"}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:D.text3 }}>{referencias.length}/3 {en ? "references uploaded" : "referencias subidas"}</div>
                    </div>
                  ) : (
                    <UploadZone onClick={() => refInput.current.click()}>
                      <div style={{ fontSize:32, marginBottom:10, opacity:0.4 }}>🖼</div>
                      <div style={{ fontSize:13, color:D.text, fontWeight:500, marginBottom:4 }}>{en ? "Tap here to upload reference photos" : "Toca aquí para subir fotos de referencia"}</div>
                      <div style={{ fontSize:12, color:D.text3, lineHeight:1.5 }}>{en ? "Select up to 3 images from your computer or phone" : "Selecciona hasta 3 imágenes desde tu computadora o celular"}<br/>JPG, PNG · {en ? "Max." : "Máx."} 10MB</div>
                    </UploadZone>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible: Talent Photos (optional) */}
            <div style={{ marginTop:10 }}>
              <button onClick={() => setShowTalent(!showTalent)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:D.bg3, border:"1px solid " + D.border, borderRadius:10, color:D.text2, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                <span>{en ? "Talent Photos (optional)" : "Fotos de talento (opcional)"} {talentos.length > 0 ? "(" + talentos.length + ")" : ""}</span>
                <span style={{ fontSize:11 }}>{showTalent ? "\u25B2" : "\u25BC"}</span>
              </button>
              {showTalent && (
                <div style={{ marginTop:10, background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:12, color:D.text2, marginBottom:12, lineHeight:1.6 }}>
                    {en ? "Upload photos of people you want to include in the image — it can be a photo of you, your team or models. The AI will naturally incorporate them into the composition. Up to 3 photos." : "Sube fotos de personas que quieres incluir en la imagen — puede ser una foto tuya, de tu equipo o de modelos. La IA las incorporará naturalmente en la composición. Hasta 3 fotos."}
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
                            <span style={{ fontSize:10, color:D.text3 }}>{en ? "Add photo" : "Agregar foto"}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:D.text3 }}>{talentos.length}/3 {en ? "talent photos" : "fotos de talento"}</div>
                    </div>
                  ) : (
                    <UploadZone onClick={() => talentInput.current.click()}>
                      <div style={{ fontSize:32, marginBottom:10, opacity:0.4 }}>🧑‍🤝‍🧑</div>
                      <div style={{ fontSize:13, color:D.text, fontWeight:500, marginBottom:4 }}>{en ? "Tap here to upload photos of people" : "Toca aquí para subir fotos de personas"}</div>
                      <div style={{ fontSize:12, color:D.text3, lineHeight:1.5 }}>{en ? "Photos of you, your team or models" : "Fotos tuyas, de tu equipo o modelos"}<br/>{en ? "The AI will include them in the final image" : "La IA las incluirá en la imagen final"}</div>
                    </UploadZone>
                  )}
                </div>
              )}
            </div>

            {error && <div style={{ marginTop:10, background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5" }}>{error}</div>}

            <button className="btn-primary" onClick={() => { if (!prompt.trim()) return; if (!brandProfile) { setError(en ? "You need to create a Brand DNA first" : "Necesitas crear un ADN de marca primero"); return; } goToStep(2); generarImagen(); }}
              style={{ ...NB, marginTop:18, background: !prompt.trim() ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#E64980,#7950F2)", cursor: !prompt.trim() ? "not-allowed" : "pointer" }}>
              {en ? "Generate with AI \u2192" : "Generar con IA \u2192"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <BackBtn toStep={1} />
            <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", color:D.purpleLight }}>{tipo}</span>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", color:D.purpleLight }}>{FORMATOS.find(f => f.key === formato)?.label || (en ? "Square post" : "Post cuadrado")}</span>
              {referencias.length === 0 && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:D.text3 }}>{en ? "No refs" : "Sin refs"}</span>}
              {talentos.length === 0 && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:D.text3 }}>{en ? "No talent" : "Sin talento"}</span>}
            </div>
            <div>
              {/* Image area */}
              <div style={{ background:"linear-gradient(180deg, #1a0a2e 0%, #0f0f24 50%, #0D0D1F 100%)", borderRadius:14, minHeight:280, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, position:"relative", overflow:"hidden", border:"1px solid rgba(121,80,242,0.15)" }}>
                {/* Background orbs */}
                <div style={{ position:"absolute", top:"-20%", left:"20%", width:"60%", height:"60%", borderRadius:"50%", background:"radial-gradient(circle, rgba(121,80,242,0.25) 0%, transparent 70%)", filter:"blur(40px)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", bottom:"-10%", right:"10%", width:"40%", height:"40%", borderRadius:"50%", background:"radial-gradient(circle, rgba(230,73,128,0.15) 0%, transparent 70%)", filter:"blur(40px)", pointerEvents:"none" }} />
                {generatingImg ? (
                  <div style={{ textAlign:"center", padding:28, position:"relative", zIndex:1 }}>
                    <div style={{ fontSize:14, color:D.purpleLight, marginBottom:14, fontWeight:600 }}>{genMsg}</div>
                    <div style={{ height:5, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden", width:220, margin:"0 auto" }}>
                      <div style={{ height:"100%", width: Math.min(genProgress,95) + "%", background:"linear-gradient(90deg,#7950F2,#A78BFA)", borderRadius:4, transition:"width 0.5s" }} />
                    </div>
                    <div style={{ fontSize:11, color:D.text3, marginTop:10 }}>Art Director + Gemini · 30-45s</div>
                    <div style={{ fontSize:11, color:"rgba(121,80,242,0.6)", marginTop:4, fontWeight:500 }}>{Math.round(Math.min(genProgress,95))}%</div>
                  </div>
                ) : versiones.length > 0 ? (
                  <img src={"data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image} alt="" style={{ width:"100%", display:"block", borderRadius:12 }} />
                ) : (
                  <div style={{ textAlign:"center", opacity:0.2 }}>
                    <div style={{ fontSize:40, marginBottom:6 }}>◉</div>
                    <div style={{ fontSize:11, color:D.text }}>{en ? "The image will appear here" : "La imagen aparecerá aquí"}</div>
                  </div>
                )}
              </div>

              {/* Version thumbnails */}
              {versiones.length > 1 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:10, color:D.text3, marginBottom:6 }}>{en ? "Versions:" : "Versiones:"}</div>
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
              {!imgAprobada && (
              <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:D.text, marginBottom:4 }}>{en ? "What do you want to change?" : "¿Qué quieres cambiar?"}</div>
                <div style={{ fontSize:11, color:D.text3, marginBottom:8 }}>{en ? "Describe what to adjust and regenerate a new version" : "Describe qué ajustar y regenera una nueva versión"}</div>
                <textarea className="input-focus" value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
                  placeholder={en ? "E.g.: Make it more colorful. Change the background..." : "Ej: Hazla más colorida. Cambia el fondo..."}
                  style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:12, color:D.text, outline:"none", resize:"none", marginBottom:8 }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { if (!generatingImg && feedback.trim()) generarImagen(feedback); }} disabled={generatingImg || !feedback.trim()}
                    style={{ flex:1, padding:9, background: generatingImg || !feedback.trim() ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor: generatingImg || !feedback.trim() ? "not-allowed" : "pointer" }}>
                    {generatingImg ? (en ? "Generating..." : "Generando...") : "\u21BA " + (en ? "Regenerate" : "Regenerar")}
                  </button>
                  {versiones.length > 0 && !generatingImg && (
                    <button onClick={() => { setImgAprobada(true); generarCopies(); }}
                      style={{ flex:1, padding:9, background:"rgba(64,192,87,0.12)", border:"1px solid rgba(64,192,87,0.3)", color:"#86EFAC", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      {en ? "\u2713 Approve" : "\u2713 Aprobar"}
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* References + talent thumbs */}
              {(referencias.length > 0 || talentos.length > 0) && (
                <div style={{ display:"flex", gap:10, marginTop:12 }}>
                  {referencias.length > 0 && (
                    <div style={{ flex:1, background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:10 }}>
                      <div style={{ fontSize:10, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{en ? "References" : "Referencias"}</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {referencias.map((r,i) => <img key={i} src={r.url} alt="" style={{ width:36, height:36, objectFit:"cover", borderRadius:6, display:"block" }} />)}
                      </div>
                    </div>
                  )}
                  {talentos.length > 0 && (
                    <div style={{ flex:1, background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:10 }}>
                      <div style={{ fontSize:10, color:D.text3, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{en ? "Talent" : "Talento"}</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {talentos.map((t,i) => <img key={i} src={t.url} alt="" style={{ width:36, height:36, objectFit:"cover", borderRadius:6, display:"block" }} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <div style={{ marginTop:10, background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5" }}>{error}</div>}
            </div>

            {/* ─── Copy section (appears after image is approved) ─── */}
            {imgAprobada && (
              <div style={{ marginTop:20, borderTop:"1px solid " + D.border, paddingTop:20 }}>
                <div style={{ fontSize:14, fontWeight:600, color:D.text, marginBottom:12 }}>{en ? "Copy" : "Copy"}</div>
                {generatingCopy ? (
                  <div style={{ textAlign:"center", padding:"48px 0" }}>
                    <div style={{ fontSize:14, color:D.text2, marginBottom:12 }}>{en ? "Generating copies with AI..." : "Generando copies con IA..."}</div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", maxWidth:200, margin:"0 auto" }}>
                      <div style={{ height:"100%", width:"70%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4 }} />
                    </div>
                  </div>
                ) : error === "LIMIT_REACHED" ? (
                  <div style={{ background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.25)", borderRadius:12, padding:20, textAlign:"center" }}>
                    <div style={{ fontSize:15, fontWeight:500, color:D.purpleLight, marginBottom:8 }}>{en ? "You reached your monthly limit" : "Alcanzaste tu límite mensual"}</div>
                    <div style={{ fontSize:13, color:D.text2, marginBottom:16 }}>{en ? "Upgrade your plan to continue generating." : "Actualiza tu plan para continuar generando."}</div>
                    <button onClick={() => router.push("/pricing")} style={{ padding:"10px 24px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>{en ? "View plans \u2192" : "Ver planes \u2192"}</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:13, color:D.text2, marginBottom:14 }}>{en ? "Select and edit your favorite copy" : "Selecciona y edita tu copy favorito"}</div>
                    {copies.map(c => (
                      <div key={c.id} style={{ background: copySeleccionado===c.id ? "rgba(121,80,242,0.08)" : D.bg3, border: copySeleccionado===c.id ? "1.5px solid " + D.purple : "1px solid " + D.border, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
                        {editingCopy === c.id ? (
                          <div>
                            <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={7}
                              style={{ width:"100%", background:"rgba(121,80,242,0.06)", border:"1px solid " + D.purple, borderRadius:8, padding:"10px 12px", fontSize:12, color:D.text, outline:"none", resize:"none", marginBottom:8 }} />
                            <button onClick={() => { const updated = copies.map(x => x.id===c.id ? { ...x, hook: editedText.split("\n")[0], copy: editedText } : x); setCopies(updated); setEditingCopy(null); }}
                              style={{ padding:"6px 14px", background:D.purple, color:"#fff", border:"none", borderRadius:7, fontSize:12, cursor:"pointer" }}>{en ? "Save edit" : "Guardar edición"}</button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize:10, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{en ? "Option" : "Opción"} {c.id}</div>
                            <div style={{ fontSize:13, fontWeight:500, color:D.text, marginBottom:5 }}>{c.hook}</div>
                            <div style={{ fontSize:12, color:D.text2, lineHeight:1.65, marginBottom:5 }}>{c.copy}</div>
                            <div style={{ fontSize:12, color:D.purpleLight, fontWeight:500, marginBottom:5 }}>{c.cta}</div>
                            {c.hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.5)", marginBottom:10 }}>{c.hashtags}</div>}
                            <div style={{ display:"flex", gap:6 }}>
                              <button onClick={() => { setCopySeleccionado(c.id); setEditedText(c.hook + "\n\n" + c.copy + "\n\n" + c.cta + (c.hashtags ? "\n\n" + c.hashtags : "")); }}
                                style={{ padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:500, background: copySeleccionado===c.id ? D.purple : "rgba(255,255,255,0.06)", color: copySeleccionado===c.id ? "#fff" : D.text2, border: copySeleccionado===c.id ? "none" : "1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>
                                {copySeleccionado===c.id ? (en ? "\u2713 Selected" : "\u2713 Seleccionado") : (en ? "Select" : "Seleccionar")}
                              </button>
                              <button onClick={() => { setEditingCopy(c.id); setEditedText(c.hook + "\n\n" + c.copy + "\n\n" + c.cta + (c.hashtags ? "\n\n" + c.hashtags : "")); }}
                                style={{ padding:"5px 12px", borderRadius:6, fontSize:11, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>
                                {en ? "\u270F Edit" : "\u270F Editar"}
                              </button>
                              <div style={{ position: "relative", display: "inline-block" }}>
                                <button onClick={(e) => {
                                  const btn = e.currentTarget;
                                  const menu = btn.nextElementSibling;
                                  menu.style.display = menu.style.display === "block" ? "none" : "block";
                                }}
                                  disabled={translatingCopy === c.id}
                                  style={{ padding:"5px 12px", borderRadius:6, fontSize:11, background:"rgba(255,255,255,0.04)", color: translatingCopy === c.id ? D.purpleLight : D.text2, border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>
                                  {translatingCopy === c.id ? (en ? "Translating..." : "Traduciendo...") : (en ? "🌐 Translate" : "🌐 Traducir")}
                                </button>
                                <div style={{ display: "none", position: "absolute", bottom: "100%", left: 0, marginBottom: 4, background: "#16162d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 4, zIndex: 10, minWidth: 120 }}>
                                  <button onClick={() => translateCopy(c, "Español")} style={{ display: "block", width: "100%", padding: "6px 12px", background: "none", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", textAlign: "left", borderRadius: 4 }}>Español</button>
                                  <button onClick={() => translateCopy(c, "English")} style={{ display: "block", width: "100%", padding: "6px 12px", background: "none", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", textAlign: "left", borderRadius: 4 }}>English</button>
                                  <button onClick={() => translateCopy(c, "Spanglish")} style={{ display: "block", width: "100%", padding: "6px 12px", background: "none", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", textAlign: "left", borderRadius: 4 }}>Spanglish</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button onClick={() => { guardarFinal(); goToStep(3); }} disabled={savingFinal || !copySeleccionado}
                      style={{ width:"100%", padding:13, background: (savingFinal || !copySeleccionado) ? "rgba(64,192,87,0.3)" : "linear-gradient(135deg,#40C057,#2F9E44)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor: (savingFinal || !copySeleccionado) ? "not-allowed" : "pointer", marginTop:6, opacity: !copySeleccionado ? 0.5 : 1 }}>
                      {savingFinal ? (en ? "Saving..." : "Guardando...") : (en ? "Save final art \u2192" : "Guardar arte final \u2192")}
                    </button>
                    {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5", marginTop:8 }}>{error}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <BackBtn toStep={2} />
            {savedFinal && (
              <div style={{ background:"rgba(64,192,87,0.1)", border:"1px solid rgba(64,192,87,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:24, height:24, background:"#40C057", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", flexShrink:0 }}>✓</div>
                <span style={{ fontSize:13, color:"#86EFAC", fontWeight:500 }}>{en ? "Saved to your library" : "Guardado en tu biblioteca"}</span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:500, color:D.text }}>{en ? "Final art" : "Arte final"}</div>
                <div style={{ fontSize:12, color:D.text2 }}>{tipo} · {FORMATOS.find(f => f.key === formato)?.label || (en ? "Square post" : "Post cuadrado")}</div>
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
                  {en ? "⬇ Download image" : "⬇ Descargar imagen"}
                </button>
              </div>

              <div>
                {copies.find(c => c.id === copySeleccionado) && (() => {
                  const copy = copies.find(c => c.id === copySeleccionado);
                  return (
                    <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:16, padding:16, height:"100%" }}>
                      <div style={{ fontSize:10, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{en ? "Final copy" : "Copy final"}</div>
                      <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:8, lineHeight:1.4 }}>{copy.hook}</div>
                      <div style={{ fontSize:12, color:D.text2, lineHeight:1.7, marginBottom:8 }}>{copy.copy}</div>
                      <div style={{ fontSize:12, color:D.purpleLight, fontWeight:500, marginBottom:8 }}>{copy.cta}</div>
                      {copy.hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.5)", marginBottom:14 }}>{copy.hashtags}</div>}
                      <button onClick={() => {
                        const text = copy.hook + "\n\n" + copy.copy + "\n\n" + copy.cta + (copy.hashtags ? "\n\n" + copy.hashtags : "");
                        navigator.clipboard.writeText(text);
                      }} style={{ width:"100%", padding:9, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:12, cursor:"pointer" }}>
                        {en ? "⎘ Copy text" : "⎘ Copiar texto"}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Publish to Instagram */}
            <button onClick={async () => {
              try {
                // Copy text to clipboard
                const copy = copies.find(c => c.id === copySeleccionado);
                if (copy) {
                  const text = copy.hook + "\n\n" + copy.copy + "\n\n" + copy.cta + (copy.hashtags ? "\n\n" + copy.hashtags : "");
                  await navigator.clipboard.writeText(text);
                }
                // Download image so user has it ready
                if (versiones.length > 0) {
                  const v = versiones[versionActiva];
                  const byteChars = atob(v.image);
                  const byteArr = new Uint8Array(byteChars.length);
                  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
                  const blob = new Blob([byteArr], { type: v.mimeType });
                  // Try to copy image to clipboard (works on desktop browsers)
                  try { await navigator.clipboard.write([new ClipboardItem({ [v.mimeType]: blob })]); } catch(e) {}
                  // Also download as backup
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "aistudiobrand-" + Date.now() + ".png";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }
                // Open Instagram
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                  window.location.href = "instagram://camera";
                  setTimeout(() => { window.open("https://www.instagram.com/", "_blank"); }, 1500);
                } else {
                  window.open("https://www.instagram.com/", "_blank");
                }
              } catch(e) { console.error(e); }
            }} style={{ width:"100%", padding:13, background:"linear-gradient(135deg, #E1306C, #F77737, #FCAF45)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10, boxShadow:"0 4px 14px rgba(225,48,108,0.3)", letterSpacing:"-0.02em", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              {en ? "Post to Instagram" : "Publicar en Instagram"}
            </button>
            <div style={{ fontSize:11, color:D.text3, textAlign:"center", marginBottom:14, lineHeight:1.5 }}>
              {en ? "Downloads the image and copies text to clipboard. Paste it on Instagram." : "Se descarga la imagen y copia el texto al clipboard. Pégalo en Instagram."}
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { if (confirm(en ? "Start a new piece? Current progress will be lost." : "¿Crear nueva pieza? El progreso actual se perderá.")) resetAll(); }} style={{ flex:1, padding:11, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                {en ? "+ New piece" : "+ Nueva pieza"}
              </button>
              <button onClick={() => router.push("/biblioteca")} style={{ flex:1, padding:11, background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                {en ? "View library →" : "Ver biblioteca →"}
              </button>
            </div>
          </div>
        )}
        </div>

        {/* ═══ RIGHT: PREVIEW PANEL ═══ */}
        <div style={{ background:"#080814", display:"flex", alignItems:"center", justifyContent:"center", padding:40, position:"relative", overflow:"hidden" }}>
          {/* Ambient glow */}
          <div style={{ position:"absolute", top:"20%", left:"30%", width:300, height:300, background:"radial-gradient(circle, rgba(121,80,242,0.06) 0%, transparent 60%)", filter:"blur(60px)", pointerEvents:"none" }} />

          <ADNContextPanel
            en={en}
            adn={{
              voz: brandProfile ? (Array.isArray(brandProfile.tono) ? brandProfile.tono.join(' + ') : brandProfile.tono || '') : '',
              idioma: brandProfile?.idioma || '',
              audiencia: brandProfile?.audiencia || '',
              paleta: brandProfile?.coloresMarca || [],
            }}
            previewState={generatingImg ? "generating" : versiones.length > 0 ? "ready" : "empty"}
            generatedImageUrl={versiones.length > 0 ? "data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image : null}
            generatedCopy={selectedCopy ? selectedCopy.hook + " " + selectedCopy.copy : null}
            brandName={brandProfile?.nombre || (en ? "Your brand" : "Tu marca")}
            pieceType={tipo}
          />
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
