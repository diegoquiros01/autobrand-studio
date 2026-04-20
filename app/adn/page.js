"use client";
import { useState, useEffect, useRef, useCallback, memo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";

const D = {
  bg: "#0A0A1A", bg2: "#16162D",
  bg3: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#fff", text2: "rgba(255,255,255,0.55)",
  text3: "rgba(255,255,255,0.3)",
  purple: "#7950F2", purpleLight: "#A78BFA",
};

const tonos = ["Empoderador","Cercano","Profesional","Divertido","Inspiracional","Educativo"];
const idiomas = ["Español","Inglés","Bilingüe"];
const cats = ["Coaching","Lifestyle","Moda","Belleza","Negocio","Motivación","Educación","Fitness","Recetas","Familia"];
const presetColors = ["#FF6B35","#7950F2","#E64980","#FFD93D","#40C057","#1971C2","#F8F9FA","#0A0A0A"];

// Memoized input to prevent full-page re-renders on each keystroke
const MemoInput = memo(function MemoInput({ value, onChange, placeholder, style, type = "input", minHeight }) {
  const inpStyle = {
    width: "100%",
    backgroundColor: value && value.toString().trim() ? "rgba(121,80,242,0.06)" : D.bg3,
    border: "1px solid " + (value && value.toString().trim() ? "rgba(121,80,242,0.3)" : D.border),
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: D.text,
    outline: "none", transition: "all 0.3s ease", fontFamily: "Inter, sans-serif",
    letterSpacing: "-0.02em", ...(style || {}),
  };
  if (type === "textarea") {
    return <textarea className="input-focus" style={{ ...inpStyle, minHeight: minHeight || 80, resize: "none" }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />;
  }
  return <input className="input-focus" style={inpStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />;
});

const STEPS = [
  { n: 1, title: "Conexión y Análisis IA", sub: "Conecta tus canales y deja que la IA construya tu ADN" },
  { n: 2, title: "Voz y Comunicación", sub: "Define quién eres, a quién le hablas y cómo suenas" },
  { n: 3, title: "Estilo Visual y Referencias", sub: "Tu personalidad visual, colores y ejemplos de copy ideal" },
];

const BLANK_PROFILE = {
  nombre: "", descripcion: "", audiencia: "", tono: [],
  idioma: "", categorias: [], propuestaValor: "",
  instagramUrl: "", tiktokUrl: "", webUrl: "", canvaUrl: "",
  personalidad: "", coloresMarca: [], estiloVisual: "",
  ejemplosCopy: ["", "", ""], competidores: ["", "", ""],
};

const dataToProfile = (data) => ({
  nombre: data.nombre || "", descripcion: data.descripcion || "",
  audiencia: data.audiencia || "", tono: Array.isArray(data.tono) ? data.tono : (data.tono ? [data.tono] : []),
  idioma: data.idioma || "", categorias: data.categorias || [],
  propuestaValor: data.propuesta_valor || "",
  instagramUrl: data.instagram_url || "", tiktokUrl: data.tiktok_url || "",
  webUrl: data.web_url || "", canvaUrl: data.canva_url || "",
  personalidad: data.personalidad || "", coloresMarca: data.colores_marca || [],
  estiloVisual: data.estilo_visual || "",
  ejemplosCopy: data.ejemplos_copy && data.ejemplos_copy.length > 0 ? data.ejemplos_copy : ["", "", ""],
  competidores: data.competidores && data.competidores.length > 0 ? data.competidores : ["", "", ""],
});

function ADNContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  const paramBrandId = searchParams.get("brand");
  const isNewBrand = searchParams.get("new") === "true";

  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [brandId, setBrandId] = useState(null); // current brand profile ID
  const [profile, setProfile] = useState({ ...BLANK_PROFILE });

  const [saveStatus, setSaveStatus] = useState("idle");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const [analyzeError, setAnalyzeError] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [sources, setSources] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("");
  const [customCatInput, setCustomCatInput] = useState("");
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [exitWarning, setExitWarning] = useState(false);

  const debounceRef = useRef(null);
  const profileRef = useRef(profile);
  const userRef = useRef(user);
  const brandIdRef = useRef(brandId);
  const initialLoadDone = useRef(false);

  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { brandIdRef.current = brandId; }, [brandId]);

  // --- Load ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // New brand → blank profile, no load
      if (isNewBrand) {
        setProfile({ ...BLANK_PROFILE });
        setBrandId(null);
        initialLoadDone.current = true;
        return;
      }

      // Specific brand from URL or active brand from localStorage
      const targetId = paramBrandId || localStorage.getItem("activeBrandId");

      if (targetId) {
        const { data } = await supabase.from("brand_profiles").select("*").eq("id", targetId).single();
        if (data) {
          const loaded = dataToProfile(data);
          setProfile(loaded);
          setBrandId(data.id);
          localStorage.setItem("activeBrandId", data.id);
          localStorage.setItem("brandProfile", JSON.stringify({ id: data.id, ...loaded }));
          initialLoadDone.current = true;
          return;
        }
      }

      // Fallback: load first brand for this user
      const { data: allBrands } = await supabase.from("brand_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1);
      if (allBrands && allBrands.length > 0) {
        const data = allBrands[0];
        const loaded = dataToProfile(data);
        setProfile(loaded);
        setBrandId(data.id);
        localStorage.setItem("activeBrandId", data.id);
        localStorage.setItem("brandProfile", JSON.stringify({ id: data.id, ...loaded }));
      }
      initialLoadDone.current = true;
    };
    init();
  }, []);

  // --- Save ---
  const handleSave = useCallback(async () => {
    const u = userRef.current;
    const p = profileRef.current;
    const currentBrandId = brandIdRef.current;
    if (!u) return;
    setSaveStatus("saving");
    const payload = {
      nombre: p.nombre, descripcion: p.descripcion,
      audiencia: p.audiencia, tono: p.tono,
      idioma: p.idioma, categorias: p.categorias,
      propuesta_valor: p.propuestaValor,
      instagram_url: p.instagramUrl, tiktok_url: p.tiktokUrl,
      web_url: p.webUrl, canva_url: p.canvaUrl,
      personalidad: p.personalidad,
      colores_marca: p.coloresMarca.filter(c => c),
      estilo_visual: p.estiloVisual,
      ejemplos_copy: p.ejemplosCopy.filter(e => e),
      competidores: p.competidores.filter(c => c),
      updated_at: new Date().toISOString(),
    };

    if (currentBrandId) {
      // Update existing brand
      await supabase.from("brand_profiles").update(payload).eq("id", currentBrandId);
    } else {
      // Insert new brand
      const { data: inserted } = await supabase.from("brand_profiles").insert({ ...payload, user_id: u.id }).select("id").single();
      if (inserted) {
        brandIdRef.current = inserted.id;
        setBrandId(inserted.id);
        localStorage.setItem("activeBrandId", inserted.id);
      }
    }

    // Update localStorage cache
    const bid = brandIdRef.current;
    localStorage.setItem("brandProfile", JSON.stringify({ id: bid, ...p }));
    window.dispatchEvent(new Event("brandChanged"));
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, []);

  // Autosave on change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSave(), 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [profile, handleSave]);

  // --- Progress ---
  const progressFields = [
    { key: "nombre", done: !!profile.nombre.trim() },
    { key: "descripcion", done: !!profile.descripcion.trim() },
    { key: "audiencia", done: !!profile.audiencia.trim() },
    { key: "tono", done: (Array.isArray(profile.tono) ? profile.tono : [profile.tono]).filter(Boolean).length > 0 },
    { key: "idioma", done: !!profile.idioma },
    { key: "propuestaValor", done: !!profile.propuestaValor.trim() },
    { key: "instagramUrl", done: !!profile.instagramUrl.trim() },
    { key: "personalidad", done: !!profile.personalidad.trim() },
    { key: "coloresMarca", done: profile.coloresMarca.length > 0 },
    { key: "ejemplosCopy", done: profile.ejemplosCopy.some(e => e && e.trim()) },
  ];
  const filledCount = progressFields.filter(f => f.done).length;
  const pct = Math.round((filledCount / progressFields.length) * 100);

  // Confetti
  useEffect(() => {
    if (pct === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [pct]);

  // --- Navigation ---
  const goNext = async () => {
    await handleSave();
    if (step < 3) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goPrev = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Helpers ---
  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
  });

  const analyzeInstagram = async () => {
    if (sources.length === 0) return;
    setAnalyzing(true); setAnalyzeProgress(0); setAnalyzeError("");
    const msgs = ["Recopilando tus fuentes...", "Leyendo tu página web...", "Analizando tu contenido visual...", "Identificando tu tono y personalidad...", "Detectando tu audiencia...", "Construyendo tu ADN de marca..."];
    let mi = 0; setAnalyzeMsg(msgs[0]);
    const iv = setInterval(() => {
      setAnalyzeProgress(p => Math.min(p + Math.random() * 15, 88));
      mi = Math.min(mi + 1, msgs.length - 1); setAnalyzeMsg(msgs[mi]);
    }, 2000);
    try {
      const images = await Promise.all(screenshots.map(async s => ({ data: await toBase64(s.file), mimeType: s.file.type })));
      const res = await fetch("/api/analyze-brand", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, instagramUrl: profile.instagramUrl, tiktokUrl: profile.tiktokUrl, webUrl: profile.webUrl, sources }),
      });
      const data = await res.json();
      if (data.profile) {
        const ap = data.profile;
        if (ap.tono && !Array.isArray(ap.tono)) ap.tono = [ap.tono];
        setProfile(prev => ({ ...prev, ...ap, instagramUrl: prev.instagramUrl, tiktokUrl: prev.tiktokUrl, webUrl: prev.webUrl, canvaUrl: prev.canvaUrl }));
      } else if (data.error) {
        setAnalyzeError("Error: " + data.error);
      }
    } catch (e) { setAnalyzeError("Error analizando tu marca. Intenta de nuevo."); }
    clearInterval(iv); setAnalyzeProgress(100); setAnalyzing(false); setAnalyzeMsg("");
  };

  // --- Styles ---
  const inp = (value) => ({
    width: "100%",
    backgroundColor: value && value.toString().trim() ? "rgba(121,80,242,0.06)" : D.bg3,
    border: "1px solid " + (value && value.toString().trim() ? "rgba(121,80,242,0.3)" : D.border),
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: D.text,
    outline: "none", transition: "all 0.3s ease", fontFamily: "Inter, sans-serif",
    letterSpacing: "-0.02em",
  });

  const card = { background: D.bg2, border: "1px solid " + D.border, borderRadius: 16, padding: "24px", transition: "all 0.3s ease" };
  const label = { fontSize: 13, color: D.text2, display: "block", marginBottom: 6, fontWeight: 500, letterSpacing: "-0.02em" };
  const chip = (active) => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
    border: active ? "1.5px solid " + D.purple : "1px solid " + D.border,
    background: active ? "rgba(121,80,242,0.15)" : "transparent",
    color: active ? D.purpleLight : D.text2,
    transition: "all 0.3s ease",
  });

  // --- Progress Circle ---
  const circleR = 38;
  const circleC = 2 * Math.PI * circleR;
  const circleOffset = circleC - (pct / 100) * circleC;

  return (
    <AppLayout>
      {showConfetti && <ConfettiEffect />}

      <div style={{ background: D.bg, minHeight: "calc(100vh - 64px)", paddingBottom: 100 }}>
        {/* Header with stepper */}
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #1a0a2e 0%, " + D.bg + " 100%)", padding: "44px 24px 40px" }}>
          {/* Orbs */}
          <div className="orb-1" style={{ position: "absolute", top: "-20%", left: "15%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(121,80,242,0.4) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div className="orb-2" style={{ position: "absolute", top: "0%", right: "5%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,73,128,0.2) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
          {/* Scan line */}
          <div className="scan-line" style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(121,80,242,0.3), transparent)", pointerEvents: "none" }} />
          {/* Brackets */}
          <div style={{ position: "absolute", top: 16, left: 20, width: 16, height: 16, borderTop: "2px solid rgba(121,80,242,0.25)", borderLeft: "2px solid rgba(121,80,242,0.25)" }} />
          <div style={{ position: "absolute", top: 16, right: 20, width: 16, height: 16, borderTop: "2px solid rgba(121,80,242,0.25)", borderRight: "2px solid rgba(121,80,242,0.25)" }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto" }}>
            {/* Top row: title + progress circle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: D.text, marginBottom: 4, letterSpacing: "-0.03em" }}>
                  {isOnboarding ? "Entrena a tu clon digital" : "ADN de tu marca"}
                </h1>
                <p style={{ fontSize: 14, color: D.text2, letterSpacing: "-0.02em" }}>
                  {STEPS[step - 1].sub}
                </p>
              </div>
              {/* Progress circle */}
              <div style={{ position: "relative", width: 86, height: 86, flexShrink: 0 }}>
                <svg width="86" height="86" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="43" cy="43" r={circleR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                  <circle cx="43" cy="43" r={circleR} fill="none" stroke={pct === 100 ? "#40C057" : D.purple} strokeWidth="5" strokeDasharray={circleC} strokeDashoffset={circleOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: pct === 100 ? "#40C057" : D.text, letterSpacing: "-0.03em" }}>{pct}%</span>
                  <span style={{ fontSize: 9, color: D.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>ADN</span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                  <button onClick={() => setStep(s.n)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, transition: "all 0.3s ease",
                      background: step === s.n ? D.purple : step > s.n ? "rgba(64,192,87,0.2)" : "rgba(255,255,255,0.06)",
                      color: step === s.n ? "#fff" : step > s.n ? "#40C057" : D.text3,
                      border: step === s.n ? "2px solid " + D.purpleLight : step > s.n ? "2px solid rgba(64,192,87,0.4)" : "2px solid rgba(255,255,255,0.08)",
                    }}>
                      {step > s.n ? "✓" : s.n}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: step === s.n ? 600 : 400, color: step === s.n ? D.text : D.text3, letterSpacing: "-0.02em", whiteSpace: "nowrap", transition: "all 0.3s ease" }}>{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: "0 12px", background: step > s.n ? "rgba(64,192,87,0.3)" : "rgba(255,255,255,0.06)", borderRadius: 2, transition: "background 0.3s ease" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 0" }}>

          {/* ═══ STEP 1: Conexión y Análisis IA ═══ */}
          {step === 1 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              {/* Hero Card — AI Analyze */}
              <div style={{ ...card, background: D.bg2, border: "1.5px solid " + D.purple, padding: "20px 24px", textAlign: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(121,80,242,0.15)", border: "1px solid rgba(121,80,242,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={D.purpleLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h3a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1v3a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3h3V9.4C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/></svg>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: D.text, marginBottom: 2, letterSpacing: "-0.02em" }}>AiStudioBrand construye tu ADN en segundos</h2>
                    <p style={{ fontSize: 13, color: D.text2, lineHeight: 1.5, letterSpacing: "-0.02em", margin: 0 }}>
                      Conecta tus canales y analiza tu contenido para extraer tono, audiencia y personalidad.
                    </p>
                  </div>
                </div>
              </div>

              {/* Channels card */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 4, letterSpacing: "-0.02em" }}>Tus canales</div>
                <div style={{ fontSize: 12, color: D.text3, marginBottom: 16 }}>Agrega al menos uno para el análisis con IA</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { icon: "📸", placeholder: "instagram.com/tucuenta", key: "instagramUrl", name: "Instagram" },
                    { icon: "🎵", placeholder: "tiktok.com/@tucuenta", key: "tiktokUrl", name: "TikTok" },
                    { icon: "🌐", placeholder: "tuweb.com", key: "webUrl", name: "Web" },
                    { icon: "🎨", placeholder: "canva.com/tucuenta", key: "canvaUrl", name: "Canva" },
                  ].map(ch => (
                    <div key={ch.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16, width: 28, textAlign: "center" }}>{ch.icon}</span>
                      <input className="input-focus" style={{ ...inp(profile[ch.key]), flex: 1 }} placeholder={ch.placeholder} value={profile[ch.key]} onChange={e => setProfile(p => ({ ...p, [ch.key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyze sources */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 4, letterSpacing: "-0.02em" }}>Selecciona fuentes para analizar</div>
                <div style={{ fontSize: 12, color: D.text3, marginBottom: 16 }}>La IA lee tus redes y construye tu ADN automáticamente</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {[
                    { key: "screenshots", lbl: "Screenshots de posts", icon: "🖼", ok: true, hint: "La fuente más poderosa" },
                    { key: "web", lbl: "Página web", icon: "🌐", ok: !!profile.webUrl, hint: profile.webUrl || "Agrega URL arriba" },
                    { key: "instagram", lbl: "Instagram", icon: "📸", ok: !!profile.instagramUrl, hint: profile.instagramUrl || "Agrega URL arriba" },
                    { key: "tiktok", lbl: "TikTok", icon: "🎵", ok: !!profile.tiktokUrl, hint: profile.tiktokUrl || "Agrega URL arriba" },
                  ].map(src => (
                    <div key={src.key}
                      onClick={() => { if (!src.ok) return; setSources(prev => prev.includes(src.key) ? prev.filter(s => s !== src.key) : [...prev, src.key]); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: sources.includes(src.key) ? "rgba(121,80,242,0.1)" : D.bg3, border: "1px solid " + (sources.includes(src.key) ? "rgba(121,80,242,0.3)" : D.border), opacity: src.ok ? 1 : 0.35, cursor: src.ok ? "pointer" : "not-allowed", transition: "all 0.3s ease" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid " + (sources.includes(src.key) ? D.purple : "rgba(255,255,255,0.15)"), background: sources.includes(src.key) ? D.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0, transition: "all 0.3s ease" }}>
                        {sources.includes(src.key) ? "✓" : ""}
                      </div>
                      <span style={{ fontSize: 15 }}>{src.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: D.text, letterSpacing: "-0.02em" }}>{src.lbl}</div>
                        <div style={{ fontSize: 11, color: D.text3 }}>{src.hint}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Screenshots upload */}
                {sources.includes("screenshots") && (
                  <div style={{ marginBottom: 16 }}>
                    <input type="file" accept="image/*" multiple id="screenshots" style={{ display: "none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0, 6).map(f => ({ file: f, url: URL.createObjectURL(f) })); setScreenshots(prev => [...prev, ...arr].slice(0, 6)); }} />
                    {screenshots.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                        {screenshots.map((s, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <img src={s.url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, display: "block" }} />
                            <button onClick={() => setScreenshots(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#DC2626", border: "none", color: "#fff", fontSize: 9, cursor: "pointer" }}>x</button>
                          </div>
                        ))}
                        {screenshots.length < 6 && <label htmlFor="screenshots" style={{ aspectRatio: "1", border: "2px dashed rgba(121,80,242,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, color: D.text3 }}>+</label>}
                      </div>
                    ) : (
                      <label htmlFor="screenshots" style={{ display: "block", border: "2px dashed rgba(121,80,242,0.3)", borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer" }}>
                        <div style={{ fontSize: 13, color: D.text2, fontWeight: 500 }}>Sube screenshots de tus posts · Hasta 6</div>
                      </label>
                    )}
                  </div>
                )}

                {/* Analyze progress */}
                {analyzing && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: D.purpleLight }}>{analyzeMsg}</span>
                      <span style={{ fontSize: 11, color: D.purpleLight }}>{Math.round(Math.min(analyzeProgress, 95))}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: Math.min(analyzeProgress, 95) + "%", background: "linear-gradient(90deg,#7950F2,#A78BFA)", borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}
                {analyzeError && <div style={{ background: "rgba(220,38,38,0.1)", borderRadius: 8, padding: 10, fontSize: 11, color: "#FCA5A5", marginBottom: 12 }}>{analyzeError}</div>}

                {analyzeProgress === 100 && !analyzing ? (
                  <div style={{ width: "100%", padding: 13, background: "rgba(64,192,87,0.15)", border: "2px solid rgba(64,192,87,0.4)", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#40C057", textAlign: "center", letterSpacing: "-0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✓</span> Análisis completado — ADN actualizado
                  </div>
                ) : (
                  <button onClick={analyzeInstagram} disabled={analyzing || sources.length === 0}
                    style={{ width: "100%", padding: 13, background: analyzing || sources.length === 0 ? "rgba(121,80,242,0.2)" : "linear-gradient(135deg,#7950F2,#4C1D95)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: analyzing || sources.length === 0 ? "not-allowed" : "pointer", transition: "all 0.3s ease", boxShadow: sources.length > 0 ? "0 8px 24px rgba(121,80,242,0.3)" : "none", letterSpacing: "-0.02em" }}>
                    {analyzing ? "Analizando con IA..." : "Analizar " + sources.length + " fuente" + (sources.length !== 1 ? "s" : "") + " →"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Voz y Comunicación ═══ */}
          {step === 2 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              {/* AI-generated notice */}
              {profile.descripcion.trim() && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(121,80,242,0.08)", border: "1px solid rgba(121,80,242,0.2)", marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.purpleLight, letterSpacing: "-0.02em" }}>Generado por IA a partir de tus fuentes</div>
                    <div style={{ fontSize: 12, color: D.text3 }}>Revisa y edita cada campo para que suene exactamente como tú</div>
                  </div>
                </div>
              )}
              {/* Marca info */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16, letterSpacing: "-0.02em" }}>Tu marca</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={label}>Nombre / cuenta</label>
                    <input className="input-focus" style={inp(profile.nombre)} placeholder="@tumarca" value={profile.nombre} onChange={e => setProfile(p => ({ ...p, nombre: e.target.value }))} />
                  </div>
                  <div>
                    <label style={label}>A quién le hablas</label>
                    <input className="input-focus" style={inp(profile.audiencia)} placeholder="Mujeres latinas 28-42 en EE.UU." value={profile.audiencia} onChange={e => setProfile(p => ({ ...p, audiencia: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={label}>Qué haces (biografía)</label>
                  <textarea className="input-focus" style={{ ...inp(profile.descripcion), minHeight: 80, resize: "none" }} placeholder="Soy coach de negocios para mujeres latinas..." value={profile.descripcion} onChange={e => setProfile(p => ({ ...p, descripcion: e.target.value }))} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={label}>Propuesta de valor</label>
                  <textarea className="input-focus" style={{ ...inp(profile.propuestaValor), minHeight: 60, resize: "none" }} placeholder="Tu ventaja única — qué te hace diferente de todos los demás" value={profile.propuestaValor} onChange={e => setProfile(p => ({ ...p, propuestaValor: e.target.value }))} />
                </div>
              </div>

              {/* Comunicación */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16, letterSpacing: "-0.02em" }}>Comunicación</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={label}>Idioma</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {idiomas.map(i => (
                        <button key={i} onClick={() => setProfile(p => ({ ...p, idioma: i }))} style={chip(profile.idioma === i)}>{i}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={label}>Tono de voz <span style={{ color: D.text3, fontWeight: 400 }}>(máx. 2)</span></label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {tonos.map(t => (
                        <button key={t} onClick={() => setProfile(p => {
                          const arr = Array.isArray(p.tono) ? p.tono : (p.tono ? [p.tono] : []);
                          const has = arr.includes(t);
                          if (has) return { ...p, tono: arr.filter(x => x !== t) };
                          if (arr.length >= 2) return p;
                          return { ...p, tono: [...arr, t] };
                        })} style={chip((Array.isArray(profile.tono) ? profile.tono : [profile.tono]).includes(t))}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={label}>Categorías de contenido</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {cats.map(c => (
                      <button key={c} onClick={() => setProfile(p => ({ ...p, categorias: p.categorias.includes(c) ? p.categorias.filter(x => x !== c) : [...p.categorias, c] }))} style={chip(profile.categorias.includes(c))}>{c}</button>
                    ))}
                    {profile.categorias.filter(c => !cats.includes(c)).map(c => (
                      <div key={c} style={{ ...chip(true), display: "flex", alignItems: "center", gap: 6 }}>
                        {c}
                        <span onClick={() => setProfile(p => ({ ...p, categorias: p.categorias.filter(x => x !== c) }))} style={{ cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</span>
                      </div>
                    ))}
                    <button onClick={() => setShowCustomCat(true)} style={chip(false)}>+ Otro</button>
                  </div>
                  {showCustomCat && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                      <input className="input-focus" style={{ ...inp(customCatInput), flex: 1, padding: "8px 12px", fontSize: 13 }} placeholder="Ej: Tecnología" value={customCatInput} onChange={e => setCustomCatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && customCatInput.trim()) { setProfile(p => ({ ...p, categorias: [...p.categorias, customCatInput.trim()] })); setCustomCatInput(""); setShowCustomCat(false); } }} />
                      <button onClick={() => { if (customCatInput.trim()) { setProfile(p => ({ ...p, categorias: [...p.categorias, customCatInput.trim()] })); setCustomCatInput(""); setShowCustomCat(false); } }} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: D.purple, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Agregar</button>
                      <button onClick={() => { setShowCustomCat(false); setCustomCatInput(""); }} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid " + D.border, background: "transparent", color: D.text3, fontSize: 12, cursor: "pointer" }}>×</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Estilo Visual y Referencias ═══ */}
          {step === 3 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              {/* AI-generated notice */}
              {profile.personalidad.trim() && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(121,80,242,0.08)", border: "1px solid rgba(121,80,242,0.2)", marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.purpleLight, letterSpacing: "-0.02em" }}>Generado por IA a partir de tus fuentes</div>
                    <div style={{ fontSize: 12, color: D.text3 }}>Revisa y edita cada campo para que suene exactamente como tú</div>
                  </div>
                </div>
              )}
              {/* Personalidad */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16, letterSpacing: "-0.02em" }}>Personalidad de marca</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={label}>¿Cómo habla tu marca? ¿Qué evita?</label>
                  <textarea className="input-focus" style={{ ...inp(profile.personalidad), minHeight: 90, resize: "none" }} placeholder="Ej: Hablo directo, uso humor, evito ser formal, digo 'reina' y 'amiga'..." value={profile.personalidad} onChange={e => setProfile(p => ({ ...p, personalidad: e.target.value }))} />
                </div>
                <div>
                  <label style={label}>¿Cómo se ve tu marca visualmente?</label>
                  <textarea className="input-focus" style={{ ...inp(profile.estiloVisual), minHeight: 70, resize: "none" }} placeholder="Ej: Minimalista con toques de color, lifestyle, editorial..." value={profile.estiloVisual} onChange={e => setProfile(p => ({ ...p, estiloVisual: e.target.value }))} />
                </div>
              </div>

              {/* Colors */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16, letterSpacing: "-0.02em" }}>Colores de marca</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
                  {presetColors.map(c => {
                    const sel = profile.coloresMarca.includes(c);
                    return (
                      <button key={c} onClick={() => setProfile(p => ({ ...p, coloresMarca: sel ? p.coloresMarca.filter(x => x !== c) : [...p.coloresMarca, c] }))}
                        style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: sel ? "3px solid #fff" : "2px solid rgba(255,255,255,0.12)", cursor: "pointer", position: "relative", boxShadow: sel ? "0 0 0 2px " + D.purple : "none", transition: "all 0.3s ease" }}>
                        {sel && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: c === "#F8F9FA" || c === "#FFD93D" ? "#000" : "#fff", fontWeight: 700 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={customColorInput || "#7950F2"} onChange={e => setCustomColorInput(e.target.value)} style={{ width: 36, height: 36, padding: 0, border: "2px solid " + D.border, borderRadius: "50%", cursor: "pointer", background: "transparent", WebkitAppearance: "none", appearance: "none" }} />
                  <input className="input-focus" style={{ ...inp(customColorInput), width: 120, padding: "8px 12px", fontSize: 13, fontFamily: "monospace" }} placeholder="#hex" value={customColorInput} onChange={e => setCustomColorInput(e.target.value)} />
                  <button onClick={() => { if (/^#[0-9A-Fa-f]{3,6}$/.test(customColorInput) && !profile.coloresMarca.includes(customColorInput)) { setProfile(p => ({ ...p, coloresMarca: [...p.coloresMarca, customColorInput] })); setCustomColorInput(""); } }}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px dashed " + D.border, background: "transparent", color: D.text3, fontSize: 12, cursor: "pointer", transition: "all 0.3s ease" }}>+ Agregar</button>
                </div>
                <style>{`
                  input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
                  input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; }
                  input[type="color"]::-moz-color-swatch { border: none; border-radius: 50%; }
                `}</style>
                {profile.coloresMarca.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {profile.coloresMarca.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 6px", background: "rgba(255,255,255,0.06)", borderRadius: 20, border: "1px solid " + D.border }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: c, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: D.text3, fontFamily: "monospace" }}>{c}</span>
                        <button onClick={() => setProfile(p => ({ ...p, coloresMarca: p.coloresMarca.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: D.text3, fontSize: 12, cursor: "pointer", padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy examples */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 4, letterSpacing: "-0.02em" }}>Ejemplos de copy ideal</div>
                <div style={{ fontSize: 12, color: D.text3, marginBottom: 16 }}>La IA aprende tu estilo exacto de estos ejemplos</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profile.ejemplosCopy.map((ej, i) => (
                    <div key={i}>
                      <label style={{ ...label, fontSize: 11 }}>Ejemplo {i + 1}</label>
                      <textarea className="input-focus" style={{ ...inp(ej), minHeight: 60, resize: "none" }} placeholder="Pega un caption de Instagram que ames..." value={ej}
                        onChange={e => { const arr = [...profile.ejemplosCopy]; arr[i] = e.target.value; setProfile(p => ({ ...p, ejemplosCopy: arr })); }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 4, letterSpacing: "-0.02em" }}>Marcas de referencia</div>
                <div style={{ fontSize: 12, color: D.text3, marginBottom: 16 }}>Marcas que admiras o inspiran tu contenido (opcional)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.competidores.map((comp, i) => (
                    <input key={i} className="input-focus" style={inp(comp)} placeholder={"@cuenta o URL " + (i + 1)} value={comp}
                      onChange={e => { const arr = [...profile.competidores]; arr[i] = e.target.value; setProfile(p => ({ ...p, competidores: arr })); }} />
                  ))}
                </div>
              </div>

              {/* Final CTA */}
              {pct === 100 ? (
                <button onClick={() => router.push("/crear")} className="glow-btn"
                  style={{ width: "100%", padding: 18, background: "linear-gradient(135deg,#40C057,#2B8A3E)", color: "#fff", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em", boxShadow: "0 8px 30px rgba(64,192,87,0.4), 0 0 60px rgba(64,192,87,0.15)", transition: "all 0.3s ease" }}>
                  ADN Completo! Crear mi primera pieza →
                </button>
              ) : (
                <div style={{ ...card, textAlign: "center", padding: "32px" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: D.text, marginBottom: 8, letterSpacing: "-0.02em" }}>Tu ADN está guardado</div>
                  <div style={{ fontSize: 14, color: D.text2, marginBottom: 20 }}>Puedes seguir completando o empezar a crear</div>
                  <button onClick={() => router.push("/crear")}
                    style={{ padding: "14px 36px", background: "linear-gradient(135deg,#7950F2,#A78BFA)", color: "#fff", border: "none", borderRadius: 100, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(121,80,242,0.3)", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                    Ir a crear →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ STICKY FOOTER (respects sidebar) ═══ */}
      <div className="adn-footer" style={{ position: "fixed", bottom: 0, left: 260, right: 0, zIndex: 45, background: "rgba(14,14,30,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, color: D.text2, letterSpacing: "-0.02em", minWidth: 160 }}>
            {saveStatus === "saving" && <span style={{ color: D.purpleLight, fontWeight: 600 }}>💾 Guardando cambios...</span>}
            {saveStatus === "saved" && <span style={{ color: "#40C057", fontWeight: 600 }}>✓ Cambios guardados</span>}
            {saveStatus === "idle" && <span style={{ color: D.text3 }}>Paso {step} de 3</span>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={goPrev} style={{ padding: "11px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                ← Anterior
              </button>
            )}
            {step < 3 ? (
              <button onClick={goNext} style={{ padding: "11px 28px", background: D.purple, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(121,80,242,0.4)", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                Siguiente →
              </button>
            ) : (
              <button onClick={() => { handleSave(); router.push("/crear"); }}
                style={{ padding: "11px 28px", background: pct === 100 ? "linear-gradient(135deg,#40C057,#2B8A3E)" : D.purple, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: pct === 100 ? "0 4px 14px rgba(64,192,87,0.4)" : "0 4px 14px rgba(121,80,242,0.4)", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                {pct === 100 ? "ADN Completo! Crear →" : "Listo — Crear →"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes orbFloat1 { 0% { transform: translate(0, 0); } 33% { transform: translate(30px, -20px); } 66% { transform: translate(-20px, 15px); } 100% { transform: translate(0, 0); } }
        @keyframes orbFloat2 { 0% { transform: translate(0, 0); } 33% { transform: translate(-25px, 20px); } 66% { transform: translate(15px, -25px); } 100% { transform: translate(0, 0); } }
        @keyframes orbFloat3 { 0% { transform: translate(0, 0); } 33% { transform: translate(20px, 15px); } 66% { transform: translate(-15px, -20px); } 100% { transform: translate(0, 0); } }
        .orb-1 { animation: orbFloat1 8s ease-in-out infinite; }
        .orb-2 { animation: orbFloat2 10s ease-in-out infinite; }
        .orb-3 { animation: orbFloat3 12s ease-in-out infinite; }
        @keyframes scanMove { 0% { top: 0; } 100% { top: 100%; } }
        .scan-line { animation: scanMove 4s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .input-focus:focus { border-color: #7950F2 !important; box-shadow: 0 0 0 2px rgba(121,80,242,0.15); }
        .glow-btn:hover { transform: scale(1.02); box-shadow: 0 12px 40px rgba(64,192,87,0.5), 0 0 80px rgba(64,192,87,0.2) !important; }
        @media (max-width: 768px) {
          .adn-footer { left: 0 !important; }
        }
      `}</style>
    </AppLayout>
  );
}

// --- Confetti ---
const ConfettiEffect = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
    <style>{`
      @keyframes confettiFall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
      .confetti-piece { position: absolute; top: -10px; animation: confettiFall 3s ease-in forwards; }
    `}</style>
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="confetti-piece" style={{
        left: Math.random() * 100 + "%",
        background: ["#7950F2", "#A78BFA", "#E64980", "#40C057", "#FFD93D", "#FF6B35"][i % 6],
        borderRadius: i % 3 === 0 ? "50%" : "2px",
        width: 6 + Math.random() * 8, height: 6 + Math.random() * 8,
        animationDelay: Math.random() * 2 + "s",
        animationDuration: 2 + Math.random() * 2 + "s",
      }} />
    ))}
  </div>
);

export default function ADN() {
  return (
    <Suspense fallback={null}>
      <ADNContent />
    </Suspense>
  );
}
