"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";

const D = {
  bg: "#0D0D1F", bg2: "#111122",
  bg3: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#fff", text2: "rgba(255,255,255,0.55)",
  text3: "rgba(255,255,255,0.3)",
  purple: "#7950F2", purpleLight: "#A78BFA",
};

const tonos = ["Empoderador","Cercano","Profesional","Divertido","Inspiracional","Educativo"];
const idiomas = ["Español","Inglés","Spanglish"];
const cats = ["Coaching","Lifestyle","Moda","Belleza","Negocio","Motivación","Educación","Fitness","Recetas","Familia"];
const presetColors = ["#FF6B35","#7950F2","#E64980","#FFD93D","#40C057","#1971C2","#F8F9FA","#0A0A0A"];

// --- Accordion Section ---
const Section = ({ title, badge, badgeColor, defaultOpen, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: D.bg2, border: "1px solid " + D.border, borderRadius: 16, marginBottom: 16, overflow: "hidden", transition: "all 0.2s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: D.text, letterSpacing: "-0.02em" }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: badgeColor === "green" ? "rgba(64,192,87,0.15)" : badgeColor === "purple" ? "rgba(121,80,242,0.15)" : "rgba(255,255,255,0.06)", color: badgeColor === "green" ? "#40C057" : badgeColor === "purple" ? D.purpleLight : D.text3 }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: 18, color: D.text3, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {open && <div style={{ padding: "0 22px 22px" }}>{children}</div>}
    </div>
  );
};

function ADNContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    nombre: "", descripcion: "", audiencia: "", tono: "",
    idioma: "", categorias: [], propuestaValor: "",
    instagramUrl: "", tiktokUrl: "", webUrl: "", canvaUrl: "",
    personalidad: "", coloresMarca: [], estiloVisual: "",
    ejemplosCopy: ["", "", ""], competidores: ["", "", ""],
  });

  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const [analyzeError, setAnalyzeError] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [sources, setSources] = useState([]);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("");

  const debounceRef = useRef(null);
  const profileRef = useRef(profile);
  const userRef = useRef(user);
  const initialLoadDone = useRef(false);

  // Keep refs in sync
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { userRef.current = user; }, [user]);

  // --- Load from Supabase ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data } = await supabase.from("brand_profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        const loaded = {
          nombre: data.nombre || "", descripcion: data.descripcion || "",
          audiencia: data.audiencia || "", tono: data.tono || "",
          idioma: data.idioma || "Español", categorias: data.categorias || [],
          propuestaValor: data.propuesta_valor || "",
          instagramUrl: data.instagram_url || "", tiktokUrl: data.tiktok_url || "",
          webUrl: data.web_url || "", canvaUrl: data.canva_url || "",
          personalidad: data.personalidad || "", coloresMarca: data.colores_marca || [],
          estiloVisual: data.estilo_visual || "",
          ejemplosCopy: data.ejemplos_copy && data.ejemplos_copy.length > 0 ? data.ejemplos_copy : ["", "", ""],
          competidores: data.competidores && data.competidores.length > 0 ? data.competidores : ["", "", ""],
        };
        setProfile(loaded);
        localStorage.setItem("brandProfile", JSON.stringify(loaded));
      }
      initialLoadDone.current = true;
    };
    init();
  }, []);

  // --- Autosave (debounced 1500ms) ---
  const saveToSupabase = useCallback(async () => {
    const u = userRef.current;
    const p = profileRef.current;
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
    const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", u.id).single();
    if (existing) await supabase.from("brand_profiles").update(payload).eq("user_id", u.id);
    else await supabase.from("brand_profiles").insert({ ...payload, user_id: u.id });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    // Save to localStorage immediately
    localStorage.setItem("brandProfile", JSON.stringify(profile));
    // Debounce Supabase save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveToSupabase(), 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [profile, saveToSupabase]);

  // --- Progress ---
  const progressFields = [
    { key: "nombre", label: "Nombre", done: !!profile.nombre.trim() },
    { key: "descripcion", label: "Descripción", done: !!profile.descripcion.trim() },
    { key: "audiencia", label: "Audiencia", done: !!profile.audiencia.trim() },
    { key: "tono", label: "Tono", done: !!profile.tono },
    { key: "idioma", label: "Idioma", done: !!profile.idioma },
    { key: "propuestaValor", label: "Propuesta de valor", done: !!profile.propuestaValor.trim() },
    { key: "instagramUrl", label: "Instagram", done: !!profile.instagramUrl.trim() },
    { key: "personalidad", label: "Personalidad", done: !!profile.personalidad.trim() },
    { key: "coloresMarca", label: "Colores", done: profile.coloresMarca.length > 0 },
    { key: "ejemplosCopy", label: "Ejemplos copy", done: profile.ejemplosCopy.some(e => e && e.trim()) },
  ];
  const filledCount = progressFields.filter(f => f.done).length;
  const pct = Math.round((filledCount / progressFields.length) * 100);
  const progressMsg = pct <= 30 ? "Empecemos por lo básico" : pct <= 60 ? "Vas muy bien, sigue completando" : pct <= 89 ? "Casi listo — agrega los últimos detalles" : "ADN completo — listo para crear!";

  // --- Section badges ---
  const marcaCount = [profile.nombre, profile.descripcion, profile.audiencia, profile.propuestaValor].filter(f => f && f.trim()).length;
  const canalesCount = [profile.instagramUrl, profile.tiktokUrl, profile.webUrl, profile.canvaUrl].filter(f => f && f.trim()).length;
  const comComplete = !!profile.tono && !!profile.idioma;

  // --- Confetti on onboarding completion ---
  useEffect(() => {
    if (isOnboarding && pct >= 90 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [pct, isOnboarding]);

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
        setProfile(prev => ({ ...prev, ...data.profile, instagramUrl: prev.instagramUrl, tiktokUrl: prev.tiktokUrl, webUrl: prev.webUrl, canvaUrl: prev.canvaUrl }));
        setShowAnalyze(false);
      } else if (data.error) {
        setAnalyzeError("Error: " + data.error);
      }
    } catch (e) { setAnalyzeError("Error analizando tu marca. Intenta de nuevo."); }
    clearInterval(iv); setAnalyzeProgress(100); setAnalyzing(false); setAnalyzeMsg("");
  };

  // --- Input styles with state ---
  const getInpStyle = (value) => ({
    width: "100%",
    backgroundColor: value && value.toString().trim() ? "rgba(121,80,242,0.06)" : D.bg3,
    border: "1px solid " + (value && value.toString().trim() ? "rgba(121,80,242,0.3)" : D.border),
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: D.text,
    outline: "none", transition: "all 0.2s ease", fontFamily: "Inter, sans-serif",
  });

  return (
    <AppLayout>
      {/* Confetti CSS */}
      {showConfetti && <ConfettiEffect />}

      {/* Animated Header */}
      <div style={{ position: "relative", overflow: "hidden", height: 200, background: "linear-gradient(180deg, #1a0a2e 0%, " + D.bg + " 100%)" }}>
        <div className="orb-1" style={{ position: "absolute", top: "-30%", left: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(121,80,242,0.5) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div className="orb-2" style={{ position: "absolute", top: "-10%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,73,128,0.3) 0%, transparent 70%)", filter: "blur(70px)", pointerEvents: "none" }} />
        <div className="orb-3" style={{ position: "absolute", bottom: "10%", left: "50%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        {/* Scan line */}
        <div className="scan-line" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(121,80,242,0.4), transparent)", pointerEvents: "none" }} />
        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 20, left: 24, width: 20, height: 20, borderTop: "2px solid rgba(121,80,242,0.3)", borderLeft: "2px solid rgba(121,80,242,0.3)" }} />
        <div style={{ position: "absolute", top: 20, right: 24, width: 20, height: 20, borderTop: "2px solid rgba(121,80,242,0.3)", borderRight: "2px solid rgba(121,80,242,0.3)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto", padding: "40px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: D.text, marginBottom: 6, letterSpacing: "-0.03em" }}>
              {isOnboarding ? "Define el ADN de tu marca" : "ADN de tu marca"}
            </h1>
            <p style={{ fontSize: 14, color: D.text2, maxWidth: 500 }}>
              {isOnboarding ? "Completa tu perfil para que la IA genere contenido que suena como tú" : "Esta información guía toda tu generación de contenido"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* Autosave badge */}
            {saveStatus === "saving" && <span style={{ fontSize: 12, color: D.text3 }}>Guardando...</span>}
            {saveStatus === "saved" && <span style={{ fontSize: 12, color: "#40C057", fontWeight: 600 }}>✓ Guardado</span>}
            {/* CTA */}
            <button onClick={() => router.push("/crear")}
              style={{ padding: "10px 20px", background: "#40C057", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(64,192,87,0.3)" }}>
              {isOnboarding ? "Crear mi primera pieza →" : "Crear nueva pieza →"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Onboarding welcome */}
        {isOnboarding && (
          <div style={{ background: "linear-gradient(135deg,rgba(121,80,242,0.12),rgba(230,73,128,0.08))", border: "1px solid rgba(121,80,242,0.2)", borderRadius: 14, padding: "18px 22px", marginTop: 24, marginBottom: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: D.text, marginBottom: 6 }}>Bienvenida a AiStudioBrand!</div>
            <div style={{ fontSize: 13, color: D.text2, lineHeight: 1.6 }}>
              Antes de crear tu primera pieza, cuéntanos sobre tu marca. La IA usa esta info para generar contenido que suena exactamente como tú.
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div style={{ background: D.bg2, border: "1px solid " + D.border, borderRadius: 14, padding: "18px 22px", marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: pct >= 90 ? "#40C057" : D.text }}>
              {pct >= 90 ? "🎉 " : ""}Tu ADN está al {pct}% — {progressMsg}
            </div>
            <div style={{ fontSize: 12, color: D.text3 }}>{filledCount}/{progressFields.length}</div>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", width: pct + "%", background: pct >= 90 ? "linear-gradient(90deg,#40C057,#2B8A3E)" : "linear-gradient(90deg,#7950F2,#A78BFA)", borderRadius: 6, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {progressFields.map(f => (
              <span key={f.key} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20, background: f.done ? "rgba(121,80,242,0.15)" : "rgba(255,255,255,0.04)", color: f.done ? D.purpleLight : D.text3, border: "1px solid " + (f.done ? "rgba(121,80,242,0.2)" : "rgba(255,255,255,0.06)") }}>
                {f.done ? "✓ " : ""}{f.label}
              </span>
            ))}
          </div>
        </div>

        {/* === SECTION 1: Tu marca === */}
        <Section title="Tu marca" badge={marcaCount + "/4 campos"} badgeColor={marcaCount === 4 ? "green" : "default"} defaultOpen={true}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nombre / cuenta</label>
              <input className="input-focus" style={getInpStyle(profile.nombre)} placeholder="@tumarca" value={profile.nombre} onChange={e => setProfile(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Qué haces</label>
              <textarea className="input-focus" style={{ ...getInpStyle(profile.descripcion), minHeight: 80, resize: "none" }} placeholder="Soy coach de negocios para mujeres latinas..." value={profile.descripcion} onChange={e => setProfile(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>A quién le hablas</label>
              <input className="input-focus" style={getInpStyle(profile.audiencia)} placeholder="Mujeres latinas 28-42 en EE.UU." value={profile.audiencia} onChange={e => setProfile(p => ({ ...p, audiencia: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Propuesta de valor</label>
              <input className="input-focus" style={getInpStyle(profile.propuestaValor)} placeholder="Tu ventaja única — qué te hace diferente" value={profile.propuestaValor} onChange={e => setProfile(p => ({ ...p, propuestaValor: e.target.value }))} />
            </div>
          </div>
        </Section>

        {/* === SECTION 2: Tus canales === */}
        <Section title="Tus canales" badge={canalesCount + " conectado" + (canalesCount !== 1 ? "s" : "")} badgeColor={canalesCount > 0 ? "purple" : "default"} defaultOpen={true}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "📸", placeholder: "instagram.com/tucuenta", key: "instagramUrl" },
              { icon: "🎵", placeholder: "tiktok.com/@tucuenta", key: "tiktokUrl" },
              { icon: "🌐", placeholder: "tuweb.com", key: "webUrl" },
              { icon: "🎨", placeholder: "canva.com/tucuenta", key: "canvaUrl" },
            ].map(ch => (
              <div key={ch.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{ch.icon}</span>
                <input className="input-focus" style={{ ...getInpStyle(profile[ch.key]), flex: 1 }} placeholder={ch.placeholder} value={profile[ch.key]} onChange={e => setProfile(p => ({ ...p, [ch.key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </Section>

        {/* AI Analyze Banner — after channels */}
        <div style={{ background: "linear-gradient(135deg,#7950F2 0%,#4C1D95 100%)", borderRadius: 16, padding: "24px 22px", marginBottom: 16, boxShadow: "0 12px 32px rgba(121,80,242,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showAnalyze ? 16 : 0 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Analiza tu marca con IA</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Claude lee tus redes y web para construir tu ADN automáticamente</div>
            </div>
            <button onClick={() => setShowAnalyze(!showAnalyze)}
              style={{ padding: "9px 18px", background: showAnalyze ? "rgba(255,255,255,0.15)" : "#fff", color: showAnalyze ? "#fff" : "#7950F2", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
              {showAnalyze ? "Ocultar" : "Analizar con IA"}
            </button>
          </div>
          {showAnalyze && (
            <div>
              {!profile.instagramUrl && !profile.webUrl && !profile.tiktokUrl && !profile.canvaUrl && (
                <div style={{ fontSize: 12, color: "rgba(255,200,100,0.9)", marginBottom: 12, padding: "8px 12px", background: "rgba(255,200,100,0.1)", borderRadius: 8 }}>
                  Agrega al menos una URL en &ldquo;Tus canales&rdquo; arriba para poder analizar
                </div>
              )}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>Selecciona fuentes para el análisis:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  { key: "screenshots", label: "Screenshots de posts", icon: "🖼", available: true, hint: "Claude analiza tus imágenes directamente" },
                  { key: "web", label: "Página web", icon: "🌐", available: !!profile.webUrl, hint: profile.webUrl || "Agrega URL primero" },
                  { key: "instagram", label: "Instagram", icon: "📸", available: !!profile.instagramUrl, hint: profile.instagramUrl || "Agrega URL primero" },
                  { key: "tiktok", label: "TikTok", icon: "🎵", available: !!profile.tiktokUrl, hint: profile.tiktokUrl || "Agrega URL primero" },
                ].map(source => (
                  <div key={source.key}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, background: sources.includes(source.key) ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", border: "1px solid " + (sources.includes(source.key) ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"), opacity: source.available ? 1 : 0.4, cursor: source.available ? "pointer" : "not-allowed" }}
                    onClick={() => { if (!source.available) return; setSources(prev => prev.includes(source.key) ? prev.filter(s => s !== source.key) : [...prev, source.key]); }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid " + (sources.includes(source.key) ? "#fff" : "rgba(255,255,255,0.3)"), background: sources.includes(source.key) ? "#fff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#7950F2", flexShrink: 0 }}>
                      {sources.includes(source.key) ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 14 }}>{source.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{source.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{source.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
              {sources.includes("screenshots") && (
                <div style={{ marginBottom: 12 }}>
                  <input type="file" accept="image/*" multiple id="screenshots" style={{ display: "none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0, 6).map(f => ({ file: f, url: URL.createObjectURL(f) })); setScreenshots(prev => [...prev, ...arr].slice(0, 6)); }} />
                  {screenshots.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 8 }}>
                      {screenshots.map((s, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img src={s.url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, display: "block" }} />
                          <button onClick={() => setScreenshots(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#DC2626", border: "none", color: "#fff", fontSize: 9, cursor: "pointer" }}>x</button>
                        </div>
                      ))}
                      {screenshots.length < 6 && <label htmlFor="screenshots" style={{ aspectRatio: "1", border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, color: "rgba(255,255,255,0.4)" }}>+</label>}
                    </div>
                  ) : (
                    <label htmlFor="screenshots" style={{ display: "block", border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer" }}>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Sube screenshots de tus posts · Hasta 6</div>
                    </label>
                  )}
                </div>
              )}
              {analyzing && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{analyzeMsg}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{Math.round(Math.min(analyzeProgress, 95))}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: Math.min(analyzeProgress, 95) + "%", background: "#fff", borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              )}
              {analyzeError && <div style={{ background: "rgba(220,38,38,0.15)", borderRadius: 8, padding: 10, fontSize: 11, color: "#FCA5A5", marginBottom: 10 }}>{analyzeError}</div>}
              <button onClick={analyzeInstagram} disabled={analyzing || sources.length === 0}
                style={{ width: "100%", padding: 11, background: analyzing || sources.length === 0 ? "rgba(255,255,255,0.15)" : "#fff", color: analyzing || sources.length === 0 ? "rgba(255,255,255,0.5)" : "#7950F2", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: analyzing || sources.length === 0 ? "not-allowed" : "pointer" }}>
                {analyzing ? "Analizando con Claude..." : "Analizar " + sources.length + " fuente" + (sources.length !== 1 ? "s" : "") + " →"}
              </button>
            </div>
          )}
        </div>

        {/* === SECTION 3: Comunicación === */}
        <Section title="Comunicación" badge={comComplete ? "Completo ✓" : "Pendiente"} badgeColor={comComplete ? "green" : "default"} defaultOpen={true}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: D.text2, marginBottom: 10, fontWeight: 500 }}>Idioma</div>
            <div style={{ display: "flex", gap: 8 }}>
              {idiomas.map(i => (
                <button key={i} onClick={() => setProfile(p => ({ ...p, idioma: i }))}
                  style={{ padding: "8px 16px", borderRadius: 8, border: profile.idioma === i ? "1.5px solid " + D.purple : "1px solid " + D.border, background: profile.idioma === i ? "rgba(121,80,242,0.15)" : "transparent", color: profile.idioma === i ? D.purpleLight : D.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: D.text2, marginBottom: 10, fontWeight: 500 }}>Tono de voz</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tonos.map(t => (
                <button key={t} onClick={() => setProfile(p => ({ ...p, tono: t }))}
                  style={{ padding: "7px 14px", borderRadius: 8, border: profile.tono === t ? "1.5px solid " + D.purple : "1px solid " + D.border, background: profile.tono === t ? "rgba(121,80,242,0.15)" : "transparent", color: profile.tono === t ? D.purpleLight : D.text2, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: D.text2, marginBottom: 10, fontWeight: 500 }}>Categorías</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cats.map(c => (
                <button key={c} onClick={() => setProfile(p => ({ ...p, categorias: p.categorias.includes(c) ? p.categorias.filter(x => x !== c) : [...p.categorias, c] }))}
                  style={{ padding: "6px 12px", borderRadius: 8, border: profile.categorias.includes(c) ? "1.5px solid " + D.purple : "1px solid " + D.border, background: profile.categorias.includes(c) ? "rgba(121,80,242,0.15)" : "transparent", color: profile.categorias.includes(c) ? D.purpleLight : D.text2, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* === SECTION 4: Personalidad de marca === */}
        <Section title="Personalidad de marca" badge="Opcional pero recomendado" badgeColor="purple" defaultOpen={false}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>¿Cómo habla tu marca? ¿Qué evita?</label>
              <textarea className="input-focus" style={{ ...getInpStyle(profile.personalidad), minHeight: 90, resize: "none" }} placeholder="Ej: Hablo directo, uso humor, evito ser formal, digo 'reina' y 'amiga'..." value={profile.personalidad} onChange={e => setProfile(p => ({ ...p, personalidad: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>¿Cómo se ve tu marca visualmente?</label>
              <textarea className="input-focus" style={{ ...getInpStyle(profile.estiloVisual), minHeight: 70, resize: "none" }} placeholder="Ej: Minimalista con toques de color, lifestyle, editorial, colorido y vibrante..." value={profile.estiloVisual} onChange={e => setProfile(p => ({ ...p, estiloVisual: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Colores de marca</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                {presetColors.map(c => {
                  const selected = profile.coloresMarca.includes(c);
                  return (
                    <button key={c} onClick={() => setProfile(p => ({ ...p, coloresMarca: selected ? p.coloresMarca.filter(x => x !== c) : [...p.coloresMarca, c] }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: selected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.15)", cursor: "pointer", position: "relative", boxShadow: selected ? "0 0 0 2px " + D.purple : "none", transition: "all 0.2s" }}>
                      {selected && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: c === "#F8F9FA" || c === "#FFD93D" ? "#000" : "#fff", fontWeight: 700 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {/* Custom color input */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="input-focus" style={{ ...getInpStyle(customColorInput), width: 120, padding: "8px 12px", fontSize: 13, fontFamily: "monospace" }} placeholder="#hex" value={customColorInput} onChange={e => setCustomColorInput(e.target.value)} />
                <button onClick={() => { if (/^#[0-9A-Fa-f]{6}$/.test(customColorInput) && !profile.coloresMarca.includes(customColorInput)) { setProfile(p => ({ ...p, coloresMarca: [...p.coloresMarca, customColorInput] })); setCustomColorInput(""); } }}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px dashed " + D.border, background: "transparent", color: D.text3, fontSize: 12, cursor: "pointer" }}>+ Agregar</button>
              </div>
              {/* Selected colors display */}
              {profile.coloresMarca.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
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
          </div>
        </Section>

        {/* === SECTION 5: Ejemplos de copy === */}
        <Section title="Ejemplos de copy ideal" badge="Muy recomendado" badgeColor="purple" defaultOpen={false}>
          <div style={{ fontSize: 13, color: D.text2, marginBottom: 14, lineHeight: 1.5 }}>
            La IA aprende tu estilo exacto de estos ejemplos — pega captions de Instagram que consideras perfectos
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {profile.ejemplosCopy.map((ej, i) => (
              <div key={i}>
                <label style={{ ...labelStyle, fontSize: 11 }}>Ejemplo {i + 1}</label>
                <textarea className="input-focus" style={{ ...getInpStyle(ej), minHeight: 60, resize: "none" }} placeholder={"Pega un caption de Instagram que ames..."} value={ej}
                  onChange={e => { const arr = [...profile.ejemplosCopy]; arr[i] = e.target.value; setProfile(p => ({ ...p, ejemplosCopy: arr })); }} />
              </div>
            ))}
          </div>
          {/* Competitors */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, color: D.text2, marginBottom: 10, fontWeight: 500 }}>Marcas de referencia (opcional)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {profile.competidores.map((comp, i) => (
                <input key={i} className="input-focus" style={getInpStyle(comp)} placeholder={"@cuenta o URL " + (i + 1)} value={comp}
                  onChange={e => { const arr = [...profile.competidores]; arr[i] = e.target.value; setProfile(p => ({ ...p, competidores: arr })); }} />
              ))}
            </div>
          </div>
        </Section>

        {/* Bottom CTA */}
        <div style={{ background: "linear-gradient(135deg, rgba(121,80,242,0.12), rgba(167,139,250,0.08))", border: "1px solid rgba(121,80,242,0.2)", borderRadius: 20, padding: "36px 28px", textAlign: "center", marginTop: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: D.text, marginBottom: 8 }}>
            {pct >= 90 ? "🎉 Tu ADN está completo — ya puedes crear contenido!" : "Tu ADN está guardado — ya puedes crear contenido!"}
          </div>
          <div style={{ fontSize: 14, color: D.text2, marginBottom: 24 }}>
            {pct >= 90 ? "La IA tiene todo lo que necesita para sonar como tú" : "Puedes seguir completando tu perfil después"}
          </div>
          <button onClick={() => router.push("/crear")}
            style={{ padding: "16px 40px", background: "linear-gradient(135deg,#7950F2,#A78BFA)", color: "#fff", border: "none", borderRadius: 100, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 30px rgba(121,80,242,0.4)" }}>
            Ir a crear →
          </button>
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes orbFloat1 { 0% { transform: translate(0, 0); } 33% { transform: translate(30px, -20px); } 66% { transform: translate(-20px, 15px); } 100% { transform: translate(0, 0); } }
        @keyframes orbFloat2 { 0% { transform: translate(0, 0); } 33% { transform: translate(-25px, 20px); } 66% { transform: translate(15px, -25px); } 100% { transform: translate(0, 0); } }
        @keyframes orbFloat3 { 0% { transform: translate(0, 0); } 33% { transform: translate(20px, 15px); } 66% { transform: translate(-15px, -20px); } 100% { transform: translate(0, 0); } }
        .orb-1 { animation: orbFloat1 8s ease-in-out infinite; }
        .orb-2 { animation: orbFloat2 10s ease-in-out infinite; }
        .orb-3 { animation: orbFloat3 12s ease-in-out infinite; }
        @keyframes scanMove { 0% { top: 0; } 100% { top: 100%; } }
        .scan-line { animation: scanMove 4s linear infinite; }
        .input-focus:focus { border-color: #7950F2 !important; box-shadow: 0 0 0 2px rgba(121,80,242,0.15); }
      `}</style>
    </AppLayout>
  );
}

const labelStyle = { fontSize: 13, color: D.text2, display: "block", marginBottom: 6, fontWeight: 500 };

// --- Confetti Effect (CSS only) ---
const ConfettiEffect = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
    <style>{`
      @keyframes confettiFall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
      .confetti-piece {
        position: absolute;
        width: 10px;
        height: 10px;
        top: -10px;
        animation: confettiFall 3s ease-in forwards;
      }
    `}</style>
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="confetti-piece" style={{
        left: Math.random() * 100 + "%",
        background: ["#7950F2", "#A78BFA", "#E64980", "#40C057", "#FFD93D", "#FF6B35"][i % 6],
        borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
        width: 6 + Math.random() * 8,
        height: 6 + Math.random() * 8,
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
