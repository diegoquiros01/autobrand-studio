"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const TIPOS = ["Comercial", "Branding", "Educativo", "Storytelling", "Posicionamiento"];
const D = {
  bg:"#0D0D1F", bg2:"#111122", bg3:"rgba(255,255,255,0.04)",
  border:"rgba(255,255,255,0.08)", text:"#fff", text2:"rgba(255,255,255,0.55)",
  text3:"rgba(255,255,255,0.3)", purple:"#7950F2", purpleLight:"#A78BFA",
};

export default function Generar() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [tipo, setTipo] = useState("Comercial");
  const [loading, setLoading] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [copyMsg, setCopyMsg] = useState("");
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedCopy, setEditedCopy] = useState("");
  const [referencias, setReferencias] = useState([]);
  const [talentos, setTalentos] = useState([]);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genMsg, setGenMsg] = useState("");
  const [resultado, setResultado] = useState(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [skippedRef, setSkippedRef] = useState(false);
  const [skippedTalent, setSkippedTalent] = useState(false);
  const [brandProfile, setBrandProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const refInput = useRef(null);
  const talentInput = useRef(null);

  useEffect(() => {
    const bp = localStorage.getItem("brandProfile");
    if (bp) setBrandProfile(JSON.parse(bp));
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const generarCopy = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setProposals([]); setSelected(null); setCopyProgress(0);
    const msgs = ["Analizando tu marca...", "Generando propuestas...", "Aplicando tono de voz...", "Finalizando copies..."];
    let mi = 0; setCopyMsg(msgs[0]);
    const iv = setInterval(() => {
      setCopyProgress(p => Math.min(p + Math.random() * 12, 88));
      mi = Math.min(mi + 1, msgs.length - 1); setCopyMsg(msgs[mi]);
    }, 2500);
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt, tipo, brandProfile, userId: user?.id || "" }),
      });
      const data = await res.json();
      clearInterval(iv); setCopyProgress(100);
      setTimeout(() => { setCopyProgress(0); setCopyMsg(""); }, 400);
      if (data.error === "limit_reached") {
        setError("Alcanzaste tu limite de " + data.limit + " generaciones este mes. Actualiza tu plan para continuar.");
      } else {
        setProposals(data.propuestas);
      }
    } catch(e) {
      clearInterval(iv); setCopyProgress(0); setError("Error generando copy.");
    }
    setLoading(false);
  };

  const selectProposal = (p) => {
    setSelected(p.id); setEditingId(null);
    setEditedCopy(p.hook + "\n\n" + p.copy + "\n\n" + p.cta + (p.hashtags ? "\n\n" + p.hashtags : ""));
  };

  const toBase64 = (file) => new Promise((res,rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
  });

  const generarImagenFinal = async () => {
    const prop = proposals.find(p => p.id === selected);
    if (!prop) return;
    setGeneratingImg(true); setError(""); setGenProgress(0);
    const msgs2 = ["Analizando tu marca...", "Procesando referencias...", "Componiendo la imagen...", "Aplicando estilo...", "Finalizando..."];
    let mi2 = 0; setGenMsg(msgs2[0]);
    const iv2 = setInterval(() => {
      setGenProgress(p => Math.min(p + Math.random() * 8, 90));
      mi2 = Math.min(mi2 + 1, msgs2.length - 1); setGenMsg(msgs2[mi2]);
    }, 3000);
    try {
      const refB = await Promise.all(referencias.map(async r => ({ data: await toBase64(r.file), mimeType: r.file.type })));
      const talB = talentos.length > 0 ? await Promise.all(talentos.map(async t => ({ data: await toBase64(t.file), mimeType: t.file.type }))) : [];
      const res = await fetch("/api/generate-image", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt: prop.hook + ". " + prop.copy, brandProfile, referencias: refB, talentos: talB, editedCopy }),
      });
      const data = await res.json();
      if (data.image) { setResultado(data); setStep(4); await saveToLibrary(prop, data); }
      else setError("No se pudo generar la imagen.");
    } catch(e) { setError("Error generando imagen."); }
    clearInterval(iv2); setGenProgress(100); setGeneratingImg(false); setGenMsg("");
  };

  const saveToLibrary = async (prop, imgData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { localStorage.setItem("trialUsed","true"); setShowTrialModal(true); return; }
      const blob = await fetch("data:" + imgData.mimeType + ";base64," + imgData.image).then(r => r.blob());
      const fileName = user.id + "/resultados/" + Date.now() + ".png";
      await supabase.storage.from("assets").upload(fileName, blob);
      await supabase.from("generaciones").insert({ user_id: user.id, prompt, tipo, propuestas: proposals, imagen_url: fileName });
      setSavedToLibrary(true);
    } catch(e) { console.log("Error saving:", e); }
  };

  const resetAll = () => {
    setStep(1); setProposals([]); setSelected(null); setPrompt(""); setReferencias([]);
    setTalentos([]); setResultado(null); setSavedToLibrary(false); setSkippedRef(false);
    setSkippedTalent(false); setEditingId(null); setEditedCopy(""); setError("");
  };

  const StepBar = () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 0 0", gap:0 }}>
      {[{n:1,l:"Copy"},{n:2,l:"Referencias"},{n:3,l:"Talento"},{n:4,l:"Resultado"}].map((s,i) => (
        <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:500, background: step>s.n ? D.purple : step===s.n ? D.purple : "rgba(255,255,255,0.08)", color: step>=s.n ? "#fff" : D.text3, boxShadow: step===s.n ? "0 0 0 3px rgba(121,80,242,0.2)" : "none" }}>
              {step>s.n ? "+" : s.n}
            </div>
            <span style={{ fontSize:11, fontWeight:500, color: step>=s.n ? D.purpleLight : D.text3 }}>{s.l}</span>
          </div>
          {i<3 && <div style={{ width:28, height:1, background: step>s.n ? D.purple : D.border, margin:"0 8px" }} />}
        </div>
      ))}
    </div>
  );

  const NB = { width:"100%", padding:13, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginBottom:10 };
  const SB = { width:"100%", padding:12, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid " + D.border, borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" };

  return (
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid " + D.border, background:D.bg2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:D.purple, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:D.text }}>Ai<span style={{ color:D.purpleLight }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:8, marginLeft:"auto", alignItems:"center" }}>
          <button onClick={() => router.push("/biblioteca")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Mi biblioteca</button>
          <button onClick={() => router.push("/brand-profile")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Brand Profile</button>
          <button onClick={() => router.push("/cuenta")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Mi cuenta</button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, color:"rgba(255,255,255,0.3)", cursor:"pointer", background:"none", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8 }}>Salir</button>
        </div>
      </nav>

      <StepBar />

      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 24px 48px" }}>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4, letterSpacing:"-0.02em" }}>Genera tu copy</h1>
            <p style={{ fontSize:13.5, color:D.text2, marginBottom:20 }}>Describe tu idea y selecciona una de las 5 propuestas</p>
            <div style={{ background:D.bg3, border:"1.5px solid " + D.border, borderRadius:14, padding:20, marginBottom:16 }}>
              {brandProfile && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(121,80,242,0.15)", borderRadius:20, padding:"5px 12px", marginBottom:14, cursor:"pointer", border:"1px solid rgba(121,80,242,0.25)" }} onClick={() => router.push("/brand-profile")}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:D.purpleLight, display:"inline-block" }}></span>
                  <span style={{ fontSize:12, color:D.purpleLight, fontWeight:500 }}>{brandProfile.nombre} · {brandProfile.tono} · {brandProfile.idioma}</span>
                </div>
              )}
              <label style={{ fontSize:13, fontWeight:500, color:D.text2, display:"block", marginBottom:8 }}>Que quieres comunicar?</label>
              <textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Ej: Quiero anunciar mis 3 spots de coaching 1:1 para este mes..."
                style={{ width:"100%", border:"1.5px solid " + D.border, borderRadius:9, padding:"11px 13px", fontSize:14, fontFamily:"Inter, sans-serif", background:"rgba(255,255,255,0.04)", color:D.text, outline:"none", resize:"none" }} />
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipo(t)} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, border: tipo===t ? "1.5px solid " + D.purple : "1.5px solid " + D.border, color: tipo===t ? "#fff" : D.text2, background: tipo===t ? D.purple : "transparent", fontWeight: tipo===t ? 500 : 400, cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={generarCopy} disabled={!prompt.trim() || loading}
                style={{ width:"100%", marginTop:14, padding:12, background: !prompt.trim() || loading ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:500, cursor: !prompt.trim() || loading ? "not-allowed" : "pointer", fontFamily:"Inter, sans-serif" }}>
                {loading ? "Generando con IA..." : "Generar 5 versiones"}
              </button>
              {loading && copyProgress > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12, color:D.purpleLight }}>{copyMsg}</span>
                    <span style={{ fontSize:12, color:D.purpleLight }}>{Math.round(Math.min(copyProgress, 95))}%</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width: Math.min(copyProgress,95) + "%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4, transition:"width 0.5s ease" }} />
                  </div>
                </div>
              )}
            </div>

            {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:9, padding:12, color:"#FCA5A5", fontSize:13, marginBottom:14 }}>{error}</div>}

            {proposals.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>5 propuestas · Selecciona una</div>
                {proposals.map(p => (
                  <div key={p.id} style={{ background: selected===p.id ? "rgba(121,80,242,0.08)" : D.bg3, border: selected===p.id ? "1.5px solid " + D.purple : "1px solid " + D.border, borderRadius:12, padding:"14px 16px", marginBottom:8 }}>
                    <div style={{ fontSize:10, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Propuesta {p.id}</div>
                    {editingId === p.id ? (
                      <div>
                        <textarea rows={7} value={editedCopy} onChange={e => setEditedCopy(e.target.value)}
                          style={{ width:"100%", border:"1.5px solid " + D.purple, borderRadius:9, padding:"10px 12px", fontSize:13, fontFamily:"Inter, sans-serif", background:"rgba(121,80,242,0.06)", color:D.text, outline:"none", resize:"none", marginBottom:8 }} />
                        <button onClick={() => setEditingId(null)} style={{ padding:"5px 12px", borderRadius:6, fontSize:11, background:D.purple, color:"#fff", border:"none", cursor:"pointer", fontFamily:"Inter, sans-serif" }}>Guardar</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:5 }}>{p.hook}</div>
                        <div style={{ fontSize:12.5, color:D.text2, lineHeight:1.6, marginBottom:5 }}>{p.copy}</div>
                        <div style={{ fontSize:12, color:D.purpleLight, fontWeight:500, marginBottom:5 }}>{p.cta}</div>
                        {p.hashtags && <div style={{ fontSize:11.5, color:"rgba(167,139,250,0.6)", marginBottom:10 }}>{p.hashtags}</div>}
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <button onClick={() => selectProposal(p)} style={{ padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:500, background: selected===p.id ? D.purple : "rgba(255,255,255,0.06)", color: selected===p.id ? "#fff" : D.text2, border: selected===p.id ? "none" : "1px solid " + D.border, cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
                            {selected===p.id ? "Seleccionada" : "Seleccionar"}
                          </button>
                          <button onClick={() => { setEditingId(p.id); setEditedCopy(p.hook + "\n\n" + p.copy + "\n\n" + p.cta + (p.hashtags ? "\n\n" + p.hashtags : "")); }}
                            style={{ padding:"5px 12px", borderRadius:6, fontSize:11, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid " + D.border, cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
                            Editar
                          </button>
                          {selected === p.id && (
                            <button onClick={() => setStep(2)}
                              style={{ padding:"5px 14px", borderRadius:6, fontSize:11, fontWeight:500, background:"linear-gradient(135deg,#E64980,#7950F2)", color:"#fff", border:"none", cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
                              Generar imagen
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4 }}>Referencias visuales</h1>
            <p style={{ fontSize:13.5, color:D.text2, marginBottom:24 }}>Sube fotos de inspiracion para guiar el estilo — o salta este paso</p>
            <input ref={refInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,3).map(f => ({ file:f, url:URL.createObjectURL(f) })); setReferencias(arr); }} />
            {skippedRef ? (
              <div style={{ border:"2px dashed " + D.border, borderRadius:14, padding:"36px 20px", textAlign:"center", marginBottom:16, opacity:0.4 }}>
                <div style={{ fontSize:14, color:D.text3 }}>Paso omitido</div>
              </div>
            ) : (
              <div onClick={() => refInput.current.click()} style={{ border:"2px dashed " + D.border, borderRadius:14, padding:"36px 20px", textAlign:"center", cursor:"pointer", marginBottom:16, background:D.bg3 }}>
                <div style={{ fontSize:28, opacity:0.2, marginBottom:10, color:"#fff" }}>+</div>
                <div style={{ fontSize:14, color:D.text2, fontWeight:500 }}>Sube imagenes de referencia</div>
                <div style={{ fontSize:12, color:D.text3, marginTop:4 }}>Estilos o composiciones que te inspiran - Max 3</div>
              </div>
            )}
            {referencias.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                {referencias.map((r,i) => (
                  <div key={i} style={{ borderRadius:10, overflow:"hidden", border:"1.5px solid " + D.border }}>
                    <img src={r.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setStep(3)} style={NB}>Continuar - Agregar talento</button>
            <button onClick={() => { setSkippedRef(true); setReferencias([]); setStep(3); }} style={SB}>Saltar este paso</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4 }}>Foto de talento</h1>
            <p style={{ fontSize:13.5, color:D.text2, marginBottom:24 }}>Sube fotos de personas para incluir en la imagen — hasta 3 — o salta</p>
            <input ref={talentInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,3).map(f => ({ file:f, url:URL.createObjectURL(f) })); setTalentos(prev => [...prev,...arr].slice(0,3)); }} />
            {skippedTalent ? (
              <div style={{ border:"2px dashed " + D.border, borderRadius:14, padding:"48px 20px", textAlign:"center", marginBottom:16, opacity:0.4 }}>
                <div style={{ fontSize:14, color:D.text3 }}>Paso omitido</div>
              </div>
            ) : talentos.length > 0 ? (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
                  {talentos.map((t,i) => (
                    <div key={i} style={{ position:"relative" }}>
                      <img src={t.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block", borderRadius:10, border:"1.5px solid " + D.purple }} />
                      <button onClick={() => setTalentos(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:4, right:4, width:20, height:20, borderRadius:"50%", background:"#DC2626", border:"none", color:"#fff", fontSize:10, cursor:"pointer" }}>x</button>
                    </div>
                  ))}
                  {talentos.length < 3 && (
                    <div onClick={() => talentInput.current.click()} style={{ aspectRatio:"1", border:"2px dashed " + D.border, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:24, color:D.text3 }}>+</div>
                  )}
                </div>
                <div style={{ fontSize:12, color:D.text3, textAlign:"center" }}>{talentos.length}/3 fotos</div>
              </div>
            ) : (
              <div onClick={() => talentInput.current.click()} style={{ border:"2px dashed " + D.border, borderRadius:14, padding:"48px 20px", textAlign:"center", cursor:"pointer", marginBottom:16, background:D.bg3 }}>
                <div style={{ fontSize:36, opacity:0.15, marginBottom:12, color:"#fff" }}>o</div>
                <div style={{ fontSize:14, color:D.text2, fontWeight:500 }}>Sube fotos de talento</div>
                <div style={{ fontSize:12, color:D.text3, marginTop:4 }}>La IA las incluira en la imagen final</div>
              </div>
            )}
            <button onClick={generarImagenFinal} disabled={generatingImg} style={{ ...NB, background: generatingImg ? "rgba(230,73,128,0.3)" : "linear-gradient(135deg,#E64980,#7950F2)", cursor: generatingImg ? "not-allowed" : "pointer" }}>
              {generatingImg ? "Generando imagen con IA..." : "Generar imagen final"}
            </button>
            <button onClick={() => { setSkippedTalent(true); setTalentos([]); generarImagenFinal(); }} disabled={generatingImg} style={{ ...SB, cursor: generatingImg ? "not-allowed" : "pointer" }}>
              {generatingImg ? "Generando..." : "Generar sin foto de talento"}
            </button>
            {generatingImg && (
              <div style={{ marginTop:20, background:D.bg3, border:"1px solid rgba(121,80,242,0.2)", borderRadius:12, padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:13, color:D.purpleLight, fontWeight:500 }}>{genMsg}</span>
                  <span style={{ fontSize:13, color:D.purpleLight }}>{Math.round(Math.min(genProgress,95))}%</span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:5, overflow:"hidden" }}>
                  <div style={{ height:"100%", width: Math.min(genProgress,95) + "%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:5, transition:"width 0.5s ease" }} />
                </div>
                <div style={{ fontSize:11, color:D.text3, marginTop:8, textAlign:"center" }}>Gemini esta procesando - 20-30 segundos</div>
              </div>
            )}
            {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:9, padding:12, color:"#FCA5A5", fontSize:13, marginTop:12 }}>{error}</div>}
          </div>
        )}

        {step === 4 && resultado && (
          <div style={{ position:"relative" }}>
            <h1 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:4 }}>Resultado final</h1>
            <p style={{ fontSize:13.5, color:D.text2, marginBottom:20 }}>Tu pieza esta lista para publicar</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start", filter: showTrialModal ? "blur(4px)" : "none", pointerEvents: showTrialModal ? "none" : "auto" }}>
              <div>
                <img src={"data:" + resultado.mimeType + ";base64," + resultado.image} alt="Imagen generada" style={{ width:"100%", borderRadius:14, display:"block", border:"1px solid " + D.border }} />
                {savedToLibrary && (
                  <button onClick={() => { const a = document.createElement("a"); a.href = "data:" + resultado.mimeType + ";base64," + resultado.image; a.download = "aistudiobrand.png"; a.click(); }}
                    style={{ width:"100%", padding:11, background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid " + D.border, borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", marginTop:10, fontFamily:"Inter, sans-serif" }}>
                    Descargar imagen
                  </button>
                )}
              </div>
              <div>
                <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:18, marginBottom:12 }}>
                  <div style={{ fontSize:10, fontWeight:500, color:D.purpleLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7 }}>Copy final</div>
                  <div style={{ fontSize:13, color:D.text2, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{editedCopy}</div>
                </div>
                {savedToLibrary && !showTrialModal && (
                  <div style={{ background:"rgba(64,192,87,0.08)", border:"1px solid rgba(64,192,87,0.2)", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"#86EFAC", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                    Guardado en tu biblioteca
                  </div>
                )}
                {savedToLibrary ? (
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={resetAll} style={{ flex:1, padding:10, border:"1px solid " + D.border, borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background:"transparent", color:D.text2, fontFamily:"Inter, sans-serif" }}>Nueva pieza</button>
                    <button onClick={() => router.push("/biblioteca")} style={{ flex:1, padding:10, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background:D.purple, color:"#fff", fontFamily:"Inter, sans-serif" }}>Ver biblioteca</button>
                  </div>
                ) : (
                  <div style={{ background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.25)", borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:13, color:D.purpleLight, marginBottom:10, fontWeight:500 }}>Crea una cuenta para descargar y guardar esta pieza</div>
                    <button onClick={() => router.push("/login")} style={{ width:"100%", padding:11, background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
                      Crear cuenta gratis →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showTrialModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
          <div style={{ background:"#111122", border:"1px solid rgba(121,80,242,0.3)", borderRadius:20, padding:"36px 32px", maxWidth:420, width:"100%", textAlign:"center" }}>
            <div style={{ width:48, height:48, background:D.purple, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:20, fontWeight:500, margin:"0 auto 16px" }}>Ai</div>
            <h2 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:8 }}>Tu pieza esta lista!</h2>
            <p style={{ fontSize:14, color:D.text2, lineHeight:1.65, marginBottom:24 }}>Registrate gratis para guardarla en tu biblioteca y seguir generando contenido.</p>
            <button onClick={() => router.push("/login")} style={{ width:"100%", padding:13, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginBottom:10 }}>
              Crear cuenta gratis
            </button>
            <button onClick={() => { setShowTrialModal(false); }} style={{ width:"100%", padding:12, background:"transparent", color:"rgba(255,255,255,0.2)", border:"none", borderRadius:10, fontSize:13, cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
              Solo ver el resultado (sin guardar)
            </button>
            <div style={{ fontSize:11, color:D.text3, marginTop:12 }}>Sin tarjeta de credito - 20 generaciones gratis</div>
          </div>
        </div>
      )}
    </div>
  );
}