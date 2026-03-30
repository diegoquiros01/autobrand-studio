"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";

const TIPOS = ["Comercial","Branding","Educativo","Storytelling","Promocional","Posicionamiento"];

const D = {
  bg3:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)",
  text:"#fff", text2:"rgba(255,255,255,0.55)", text3:"rgba(255,255,255,0.3)",
  purple:"#7950F2", purpleLight:"#A78BFA",
};

export default function Crear() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);
  const [piezaId, setPiezaId] = useState(null);

  // Step 1
  const [prompt, setPrompt] = useState("");
  const [tipo, setTipo] = useState("Comercial");

  // Step 2 - Referencias
  const [referencias, setReferencias] = useState([]);
  const refInput = useRef(null);

  // Step 3 - Talento
  const [talentos, setTalentos] = useState([]);
  const talentInput = useRef(null);

  // Step 4 - Imagen
  const [generatingImg, setGeneratingImg] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genMsg, setGenMsg] = useState("");
  const [versiones, setVersiones] = useState([]);
  const [versionActiva, setVersionActiva] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [imgAprobada, setImgAprobada] = useState(false);

  // Step 5 - Copy
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [copies, setCopies] = useState([]);
  const [copySeleccionado, setCopySeleccionado] = useState(null);
  const [editingCopy, setEditingCopy] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Final
  const [savedFinal, setSavedFinal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const bp = localStorage.getItem("brandProfile");
    if (bp) setBrandProfile(JSON.parse(bp));
  }, []);

  const toBase64 = (file) => new Promise((res,rej) => {
    const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
  });

  const generarImagen = async (feedbackText = "") => {
    setGeneratingImg(true); setError(""); setGenProgress(0);
    const msgs = ["Analizando tu marca...","Procesando referencias...","Componiendo la imagen...","Aplicando estilo...","Finalizando..."];
    let mi = 0; setGenMsg(msgs[0]);
    const iv = setInterval(() => {
      setGenProgress(p => Math.min(p + Math.random() * 8, 90));
      mi = Math.min(mi + 1, msgs.length - 1); setGenMsg(msgs[mi]);
    }, 3000);
    try {
      const refB = await Promise.all(referencias.map(async r => ({ data: await toBase64(r.file), mimeType: r.file.type })));
      const talB = talentos.length > 0 ? await Promise.all(talentos.map(async t => ({ data: await toBase64(t.file), mimeType: t.file.type }))) : [];
      const promptFinal = feedbackText ? prompt + ". Ajuste: " + feedbackText : prompt;
      const res = await fetch("/api/generate-image", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt: promptFinal, brandProfile, referencias: refB, talentos: talB, editedCopy: "" }),
      });
      const data = await res.json();
      if (data.image) {
        const newVersion = { image: data.image, mimeType: data.mimeType, feedback: feedbackText, timestamp: new Date().toLocaleTimeString() };
        setVersiones(prev => { const updated = [...prev, newVersion]; setVersionActiva(updated.length - 1); return updated; });
        setFeedback("");
      } else setError("No se pudo generar la imagen.");
    } catch(e) { setError("Error generando imagen."); }
    clearInterval(iv); setGenProgress(100); setGeneratingImg(false); setGenMsg("");
  };

  const generarCopies = async () => {
    setGeneratingCopy(true);
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt, tipo, brandProfile, userId: user?.id || "", maxPropuestas: 3 }),
      });
      const data = await res.json();
      if (data.error === "limit_reached") { setError("LIMIT_REACHED"); setGeneratingCopy(false); return; }
      setCopies(data.propuestas || []);
    } catch(e) { setError("Error generando copies."); }
    setGeneratingCopy(false);
  };

  const guardarFinal = async () => {
    const copy = copies.find(c => c.id === copySeleccionado);
    if (!copy || versiones.length === 0) return;
    try {
      const imgData = versiones[versionActiva];
      const blob = await fetch("data:" + imgData.mimeType + ";base64," + imgData.image).then(r => r.blob());
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fileName = user.id + "/resultados/" + Date.now() + ".png";
        await supabase.storage.from("assets").upload(fileName, blob);
        await supabase.from("generaciones").insert({
          user_id: user.id, prompt, tipo,
          propuestas: [copy], imagen_url: fileName,
        });
      }
      setSavedFinal(true);
    } catch(e) { console.error(e); }
  };

  const steps = [
    {n:1,l:"Describe"},{n:2,l:"Referencias"},{n:3,l:"Talento"},
    {n:4,l:"Imagen"},{n:5,l:"Copy"},{n:6,l:"Arte final"}
  ];

  const StepBar = () => (
    <div style={{ display:"flex", alignItems:"center", marginBottom:24, gap:0 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, background: step > s.n ? D.purple : step === s.n ? D.purple : "rgba(255,255,255,0.08)", color: step >= s.n ? "#fff" : D.text3, boxShadow: step === s.n ? "0 0 0 3px rgba(121,80,242,0.2)" : "none" }}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span style={{ fontSize:10, color: step >= s.n ? D.purpleLight : D.text3, whiteSpace:"nowrap" }}>{s.l}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width:32, height:1, background: step > s.n ? D.purple : "rgba(255,255,255,0.08)", margin:"0 4px", marginBottom:14 }} />}
        </div>
      ))}
    </div>
  );

  const NB = { width:"100%", padding:12, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", marginBottom:8 };
  const SB = { width:"100%", padding:11, background:"rgba(255,255,255,0.04)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, cursor:"pointer" };

  return (
    <AppLayout>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px" }}>
        <h1 style={{ fontSize:20, fontWeight:500, color:D.text, marginBottom:20, letterSpacing:"-0.02em" }}>Nueva pieza</h1>
        <StepBar />

        {step === 1 && (
          <div>
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:20, marginBottom:14 }}>
              {brandProfile && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(121,80,242,0.12)", borderRadius:20, padding:"4px 12px", marginBottom:14, cursor:"pointer", border:"1px solid rgba(121,80,242,0.2)" }} onClick={() => router.push("/adn")}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:D.purpleLight, display:"inline-block" }}></span>
                  <span style={{ fontSize:11, color:D.purpleLight, fontWeight:500 }}>{brandProfile.nombre} · {brandProfile.tono} · {brandProfile.idioma}</span>
                  <span style={{ fontSize:10, color:"rgba(167,139,250,0.5)" }}>Editar →</span>
                </div>
              )}
              <label style={{ fontSize:13, color:D.text2, display:"block", marginBottom:8, fontWeight:500 }}>¿Qué quieres crear hoy?</label>
              <textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Ej: Quiero anunciar mis 3 spots de coaching 1:1 para este mes..."
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"11px 13px", fontSize:13, color:D.text, outline:"none", resize:"none", fontFamily:"Inter, sans-serif" }} />
              <div style={{ fontSize:12, color:D.text3, marginTop:12, marginBottom:8 }}>Tipo de pieza</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipo(t)}
                    style={{ padding:"8px 6px", borderRadius:8, fontSize:11.5, border: tipo===t ? "1.5px solid " + D.purple : "1px solid rgba(255,255,255,0.1)", background: tipo===t ? "rgba(121,80,242,0.12)" : "transparent", color: tipo===t ? D.purpleLight : D.text2, fontWeight: tipo===t ? 500 : 400, cursor:"pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => prompt.trim() && setStep(2)} style={{ ...NB, background: !prompt.trim() ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", cursor: !prompt.trim() ? "not-allowed" : "pointer" }}>
              Continuar → Referencias visuales
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:20, marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:4 }}>Referencias visuales</div>
              <div style={{ fontSize:12, color:D.text2, marginBottom:16 }}>Sube hasta 3 imágenes que inspiren el estilo visual de tu pieza</div>
              <input ref={refInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,3).map(f => ({ file:f, url:URL.createObjectURL(f) })); setReferencias(arr); }} />
              {referencias.length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                  {referencias.map((r,i) => (
                    <div key={i} style={{ position:"relative" }}>
                      <img src={r.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:9, display:"block", border:"1px solid rgba(255,255,255,0.1)" }} />
                      <button onClick={() => setReferencias(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:4, right:4, width:18, height:18, borderRadius:"50%", background:"#DC2626", border:"none", color:"#fff", fontSize:9, cursor:"pointer" }}>x</button>
                    </div>
                  ))}
                  {referencias.length < 3 && (
                    <div onClick={() => refInput.current.click()} style={{ aspectRatio:"1", border:"2px dashed rgba(255,255,255,0.1)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:22, color:D.text3 }}>+</div>
                  )}
                </div>
              ) : (
                <div onClick={() => refInput.current.click()} style={{ border:"2px dashed rgba(255,255,255,0.1)", borderRadius:10, padding:"28px 20px", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ fontSize:24, opacity:0.2, marginBottom:8 }}>+</div>
                  <div style={{ fontSize:13, color:D.text2, fontWeight:500 }}>Sube imágenes de referencia</div>
                  <div style={{ fontSize:11, color:D.text3, marginTop:4 }}>Estilos o composiciones que te inspiran</div>
                </div>
              )}
            </div>
            <button onClick={() => setStep(3)} style={NB}>Continuar → Talento</button>
            <button onClick={() => { setReferencias([]); setStep(3); }} style={SB}>Saltar este paso</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:12, padding:20, marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:500, color:D.text, marginBottom:4 }}>Foto de talento</div>
              <div style={{ fontSize:12, color:D.text2, marginBottom:16 }}>Sube hasta 3 fotos de personas para incluir en la imagen</div>
              <input ref={talentInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { const arr = Array.from(e.target.files).slice(0,3).map(f => ({ file:f, url:URL.createObjectURL(f) })); setTalentos(prev => [...prev,...arr].slice(0,3)); }} />
              {talentos.length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                  {talentos.map((t,i) => (
                    <div key={i} style={{ position:"relative" }}>
                      <img src={t.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:9, display:"block", border:"1.5px solid " + D.purple }} />
                      <button onClick={() => setTalentos(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:4, right:4, width:18, height:18, borderRadius:"50%", background:"#DC2626", border:"none", color:"#fff", fontSize:9, cursor:"pointer" }}>x</button>
                    </div>
                  ))}
                  {talentos.length < 3 && (
                    <div onClick={() => talentInput.current.click()} style={{ aspectRatio:"1", border:"2px dashed rgba(255,255,255,0.1)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:22, color:D.text3 }}>+</div>
                  )}
                </div>
              ) : (
                <div onClick={() => talentInput.current.click()} style={{ border:"2px dashed rgba(255,255,255,0.1)", borderRadius:10, padding:"28px 20px", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ fontSize:32, opacity:0.15, marginBottom:8 }}>◎</div>
                  <div style={{ fontSize:13, color:D.text2, fontWeight:500 }}>Sube fotos de talento</div>
                  <div style={{ fontSize:11, color:D.text3, marginTop:4 }}>La IA las incluirá en la imagen final</div>
                </div>
              )}
            </div>
            <button onClick={() => { setStep(4); generarImagen(); }} style={{ ...NB, background:"linear-gradient(135deg,#E64980,#7950F2)" }}>
              Generar imagen →
            </button>
            <button onClick={() => { setTalentos([]); setStep(4); generarImagen(); }} style={SB}>Generar sin talento</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16 }}>
              <div>
                <div style={{ background:"linear-gradient(135deg,rgba(121,80,242,0.15),rgba(230,73,128,0.1))", borderRadius:12, minHeight:280, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, position:"relative", overflow:"hidden" }}>
                  {generatingImg ? (
                    <div style={{ textAlign:"center", padding:20 }}>
                      <div style={{ fontSize:13, color:D.purpleLight, marginBottom:10 }}>{genMsg}</div>
                      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", width:200 }}>
                        <div style={{ height:"100%", width: Math.min(genProgress,95) + "%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4, transition:"width 0.5s" }} />
                      </div>
                      <div style={{ fontSize:11, color:D.text3, marginTop:8 }}>20-30 segundos</div>
                    </div>
                  ) : versiones.length > 0 ? (
                    <img src={"data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image} alt="" style={{ width:"100%", display:"block", borderRadius:12 }} />
                  ) : (
                    <div style={{ fontSize:40, opacity:0.2 }}>◉</div>
                  )}
                </div>
                {versiones.length > 0 && (
                  <div style={{ display:"flex", gap:6 }}>
                    {versiones.map((v,i) => (
                      <div key={i} onClick={() => setVersionActiva(i)}
                        style={{ width:36, height:36, borderRadius:7, overflow:"hidden", cursor:"pointer", border: versionActiva === i ? "2px solid " + D.purple : "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={"data:" + v.mimeType + ";base64," + v.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {!imgAprobada ? (
                  <>
                    <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:10, padding:14 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:D.text, marginBottom:8 }}>¿Qué quieres cambiar?</div>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4}
                        placeholder="Ej: Hazla más colorida, agrega texto con el precio..."
                        style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:12, color:D.text, outline:"none", resize:"none", fontFamily:"Inter, sans-serif", marginBottom:8 }} />
                      <button onClick={() => generarImagen(feedback)} disabled={generatingImg || !feedback.trim()}
                        style={{ width:"100%", padding:9, background: generatingImg || !feedback.trim() ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor: generatingImg ? "not-allowed" : "pointer", marginBottom:6 }}>
                        {generatingImg ? "Generando..." : "↺ Regenerar con feedback"}
                      </button>
                      {versiones.length > 0 && (
                        <button onClick={() => { setImgAprobada(true); generarCopies(); setStep(5); }}
                          style={{ width:"100%", padding:9, background:"rgba(64,192,87,0.12)", border:"1px solid rgba(64,192,87,0.3)", color:"#86EFAC", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                          ✓ Aprobar imagen → Copy
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ background:"rgba(64,192,87,0.08)", border:"1px solid rgba(64,192,87,0.2)", borderRadius:10, padding:14, fontSize:12, color:"#86EFAC" }}>
                    ✓ Imagen aprobada
                  </div>
                )}
                {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:10, fontSize:11, color:"#FCA5A5" }}>{error}</div>}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            {generatingCopy ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:D.text2 }}>
                <div style={{ fontSize:14, marginBottom:12 }}>Generando copies con IA...</div>
                <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", maxWidth:200, margin:"0 auto" }}>
                  <div style={{ height:"100%", width:"60%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:4, animation:"none" }} />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13, color:D.text2, marginBottom:14 }}>Selecciona y edita tu copy favorito</div>
                {copies.map(c => (
                  <div key={c.id} style={{ background: copySeleccionado===c.id ? "rgba(121,80,242,0.08)" : D.bg3, border: copySeleccionado===c.id ? "1.5px solid " + D.purple : "1px solid " + D.border, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
                    {editingCopy === c.id ? (
                      <div>
                        <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={6}
                          style={{ width:"100%", background:"rgba(121,80,242,0.06)", border:"1px solid " + D.purple, borderRadius:8, padding:"10px 12px", fontSize:12, color:D.text, outline:"none", resize:"none", fontFamily:"Inter, sans-serif", marginBottom:8 }} />
                        <button onClick={() => { const updated = copies.map(x => x.id===c.id ? { ...x, hook: editedText.split("\n")[0], copy: editedText } : x); setCopies(updated); setEditingCopy(null); }}
                          style={{ padding:"5px 12px", background:D.purple, color:"#fff", border:"none", borderRadius:6, fontSize:11, cursor:"pointer" }}>Guardar</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:D.text, marginBottom:5 }}>{c.hook}</div>
                        <div style={{ fontSize:12, color:D.text2, lineHeight:1.6, marginBottom:5 }}>{c.copy}</div>
                        <div style={{ fontSize:12, color:D.purpleLight, fontWeight:500, marginBottom:5 }}>{c.cta}</div>
                        {c.hashtags && <div style={{ fontSize:11, color:"rgba(167,139,250,0.55)", marginBottom:10 }}>{c.hashtags}</div>}
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => { setCopySeleccionado(c.id); const full = c.hook + "\n\n" + c.copy + "\n\n" + c.cta + (c.hashtags ? "\n\n" + c.hashtags : ""); setEditedText(full); }}
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
                  <button onClick={() => { guardarFinal(); setStep(6); }}
                    style={{ width:"100%", padding:13, background:"linear-gradient(135deg,#40C057,#2F9E44)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", marginTop:8 }}>
                    Guardar arte final →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ width:64, height:64, background:"rgba(64,192,87,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>✓</div>
            <h2 style={{ fontSize:22, fontWeight:500, color:D.text, marginBottom:8 }}>Arte final guardado</h2>
            <p style={{ fontSize:14, color:D.text2, marginBottom:28 }}>Tu pieza está en la biblioteca y puedes editarla cuando quieras.</p>
            {versiones.length > 0 && (
              <img src={"data:" + versiones[versionActiva].mimeType + ";base64," + versiones[versionActiva].image} alt="" style={{ maxWidth:280, borderRadius:14, display:"block", margin:"0 auto 24px", border:"1px solid rgba(255,255,255,0.1)" }} />
            )}
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => { setStep(1); setPrompt(""); setTipo("Comercial"); setReferencias([]); setTalentos([]); setVersiones([]); setCopies([]); setCopySeleccionado(null); setImgAprobada(false); setSavedFinal(false); }}
                style={{ padding:"10px 20px", background:"rgba(255,255,255,0.06)", color:D.text2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                Nueva pieza
              </button>
              <button onClick={() => router.push("/biblioteca")}
                style={{ padding:"10px 20px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                Ver biblioteca →
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}