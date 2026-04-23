"use client";
import { useState, useEffect, useRef, useCallback, memo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";
import SourceCard from '../components/adn/SourceCard';
import SectionStepper from '../components/adn/SectionStepper';
import AIField from '../components/adn/AIField';
import ChipSelector from '../components/adn/ChipSelector';
import ExtractedPalette from '../components/adn/ExtractedPalette';
import CopyExampleCard from '../components/adn/CopyExampleCard';

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

const getSteps = (en) => [
  { n: 1, title: en ? "Connection & AI Analysis" : "Conexión y Análisis IA", sub: en ? "Connect your channels and let AI build your DNA" : "Conecta tus canales y deja que la IA construya tu ADN" },
  { n: 2, title: en ? "Voice & Communication" : "Voz y Comunicación", sub: en ? "Define who you are, who you talk to and how you sound" : "Define quién eres, a quién le hablas y cómo suenas" },
  { n: 3, title: en ? "Visual Style & References" : "Estilo Visual y Referencias", sub: en ? "Your visual personality, colors and ideal copy examples" : "Tu personalidad visual, colores y ejemplos de copy ideal" },
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

  const [lang, setLang] = useState("es");
  useEffect(() => { const saved = localStorage.getItem("lang"); if (saved) setLang(saved); }, []);
  useEffect(() => {
    const handler = () => { const saved = localStorage.getItem("lang"); if (saved) setLang(saved); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const en = lang === "en";
  const STEPS = getSteps(en);

  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [brandId, setBrandId] = useState(null); // current brand profile ID
  const [profile, setProfile] = useState({ ...BLANK_PROFILE });
  const [aiOriginal, setAiOriginal] = useState({});
  const [showCompetitors, setShowCompetitors] = useState(true);

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
  const [sourceStates, setSourceStates] = useState({
    screenshots: { state: 'empty', enabled: false, progress: 0, extractedTags: [] },
    instagram: { state: 'empty', enabled: false, progress: 0, extractedTags: [] },
    tiktok: { state: 'empty', enabled: false, progress: 0, extractedTags: [] },
    web: { state: 'empty', enabled: false, progress: 0, extractedTags: [] },
    canva: { state: 'empty', enabled: false, progress: 0, extractedTags: [] },
  });

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
      if (user) setUser(user);

      // New brand → blank profile, no load
      if (isNewBrand) {
        setProfile({ ...BLANK_PROFILE });
        setBrandId(null);
        initialLoadDone.current = true;
        return;
      }

      // Load brand via server API route (bypasses RLS and auth issues)
      const targetId = paramBrandId || localStorage.getItem("activeBrandId");
      let loaded = null;

      // Try loading by specific ID
      if (targetId && targetId !== "cached") {
        try {
          const res = await fetch("/api/brands?brandId=" + targetId);
          const json = await res.json();
          if (json.brand) loaded = json.brand;
        } catch(e) {}
      }

      // Fallback: load first brand for this user (only if we have user)
      if (!loaded && user) {
        try {
          const res = await fetch("/api/brands?userId=" + user.id);
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const res2 = await fetch("/api/brands?brandId=" + json.data[0].id);
            const json2 = await res2.json();
            if (json2.brand) loaded = json2.brand;
          }
        } catch(e) {}
      }

      if (loaded) {
        const p = dataToProfile(loaded);
        setProfile(p);
        setBrandId(loaded.id);
        localStorage.setItem("activeBrandId", loaded.id);
        localStorage.setItem("brandProfile", JSON.stringify({ id: loaded.id, ...p }));
        // Initialize showCompetitors if any competitor has a value
        if (p.competidores.some(c => c && c.trim())) setShowCompetitors(true);
        // Initialize source states from loaded profile
        setSourceStates(prev => ({
          ...prev,
          instagram: { ...prev.instagram, state: loaded.instagram_url ? 'ready' : 'empty', enabled: !!loaded.instagram_url },
          tiktok: { ...prev.tiktok, state: loaded.tiktok_url ? 'ready' : 'empty', enabled: !!loaded.tiktok_url },
          web: { ...prev.web, state: loaded.web_url ? 'ready' : 'empty', enabled: !!loaded.web_url },
          canva: { ...prev.canva, state: loaded.canva_url ? 'ready' : 'empty', enabled: !!loaded.canva_url },
        }));
      }
      initialLoadDone.current = true;
    };
    initialLoadDone.current = false;
    setStep(1);
    setAnalyzeProgress(0);
    setAnalyzeMsg("");
    setAnalyzeError("");
    setSources([]);
    setScreenshots([]);
    init();
  }, [isNewBrand, paramBrandId]);

  // --- Save ---
  const handleSave = useCallback(async () => {
    const u = userRef.current;
    const p = profileRef.current;
    const currentBrandId = brandIdRef.current;
    // Get userId from auth or fallback to fetching it
    let userId = u?.id;
    if (!userId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { userId = user.id; setUser(user); }
      } catch(e) {}
    }
    if (!userId) return;
    // Don't save empty profiles — prevents overwriting real data
    const hasContent = p.nombre.trim() || p.descripcion.trim() || p.audiencia.trim() || p.personalidad.trim();
    if (!hasContent && !currentBrandId) return;
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

    // Save via server API route (bypasses RLS)
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: currentBrandId, userId, payload, forceNew: !currentBrandId && new URLSearchParams(window.location.search).get("new") === "true" }),
      });
      const json = await res.json();
      if (json.brandId && !currentBrandId) {
        brandIdRef.current = json.brandId;
        setBrandId(json.brandId);
        localStorage.setItem("activeBrandId", json.brandId);
      }
    } catch(e) {
      console.warn("Save error:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
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
    debounceRef.current = setTimeout(() => {
      // Don't autosave if brandId doesn't match current URL context
      const urlBrandId = new URLSearchParams(window.location.search).get("brand");
      const isNew = new URLSearchParams(window.location.search).get("new") === "true";
      if (isNew && brandIdRef.current) return; // New brand mode but somehow has an ID - skip
      if (urlBrandId && brandIdRef.current && urlBrandId !== brandIdRef.current) return; // URL brand doesn't match ref - skip
      handleSave();
    }, 1500);
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
  const rawPct = Math.round((filledCount / progressFields.length) * 100);
  // Cap at 95% if user hasn't visited all steps yet
  const pct = (rawPct === 100 && step < 3) ? 95 : rawPct;

  // Per-step progress
  const step1Fields = ["instagramUrl"];
  const step2Fields = ["nombre", "descripcion", "audiencia", "tono", "idioma"];
  const step3Fields = ["personalidad", "coloresMarca", "ejemplosCopy"];
  const stepPct = (keys) => {
    const fields = progressFields.filter(f => keys.includes(f.key));
    if (fields.length === 0) return 0;
    return Math.round((fields.filter(f => f.done).length / fields.length) * 100);
  };
  const rawStepProgress = [stepPct(step1Fields), stepPct(step2Fields), stepPct(step3Fields)];
  // Don't show 100% for steps the user hasn't visited yet — cap at 95% until they go there
  // Don't show 100% for steps the user hasn't visited yet — cap at 95% until they go there
  const stepProgress = rawStepProgress.map((p, i) => (p === 100 && step < i + 1) ? 95 : p);

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
    const enabledSources = Object.entries(sourceStates).filter(([_, s]) => s.enabled).map(([type]) => type);
    if (enabledSources.length === 0 && sources.length === 0) return;
    setAnalyzing(true); setAnalyzeProgress(0); setAnalyzeError("");
    const msgs = en
      ? ["Gathering your sources...", "Reading your website...", "Analyzing your visual content...", "Identifying your tone and personality...", "Detecting your audience...", "Building your brand DNA..."]
      : ["Recopilando tus fuentes...", "Leyendo tu página web...", "Analizando tu contenido visual...", "Identificando tu tono y personalidad...", "Detectando tu audiencia...", "Construyendo tu ADN de marca..."];
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
        setAiOriginal({ ...ap }); // Save AI snapshot
        setProfile(prev => ({ ...prev, ...ap, instagramUrl: prev.instagramUrl, tiktokUrl: prev.tiktokUrl, webUrl: prev.webUrl, canvaUrl: prev.canvaUrl }));
        // Update sourceStates to 'complete' for all analyzed sources
        setSourceStates(prev => {
          const updated = { ...prev };
          Object.entries(updated).forEach(([key, val]) => {
            if (val.enabled) {
              updated[key] = { ...val, state: 'complete', progress: 100 };
            }
          });
          return updated;
        });
      } else if (data.error) {
        setAnalyzeError("Error: " + data.error);
      }
    } catch (e) { setAnalyzeError(en ? "Error analyzing your brand. Try again." : "Error analizando tu marca. Intenta de nuevo."); }
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
                  {isOnboarding ? (en ? "Train your digital clone" : "Entrena a tu clon digital") : (en ? "Your brand DNA" : "ADN de tu marca")}
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
            <SectionStepper
              en={en}
              steps={STEPS.map((s, i) => ({
                label: s.title,
                progress: stepProgress[i],
                completeLabel: en ? "Complete" : "Completo",
              }))}
              currentStep={step - 1}
              onStepClick={(index) => setStep(index + 1)}
            />
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
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: D.text, marginBottom: 2, letterSpacing: "-0.02em" }}>{en ? "AiStudioBrand builds your DNA in seconds" : "AiStudioBrand construye tu ADN en segundos"}</h2>
                    <p style={{ fontSize: 13, color: D.text2, lineHeight: 1.5, letterSpacing: "-0.02em", margin: 0 }}>
                      {en ? "Connect your channels and analyze your content to extract tone, audience and personality." : "Conecta tus canales y analiza tu contenido para extraer tono, audiencia y personalidad."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source Cards */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: D.text, letterSpacing: "-0.02em" }}>
                      {en ? "Connect your sources" : "Conecta tus fuentes"}
                    </div>
                    <div style={{ fontSize: 12, color: D.text3, marginTop: 2 }}>
                      {en ? "AI reads your social media and builds your DNA automatically" : "La IA lee tus redes y construye tu ADN automáticamente"}
                    </div>
                  </div>
                </div>

                {['screenshots', 'instagram', 'tiktok', 'web', 'canva'].map(type => (
                  <SourceCard
                    key={type}
                    type={type}
                    en={en}
                    state={sourceStates[type].state}
                    value={type === 'screenshots' ? screenshots : profile[{instagram:'instagramUrl',tiktok:'tiktokUrl',web:'webUrl',canva:'canvaUrl'}[type]]}
                    enabled={sourceStates[type].enabled}
                    progress={sourceStates[type].progress}
                    extractedTags={sourceStates[type].extractedTags}
                    featured={type === 'screenshots'}
                    onChange={(newValue) => {
                      if (type === 'screenshots') {
                        const files = Array.isArray(newValue) ? newValue.slice(0, 6).map(f => ({ file: f, url: URL.createObjectURL(f) })) : [];
                        setScreenshots(files);
                        setSourceStates(prev => ({...prev, screenshots: {...prev.screenshots, state: files.length > 0 ? 'ready' : 'empty', enabled: files.length > 0}}));
                      } else {
                        const key = {instagram:'instagramUrl',tiktok:'tiktokUrl',web:'webUrl',canva:'canvaUrl'}[type];
                        setProfile(p => ({...p, [key]: newValue}));
                        setSourceStates(prev => ({...prev, [type]: {...prev[type], state: newValue.trim() ? 'ready' : 'empty', enabled: !!newValue.trim()}}));
                      }
                    }}
                    onToggle={(enabled) => {
                      setSourceStates(prev => ({...prev, [type]: {...prev[type], enabled}}));
                      // Also sync with old sources array for analyze
                      if (enabled) setSources(prev => prev.includes(type) ? prev : [...prev, type]);
                      else setSources(prev => prev.filter(s => s !== type));
                    }}
                    onAnalyze={() => {
                      // Trigger individual source analysis — for now collect enabled sources and analyze all
                    }}
                  />
                ))}
              </div>

              {/* Analyze section */}
              <div style={{ ...card, marginBottom: 24 }}>
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
                    <span style={{ fontSize: 16 }}>✓</span> {en ? "Analysis complete — DNA updated" : "Análisis completado — ADN actualizado"}
                  </div>
                ) : (
                  <button onClick={analyzeInstagram} disabled={analyzing || Object.entries(sourceStates).filter(([_, s]) => s.enabled).length === 0}
                    style={{ width: "100%", padding: 13, background: analyzing || Object.entries(sourceStates).filter(([_, s]) => s.enabled).length === 0 ? "rgba(121,80,242,0.2)" : "linear-gradient(135deg,#7950F2,#4C1D95)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: analyzing || Object.entries(sourceStates).filter(([_, s]) => s.enabled).length === 0 ? "not-allowed" : "pointer", transition: "all 0.3s ease", boxShadow: Object.entries(sourceStates).filter(([_, s]) => s.enabled).length > 0 ? "0 8px 24px rgba(121,80,242,0.3)" : "none", letterSpacing: "-0.02em" }}>
                    {(() => { const enabledCount = Object.entries(sourceStates).filter(([_, s]) => s.enabled).length; return analyzing ? (en ? "Analyzing with AI..." : "Analizando con IA...") : (en ? "Analyze " + enabledCount + " source" + (enabledCount !== 1 ? "s" : "") + " \u2192" : "Analizar " + enabledCount + " fuente" + (enabledCount !== 1 ? "s" : "") + " \u2192"); })()}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Voz y Comunicación ═══ */}
          {step === 2 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              {/* Card 1 — Identidad */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16 }}>{en ? "Identity" : "Identidad"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <AIField label={en ? "Name / account" : "Nombre / cuenta"} value={profile.nombre} originalAIValue={aiOriginal.nombre} onChange={v => setProfile(p => ({...p, nombre: v}))} placeholder="@yourbrand" />
                  <AIField label={en ? "Who you talk to" : "A quién le hablas"} value={profile.audiencia} originalAIValue={aiOriginal.audiencia} onChange={v => setProfile(p => ({...p, audiencia: v}))} placeholder={en ? "Latina women 28-42 in the US" : "Mujeres latinas 28-42 en EE.UU."} />
                </div>
              </div>

              {/* Card 2 — Tu historia */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16 }}>{en ? "Your story" : "Tu historia"}</div>
                <AIField
                  label={en ? "What you do and what makes you different" : "Qué haces y qué te hace diferente"}
                  value={profile.descripcion + (profile.propuestaValor ? "\n\n" + profile.propuestaValor : "")}
                  originalAIValue={aiOriginal.descripcion ? (aiOriginal.descripcion + (aiOriginal.propuesta_valor ? "\n\n" + aiOriginal.propuesta_valor : "")) : undefined}
                  onChange={v => {
                    const parts = v.split("\n\n");
                    setProfile(p => ({...p, descripcion: parts[0] || "", propuestaValor: parts.slice(1).join("\n\n") || ""}));
                  }}
                  multiline={true}
                  rows={4}
                  placeholder={en ? "I'm a business coach for Latina women... My unique advantage is..." : "Soy coach de negocios para mujeres latinas... Mi ventaja única es..."}
                />
              </div>

              {/* Card 3 — Cómo suenas */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16 }}>{en ? "How you sound" : "Cómo suenas"}</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: D.text2, marginBottom: 8 }}>{en ? "Main language" : "Idioma principal"}</div>
                  <ChipSelector
                    mode="single"
                    en={en}
                    options={idiomas.map(i => ({ id: i, label: i }))}
                    value={profile.idioma}
                    onChange={v => setProfile(p => ({...p, idioma: v}))}
                    showCounter={false}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: D.text2, marginBottom: 8 }}>{en ? "Tone of voice" : "Tono de voz"}</div>
                  <ChipSelector
                    mode="multi"
                    max={2}
                    en={en}
                    options={tonos.map(t => ({ id: t, label: t }))}
                    value={Array.isArray(profile.tono) ? profile.tono : (profile.tono ? [profile.tono] : [])}
                    onChange={v => setProfile(p => ({...p, tono: v}))}
                  />
                </div>
              </div>

              {/* Card 4 — Categorías */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16 }}>{en ? "Content categories" : "Categorías de contenido"}</div>
                <ChipSelector
                  mode="multi"
                  en={en}
                  options={[...cats, ...(profile.categorias.filter(c => !cats.includes(c)))].map(c => ({ id: c, label: c }))}
                  value={profile.categorias}
                  onChange={v => setProfile(p => ({...p, categorias: v}))}
                  showCounter={false}
                />
                {/* Custom category input */}
                <div style={{ marginTop: 10 }}>
                  {showCustomCat ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input className="input-focus" style={{ ...inp(""), flex: 1, padding: "8px 12px", fontSize: 13 }} placeholder={en ? "E.g.: Technology" : "Ej: Tecnología"} value={customCatInput} onChange={e => setCustomCatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && customCatInput.trim()) { setProfile(p => ({ ...p, categorias: [...p.categorias, customCatInput.trim()] })); setCustomCatInput(""); setShowCustomCat(false); } }} />
                      <button onClick={() => { if (customCatInput.trim()) { setProfile(p => ({ ...p, categorias: [...p.categorias, customCatInput.trim()] })); setCustomCatInput(""); setShowCustomCat(false); } }} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: D.purple, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{en ? "Add" : "Agregar"}</button>
                      <button onClick={() => { setShowCustomCat(false); setCustomCatInput(""); }} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid " + D.border, background: "transparent", color: D.text3, fontSize: 12, cursor: "pointer" }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowCustomCat(true)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 14, border: "0.5px solid " + D.border, background: "transparent", color: D.text2, cursor: "pointer" }}>+ {en ? "Other" : "Otra"}</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Estilo Visual y Referencias ═══ */}
          {step === 3 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              {/* Card 1 — Paleta de marca */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16 }}>{en ? "Brand palette" : "Paleta de marca"}</div>
                <ExtractedPalette
                  en={en}
                  extractedColors={profile.coloresMarca.filter((_, i) => i < (aiOriginal.colores_marca?.length || 0))}
                  userColors={profile.coloresMarca.filter((_, i) => i >= (aiOriginal.colores_marca?.length || 0))}
                  onChange={({ extracted, user }) => setProfile(p => ({...p, coloresMarca: [...extracted, ...user]}))}
                  attribution={aiOriginal.colores_marca?.length ? (en ? "Based on screenshots and your Instagram" : "Basado en screenshots y tu Instagram") : undefined}
                />
              </div>

              {/* Card 2 — Personalidad de marca */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 16 }}>{en ? "Brand personality" : "Personalidad de marca"}</div>
                <AIField
                  label={en ? "How your brand speaks — and what it avoids" : "Cómo habla tu marca — y qué evita"}
                  value={profile.personalidad}
                  originalAIValue={aiOriginal.personalidad}
                  onChange={v => setProfile(p => ({...p, personalidad: v}))}
                  multiline={true}
                  rows={3}
                  placeholder={en ? "E.g.: I speak directly, use humor, avoid being formal..." : "Ej: Hablo directo, uso humor, evito ser formal..."}
                />
                <AIField
                  label={en ? "Visual style in one sentence" : "Estilo visual en una frase"}
                  value={profile.estiloVisual}
                  onChange={v => setProfile(p => ({...p, estiloVisual: v}))}
                  multiline={false}
                  placeholder={en ? "E.g.: Minimalist with color touches, lifestyle, editorial..." : "Ej: Minimalista con toques de color, lifestyle, editorial..."}
                />
              </div>

              {/* Card 3 — Ejemplos de tu voz */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D.text, marginBottom: 4 }}>{en ? "Examples of your ideal voice" : "Ejemplos de tu voz ideal"}</div>
                <div style={{ fontSize: 12, color: D.text3, marginBottom: 16 }}>{en ? "AI learns your exact style from these examples" : "La IA aprende tu estilo exacto de estos ejemplos"}</div>
                {profile.ejemplosCopy.map((ej, i) => (
                  <CopyExampleCard
                    key={i}
                    en={en}
                    text={ej}
                    accepted={!!ej.trim()}
                    onAccept={(text) => { const arr = [...profile.ejemplosCopy]; arr[i] = text; setProfile(p => ({...p, ejemplosCopy: arr})); }}
                    onDismiss={() => { const arr = [...profile.ejemplosCopy]; arr[i] = ""; setProfile(p => ({...p, ejemplosCopy: arr})); }}
                    placeholder={en ? "Paste an Instagram caption you love..." : "Pega un caption de Instagram que ames..."}
                  />
                ))}
              </div>

              {/* Card 4 — Marcas de referencia (collapsible) */}
              <div style={{ ...card, marginBottom: 24 }}>
                <button onClick={() => setShowCompetitors(!showCompetitors)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>{en ? "Reference brands" : "Marcas de referencia"}</div>
                  <span style={{ fontSize: 10, color: D.text3 }}>{showCompetitors ? "\u25B2" : "\u25BC"}</span>
                </button>
                {showCompetitors && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: D.text3, marginBottom: 12 }}>{en ? "Brands you admire (optional)" : "Marcas que admiras (opcional)"}</div>
                    {profile.competidores.map((comp, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <input className="input-focus" style={inp(comp)} placeholder={"@" + (en ? "account or URL" : "cuenta o URL") + " " + (i + 1)} value={comp}
                          onChange={e => { const arr = [...profile.competidores]; arr[i] = e.target.value; setProfile(p => ({...p, competidores: arr})); }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ STICKY FOOTER (respects sidebar) ═══ */}
      <div className="adn-footer" style={{ position: "fixed", bottom: 0, left: 260, right: 0, zIndex: 45, background: "rgba(14,14,30,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, color: D.text2, letterSpacing: "-0.02em", minWidth: 160 }}>
            {saveStatus === "saving" && <span style={{ color: D.purpleLight, fontWeight: 600 }}>{en ? "Saving changes..." : "💾 Guardando cambios..."}</span>}
            {saveStatus === "saved" && <span style={{ color: "#40C057", fontWeight: 600 }}>{en ? "✓ Changes saved" : "✓ Cambios guardados"}</span>}
            {saveStatus === "error" && <span style={{ color: "#FCA5A5", fontWeight: 600 }}>{en ? "⚠ Error saving — check connection" : "⚠ Error al guardar — revisa tu conexión"}</span>}
            {saveStatus === "idle" && <span style={{ color: D.text3 }}>{en ? "Step" : "Paso"} {step} {en ? "of" : "de"} 3</span>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={goPrev} style={{ padding: "11px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                {en ? "← Previous" : "← Anterior"}
              </button>
            )}
            {step < 3 ? (
              <button onClick={goNext} style={{ padding: "11px 28px", background: D.purple, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(121,80,242,0.4)", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                {en ? "Next →" : "Siguiente →"}
              </button>
            ) : (
              <button onClick={() => { handleSave(); router.push("/crear"); }}
                style={{ padding: "11px 28px", background: pct === 100 ? "linear-gradient(135deg,#40C057,#2B8A3E)" : D.purple, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: pct === 100 ? "0 4px 14px rgba(64,192,87,0.4)" : "0 4px 14px rgba(121,80,242,0.4)", transition: "all 0.3s ease", letterSpacing: "-0.02em" }}>
                {pct === 100 ? (en ? "DNA Complete! Create →" : "ADN Completo! Crear →") : (en ? "Done — Create →" : "Listo — Crear →")}
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
