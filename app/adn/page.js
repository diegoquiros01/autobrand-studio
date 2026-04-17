"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";

function ADNContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [sources, setSources] = useState([]);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  const screenshotRef = useRef(null);
  const [profile, setProfile] = useState({
    nombre: "", descripcion: "", audiencia: "", tono: "",
    idioma: "Español", categorias: [], propuestaValor: "",
    instagramUrl: "", tiktokUrl: "", webUrl: "", canvaUrl: "",
    personalidad: "", coloresMarca: [], estiloVisual: "",
    ejemplosCopy: ["", "", ""], competidores: ["", "", ""],
  });

  const D = {
    bg3:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)",
    text:"#fff", text2:"rgba(255,255,255,0.55)", text3:"rgba(255,255,255,0.3)",
    purple:"#7950F2", purpleLight:"#A78BFA",
  };

  const tonos = ["Empoderador","Cercano","Profesional","Divertido","Inspiracional","Educativo"];
  const idiomas = ["Español","Inglés","Spanglish"];
  const cats = ["Coaching","Lifestyle","Moda","Belleza","Negocio","Motivación","Educación","Fitness","Recetas","Familia"];

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data } = await supabase.from("brand_profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile({
          nombre: data.nombre || "", descripcion: data.descripcion || "",
          audiencia: data.audiencia || "", tono: data.tono || "",
          idioma: data.idioma || "Español", categorias: data.categorias || [],
          propuestaValor: data.propuesta_valor || "",
          instagramUrl: data.instagram_url || "", tiktokUrl: data.tiktok_url || "", webUrl: data.web_url || "", canvaUrl: data.canva_url || "",
          personalidad: data.personalidad || "", coloresMarca: data.colores_marca || [],
          estiloVisual: data.estilo_visual || "",
          ejemplosCopy: data.ejemplos_copy && data.ejemplos_copy.length > 0 ? data.ejemplos_copy : ["", "", ""],
          competidores: data.competidores && data.competidores.length > 0 ? data.competidores : ["", "", ""],
        });
        localStorage.setItem("brandProfile", JSON.stringify({
          nombre: data.nombre, descripcion: data.descripcion,
          audiencia: data.audiencia, tono: data.tono,
          idioma: data.idioma, categorias: data.categorias,
          propuestaValor: data.propuesta_valor,
          personalidad: data.personalidad, coloresMarca: data.colores_marca,
          estiloVisual: data.estilo_visual, ejemplosCopy: data.ejemplos_copy,
        }));
      }
    };
    init();
  }, []);

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
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ images, instagramUrl: profile.instagramUrl, tiktokUrl: profile.tiktokUrl, webUrl: profile.webUrl, sources }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(prev => ({ ...prev, ...data.profile, instagramUrl: prev.instagramUrl, tiktokUrl: prev.tiktokUrl, webUrl: prev.webUrl, canvaUrl: prev.canvaUrl }));
        setShowAnalyze(false);
      } else if (data.error) {
        setAnalyzeError("Error: " + data.error);
      }
    } catch(e) { setAnalyzeError("Error analizando tu marca. Intenta de nuevo."); console.error(e); }
    clearInterval(iv); setAnalyzeProgress(100); setAnalyzing(false); setAnalyzeMsg("");
  };

  const guardar = async () => {
    if (!user) return;
    setSaving(true);
    localStorage.setItem("brandProfile", JSON.stringify(profile));
    const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", user.id).single();
    const payload = {
      nombre: profile.nombre, descripcion: profile.descripcion,
      audiencia: profile.audiencia, tono: profile.tono,
      idioma: profile.idioma, categorias: profile.categorias,
      propuesta_valor: profile.propuestaValor,
      instagram_url: profile.instagramUrl, tiktok_url: profile.tiktokUrl, web_url: profile.webUrl, canva_url: profile.canvaUrl,
      personalidad: profile.personalidad,
      colores_marca: profile.coloresMarca.filter(c => c),
      estilo_visual: profile.estiloVisual,
      ejemplos_copy: profile.ejemplosCopy.filter(e => e),
      competidores: profile.competidores.filter(c => c),
      updated_at: new Date().toISOString(),
    };
    if (existing) await supabase.from("brand_profiles").update(payload).eq("user_id", user.id);
    else await supabase.from("brand_profiles").insert({ ...payload, user_id: user.id });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 12px", fontSize:13, color:D.text, outline:"none", fontFamily:"Inter, sans-serif" };

  return (
    <AppLayout>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 24px" }}>
        {isOnboarding && (
          <div style={{ background:"linear-gradient(135deg,rgba(121,80,242,0.15),rgba(230,73,128,0.1))", border:"1px solid rgba(121,80,242,0.3)", borderRadius:14, padding:20, marginBottom:24 }}>
            <div style={{ fontSize:18, fontWeight:500, color:D.text, marginBottom:6 }}>Bienvenida a AiStudioBrand! 🎉</div>
            <div style={{ fontSize:13, color:D.text2, lineHeight:1.65, marginBottom:12 }}>
              Antes de crear tu primera pieza, cuéntanos sobre tu marca. Esta información es la base que la IA usa para generar contenido que suena exactamente como tú.
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {["Define tu marca", "Genera contenido", "Publica en segundos"].map((step, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:D.purple, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, color:"#fff", flexShrink:0 }}>{i+1}</div>
                  <span style={{ fontSize:12, color:D.text2 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4, letterSpacing:"-0.02em" }}>{isOnboarding ? "Define el ADN de tu marca" : "ADN de tu marca"}</h1>
            <p style={{ fontSize:13, color:D.text2 }}>{isOnboarding ? "Completa tu perfil para que la IA genere contenido que suena exactamente como tú" : "Esta información guía toda la generación de contenido — edítala cuando quieras"}</p>
          </div>
          <button onClick={guardar} disabled={saving}
            style={{ padding:"9px 20px", background: saved ? "#40C057" : saving ? "rgba(121,80,242,0.4)" : D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
            {saved ? "✓ Guardado" : saving ? "Guardando..." : isOnboarding ? "Guardar y crear mi primera pieza →" : "Guardar cambios"}
          </button>
        </div>

        <div style={{ background:"rgba(121,80,242,0.08)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: showAnalyze ? 16 : 0 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:3 }}>✦ Analiza tu marca con IA</div>
              <div style={{ fontSize:12, color:D.text2 }}>Claude analiza tus canales y construye tu ADN automáticamente</div>
            </div>
            <button onClick={() => setShowAnalyze(!showAnalyze)}
              style={{ padding:"7px 14px", background: showAnalyze ? D.purple : "rgba(255,255,255,0.06)", color: showAnalyze ? "#fff" : D.text2, border:"1px solid " + (showAnalyze ? D.purple : "rgba(255,255,255,0.1)"), borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
              {showAnalyze ? "Ocultar" : "Usar IA →"}
            </button>
          </div>
          {showAnalyze && (
            <div>
              <div style={{ fontSize:12, color:D.text2, marginBottom:10 }}>Selecciona qué fuentes quieres incluir en el análisis:</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {[
                  { key:"screenshots", label:"Screenshots de posts", icon:"🖼", available: true, url: null, hint:"La fuente más poderosa — Claude analiza tus imágenes directamente" },
                  { key:"web", label:"Página web", icon:"🌐", available: !!profile.webUrl, url: profile.webUrl, hint:"Claude lee tu web y extrae tu mensaje y propuesta de valor" },
                  { key:"instagram", label:"Instagram", icon:"📸", available: !!profile.instagramUrl, url: profile.instagramUrl, hint:"Sube screenshots de tu feed para mejores resultados" },
                  { key:"tiktok", label:"TikTok", icon:"🎵", available: !!profile.tiktokUrl, url: profile.tiktokUrl, hint:"Sube screenshots de tus videos para mejores resultados" },
                  { key:"canva", label:"Canva", icon:"🎨", available: !!profile.canvaUrl, url: profile.canvaUrl, hint:null },
                ].map(source => (
                  <div key={source.key} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:9, background: !source.available ? "rgba(255,255,255,0.02)" : sources.includes(source.key) ? "rgba(121,80,242,0.12)" : "rgba(255,255,255,0.04)", border:"1px solid " + (!source.available ? "rgba(255,255,255,0.05)" : sources.includes(source.key) ? "rgba(121,80,242,0.3)" : "rgba(255,255,255,0.08)"), opacity: !source.available ? 0.4 : 1, cursor: source.available ? "pointer" : "not-allowed" }}
                    onClick={() => { if (!source.available) return; setSources(prev => prev.includes(source.key) ? prev.filter(s => s !== source.key) : [...prev, source.key]); }}>
                    <div style={{ width:18, height:18, borderRadius:5, border:"1.5px solid " + (sources.includes(source.key) ? D.purple : "rgba(255,255,255,0.2)"), background: sources.includes(source.key) ? D.purple : "transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", flexShrink:0 }}>
                      {sources.includes(source.key) ? "✓" : ""}
                    </div>
                    <span style={{ fontSize:14 }}>{source.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:D.text }}>{source.label}</div>
                      {source.url && <div style={{ fontSize:10, color:D.text3 }}>{source.url}</div>}
                      {source.hint && source.available && <div style={{ fontSize:10, color:"rgba(121,80,242,0.6)", marginTop:1 }}>{source.hint}</div>}
                      {!source.available && source.key !== "screenshots" && <div style={{ fontSize:10, color:"rgba(255,100,100,0.5)" }}>{"Agrega la URL en \"Tus canales\" primero"}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {sources.includes("screenshots") && (
                <div style={{ marginBottom:12 }}>
                  <input type="file" accept="image/*" multiple id="screenshots" style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,6).map(f => ({ file:f, url:URL.createObjectURL(f) })); setScreenshots(prev => [...prev,...arr].slice(0,6)); }} />
                  {screenshots.length > 0 ? (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6, marginBottom:8 }}>
                      {screenshots.map((s,i) => (
                        <div key={i} style={{ position:"relative" }}>
                          <img src={s.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:8, display:"block" }} />
                          <button onClick={() => setScreenshots(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:2, right:2, width:16, height:16, borderRadius:"50%", background:"#DC2626", border:"none", color:"#fff", fontSize:9, cursor:"pointer" }}>x</button>
                        </div>
                      ))}
                      {screenshots.length < 6 && (
                        <label htmlFor="screenshots" style={{ aspectRatio:"1", border:"2px dashed rgba(255,255,255,0.1)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:20, color:D.text3 }}>+</label>
                      )}
                    </div>
                  ) : (
                    <label htmlFor="screenshots" style={{ display:"block", border:"2px dashed rgba(121,80,242,0.3)", borderRadius:10, padding:"16px", textAlign:"center", cursor:"pointer", marginBottom:8 }}>
                      <div style={{ fontSize:13, color:D.text2, fontWeight:500 }}>Sube screenshots de tus posts · Hasta 6</div>
                    </label>
                  )}
                </div>
              )}

              {analyzing && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:D.purpleLight }}>{analyzeMsg}</span>
                    <span style={{ fontSize:11, color:D.purpleLight }}>{Math.round(Math.min(analyzeProgress,95))}%</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width: Math.min(analyzeProgress,95) + "%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4, transition:"width 0.5s" }} />
                  </div>
                </div>
              )}
              {analyzeError && (
                <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5", marginBottom:10 }}>{analyzeError}</div>
              )}
              <button onClick={analyzeInstagram} disabled={analyzing || sources.length === 0 || (sources.includes("screenshots") && screenshots.length === 0 && sources.length === 1)}
                style={{ width:"100%", padding:10, background: analyzing || sources.length === 0 ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor: analyzing || sources.length === 0 ? "not-allowed" : "pointer" }}>
                {analyzing ? "Analizando con Claude..." : "Analizar y generar ADN (" + sources.length + " fuentes)"}
              </button>
            </div>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18 }}>
            <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Tu marca</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>Nombre / cuenta</label>
                <input style={inp} placeholder="@tumarca" value={profile.nombre} onChange={e => setProfile(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>Qué haces</label>
                <textarea style={{ ...inp, minHeight:70, resize:"none" }} placeholder="Soy coach de negocios para mujeres latinas..." value={profile.descripcion} onChange={e => setProfile(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>A quién le hablas</label>
                <input style={inp} placeholder="Mujeres latinas 28-42 en EE.UU." value={profile.audiencia} onChange={e => setProfile(p => ({ ...p, audiencia: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>Propuesta de valor</label>
                <input style={inp} placeholder="Tu ventaja única" value={profile.propuestaValor} onChange={e => setProfile(p => ({ ...p, propuestaValor: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Tus canales</div>
              <div style={{ fontSize:11, color:"rgba(121,80,242,0.7)", marginBottom:10 }}>Recomendado: agrega al menos uno</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>📸</span>
                  <input style={{ ...inp, flex:1 }} placeholder="instagram.com/tucuenta" value={profile.instagramUrl} onChange={e => setProfile(p => ({ ...p, instagramUrl: e.target.value }))} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>🎵</span>
                  <input style={{ ...inp, flex:1 }} placeholder="tiktok.com/@tucuenta" value={profile.tiktokUrl} onChange={e => setProfile(p => ({ ...p, tiktokUrl: e.target.value }))} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>🌐</span>
                  <input style={{ ...inp, flex:1 }} placeholder="tuweb.com" value={profile.webUrl} onChange={e => setProfile(p => ({ ...p, webUrl: e.target.value }))} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>🎨</span>
                  <input style={{ ...inp, flex:1 }} placeholder="canva.com/tucuenta" value={profile.canvaUrl} onChange={e => setProfile(p => ({ ...p, canvaUrl: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Comunicación</div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, color:D.text2, marginBottom:8 }}>Idioma</div>
                <div style={{ display:"flex", gap:6 }}>
                  {idiomas.map(i => (
                    <button key={i} onClick={() => setProfile(p => ({ ...p, idioma: i }))}
                      style={{ padding:"6px 12px", borderRadius:7, border: profile.idioma===i ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: profile.idioma===i ? "rgba(121,80,242,0.15)" : "transparent", color: profile.idioma===i ? D.purpleLight : D.text2, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, color:D.text2, marginBottom:8 }}>Tono de voz</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {tonos.map(t => (
                    <button key={t} onClick={() => setProfile(p => ({ ...p, tono: t }))}
                      style={{ padding:"5px 10px", borderRadius:7, border: profile.tono===t ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: profile.tono===t ? "rgba(121,80,242,0.15)" : "transparent", color: profile.tono===t ? D.purpleLight : D.text2, fontSize:11, fontWeight:500, cursor:"pointer" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:D.text2, marginBottom:8 }}>Categorías</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {cats.map(c => (
                    <button key={c} onClick={() => setProfile(p => ({ ...p, categorias: p.categorias.includes(c) ? p.categorias.filter(x => x!==c) : [...p.categorias, c] }))}
                      style={{ padding:"5px 10px", borderRadius:7, border: profile.categorias.includes(c) ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: profile.categorias.includes(c) ? "rgba(121,80,242,0.15)" : "transparent", color: profile.categorias.includes(c) ? D.purpleLight : D.text2, fontSize:11, fontWeight:500, cursor:"pointer" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18 }}>
            <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Personalidad de marca</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>Personalidad y voz</label>
                <textarea style={{ ...inp, minHeight:80, resize:"none" }} placeholder="Cómo habla tu marca, qué evita, frases típicas... Ej: Hablo directo, uso humor, evito ser formal, digo 'reina' y 'amiga'..." value={profile.personalidad} onChange={e => setProfile(p => ({ ...p, personalidad: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>Estilo visual</label>
                <textarea style={{ ...inp, minHeight:60, resize:"none" }} placeholder="Ej: Minimalista con toques de color, lifestyle, editorial, colorido y vibrante..." value={profile.estiloVisual} onChange={e => setProfile(p => ({ ...p, estiloVisual: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:D.text2, display:"block", marginBottom:5 }}>Colores de marca</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  {profile.coloresMarca.map((c, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <input type="color" value={c} onChange={e => { const arr = [...profile.coloresMarca]; arr[i] = e.target.value; setProfile(p => ({ ...p, coloresMarca: arr })); }}
                        style={{ width:28, height:28, border:"none", borderRadius:6, cursor:"pointer", background:"transparent" }} />
                      <span style={{ fontSize:10, color:D.text3, fontFamily:"monospace" }}>{c}</span>
                      <button onClick={() => setProfile(p => ({ ...p, coloresMarca: p.coloresMarca.filter((_, j) => j !== i) }))}
                        style={{ width:16, height:16, borderRadius:"50%", background:"rgba(220,38,38,0.2)", border:"none", color:"#FCA5A5", fontSize:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>x</button>
                    </div>
                  ))}
                  {profile.coloresMarca.length < 6 && (
                    <button onClick={() => setProfile(p => ({ ...p, coloresMarca: [...p.coloresMarca, "#7950F2"] }))}
                      style={{ padding:"4px 10px", borderRadius:6, border:"1px dashed rgba(255,255,255,0.15)", background:"transparent", color:D.text3, fontSize:11, cursor:"pointer" }}>+ Color</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Ejemplos de copy ideal</div>
              <div style={{ fontSize:11, color:"rgba(121,80,242,0.7)", marginBottom:10 }}>Pega 3 textos que consideras perfectos para tu marca</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {profile.ejemplosCopy.map((ej, i) => (
                  <textarea key={i} style={{ ...inp, minHeight:50, resize:"none" }} placeholder={"Ejemplo " + (i + 1) + "..."} value={ej}
                    onChange={e => { const arr = [...profile.ejemplosCopy]; arr[i] = e.target.value; setProfile(p => ({ ...p, ejemplosCopy: arr })); }} />
                ))}
              </div>
            </div>

            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Marcas de referencia</div>
              <div style={{ fontSize:11, color:"rgba(121,80,242,0.7)", marginBottom:10 }}>Marcas que admiras o que son tu inspiración</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {profile.competidores.map((comp, i) => (
                  <input key={i} style={inp} placeholder={"@cuenta o URL " + (i + 1)} value={comp}
                    onChange={e => { const arr = [...profile.competidores]; arr[i] = e.target.value; setProfile(p => ({ ...p, competidores: arr })); }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => router.push("/crear")}
          style={{ width:"100%", padding:13, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer" }}>
          Listo — crear mi primera pieza →
        </button>
      </div>
    </AppLayout>
  );
}

export default function ADN() {
  return (
    <Suspense fallback={null}>
      <ADNContent />
    </Suspense>
  );
}