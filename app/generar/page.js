"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const TIPOS = ["Comercial", "Branding", "Educativo", "Storytelling", "Posicionamiento"];

export default function Generar() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [tipo, setTipo] = useState("Comercial");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editedCopy, setEditedCopy] = useState("");
  const [referencias, setReferencias] = useState([]);
  const [talento, setTalento] = useState(null);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [brandProfile, setBrandProfile] = useState(null);
  const [error, setError] = useState("");
  const [skippedRef, setSkippedRef] = useState(false);
  const [skippedTalent, setSkippedTalent] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genMessage, setGenMessage] = useState("");
  const refInput = useRef(null);
  const talentInput = useRef(null);

  useEffect(() => {
    const bp = localStorage.getItem("brandProfile");
    if (bp) setBrandProfile(JSON.parse(bp));
  }, []);

  const generarCopy = async () => {
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
      setError("Error generando copy. Intenta de nuevo.");
    }
    setLoading(false);
  };

  const selectProposal = (p) => {
    setSelected(p.id);
    setEditedCopy(p.hook + "\n\n" + p.copy + "\n\n" + p.cta);
  };

  const handleReferencias = (files) => {
    const arr = Array.from(files).slice(0, 3).map(f => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setReferencias(arr);
  };

  const handleTalento = (file) => {
    setTalento({ file, url: URL.createObjectURL(file) });
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const generarImagen = async () => {
    const prop = proposals.find(p => p.id === selected);
    if (!prop) return;
    setGeneratingImg(true);
    setError("");
    setGenProgress(0);
    const messages = [
      "Analizando tu marca...",
      "Procesando referencias visuales...",
      "Componiendo la imagen...",
      "Aplicando estilo de marca...",
      "Finalizando detalles...",
    ];
    let msgIdx = 0;
    setGenMessage(messages[0]);
    const progressInterval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
      msgIdx = Math.min(msgIdx + 1, messages.length - 1);
      setGenMessage(messages[msgIdx]);
    }, 3000);
    const clearProgress = () => clearInterval(progressInterval);
    try {
      const refBase64 = await Promise.all(referencias.map(async r => ({
        data: await toBase64(r.file),
        mimeType: r.file.type,
      })));
      const talBase64 = talento ? {
        data: await toBase64(talento.file),
        mimeType: talento.file.type,
      } : null;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prop.hook + ". " + prop.copy,
          brandProfile,
          referencias: refBase64,
          talento: talBase64,
          editedCopy,
        }),
      });
      const data = await res.json();
      if (data.image) {
        setResultado(data);
        setStep(4);
        await saveToLibrary(prop, data);
      } else {
        setError("No se pudo generar la imagen.");
      }
    } catch (e) {
      setError("Error generando imagen.");
    }
    clearProgress();
    setGenProgress(100);
    setGeneratingImg(false);
    setGenProgress(0);
    setGenMessage("");
  };

  const saveToLibrary = async (prop, imgData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const blob = await fetch("data:" + imgData.mimeType + ";base64," + imgData.image).then(r => r.blob());
      const fileName = user.id + "/resultados/" + Date.now() + ".png";
      await supabase.storage.from("assets").upload(fileName, blob);
      await supabase.from("generaciones").insert({
        user_id: user.id,
        prompt,
        tipo,
        propuestas: proposals,
        imagen_url: fileName,
      });
      setSavedToLibrary(true);
    } catch (e) {
      console.log("Error saving:", e);
    }
  };

  const nav = { display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid #F0F0F0", background:"#fff", position:"sticky", top:0, zIndex:100 };
  const logoIcon = { width:32, height:32, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 };
  const nextBtn = { width:"100%", padding:13, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginBottom:10 };
  const skipBtn = { width:"100%", padding:12, background:"#fff", color:"#888", border:"1.5px solid #E0E0E0", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" };

  const StepBar = () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 24px 0", gap:0 }}>
      {[
        { n:1, label:"Copy" },
        { n:2, label:"Referencias" },
        { n:3, label:"Talento" },
        { n:4, label:"Resultado" },
      ].map((s, i) => (
        <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:500, background: step > s.n ? "#7950F2" : step === s.n ? "#7950F2" : "#F0F0F0", color: step >= s.n ? "#fff" : "#999", boxShadow: step === s.n ? "0 0 0 3px #EDE9FE" : "none" }}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span style={{ fontSize:12, fontWeight:500, color: step >= s.n ? "#7950F2" : "#bbb" }}>{s.label}</span>
          </div>
          {i < 3 && <div style={{ width:32, height:1, background: step > s.n ? "#7950F2" : "#E0E0E0", margin:"0 8px" }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#FAFAFA", fontFamily:"Inter, sans-serif" }}>
      <nav style={nav}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={logoIcon}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:"#0A0A0A" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:8, marginLeft:"auto", alignItems:"center" }}>
          <button onClick={() => router.push("/biblioteca")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:"#555", cursor:"pointer", background:"none", border:"none" }}>Mi biblioteca</button>
          <button onClick={() => router.push("/brand-profile")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:"#555", cursor:"pointer", background:"none", border:"none" }}>Brand Profile</button>
        </div>
      </nav>

      <StepBar />

      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 24px 48px" }}>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:"#0A0A0A", marginBottom:4, letterSpacing:"-0.02em" }}>Genera tu copy</h1>
            <p style={{ fontSize:13.5, color:"#888", marginBottom:20 }}>Describe tu idea y selecciona o edita una de las 5 propuestas</p>

            <div style={{ background:"#fff", border:"1.5px solid #E8E8E8", borderRadius:14, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", marginBottom:16 }}>
              {brandProfile && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F3F0FF", borderRadius:20, padding:"5px 12px", marginBottom:14, cursor:"pointer" }} onClick={() => router.push("/brand-profile")}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#7950F2", display:"inline-block" }}></span>
                  <span style={{ fontSize:12, color:"#6741D9", fontWeight:500 }}>{brandProfile.nombre} · {brandProfile.tono} · {brandProfile.idioma}</span>
                </div>
              )}
              <label style={{ fontSize:13, fontWeight:500, color:"#333", display:"block", marginBottom:8 }}>¿Qué quieres comunicar?</label>
              <textarea
                rows={3}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ej: Quiero anunciar mis 3 spots de coaching 1:1 para este mes..."
                style={{ width:"100%", border:"1.5px solid #E8E8E8", borderRadius:9, padding:"11px 13px", fontSize:14, fontFamily:"Inter, sans-serif", background:"#FAFAFA", color:"#0A0A0A", outline:"none", resize:"none" }}
              />
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipo(t)} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, border: tipo===t ? "1.5px solid #7950F2" : "1.5px solid #E0E0E0", color: tipo===t ? "#6741D9" : "#666", background: tipo===t ? "#F3F0FF" : "#fff", fontWeight: tipo===t ? 500 : 400, cursor:"pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={generarCopy}
                disabled={!prompt.trim() || loading}
                style={{ width:"100%", marginTop:14, padding:12, background: !prompt.trim() || loading ? "#C5B8FB" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:500, cursor: !prompt.trim() || loading ? "not-allowed" : "pointer", fontFamily:"Inter, sans-serif" }}
              >
                {loading ? "Generando con IA..." : "✦ Generar 5 versiones"}
              </button>
            </div>

            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:9, padding:12, color:"#DC2626", fontSize:13, marginBottom:14 }}>{error}</div>}

            {proposals.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:500, color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Selecciona y edita si quieres</div>
                {proposals.map(p => (
                  <div key={p.id} onClick={() => selectProposal(p)} style={{ background:"#fff", border: selected===p.id ? "1.5px solid #7950F2" : "1.5px solid #EAEAEA", borderRadius:12, padding:"14px 16px", marginBottom:8, cursor:"pointer", boxShadow: selected===p.id ? "0 0 0 3px #F3F0FF" : "none" }}>
                    <div style={{ fontSize:10, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Propuesta {p.id}</div>
                    <div style={{ fontSize:14, fontWeight:500, color:"#0A0A0A", marginBottom:4 }}>{p.hook}</div>
                    <div style={{ fontSize:12.5, color:"#777", lineHeight:1.55, marginBottom:4 }}>{p.copy}</div>
                    <div style={{ fontSize:12, color:"#7950F2", fontWeight:500 }}>{p.cta}</div>
                  </div>
                ))}

                {selected && (
                  <div style={{ marginTop:4 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:"#555", marginBottom:6 }}>Edita el copy si quieres ajustar algo:</div>
                    <textarea
                      rows={5}
                      value={editedCopy}
                      onChange={e => setEditedCopy(e.target.value)}
                      style={{ width:"100%", border:"1.5px solid #7950F2", borderRadius:9, padding:"11px 13px", fontSize:13, fontFamily:"Inter, sans-serif", background:"#FDFCFF", color:"#0A0A0A", outline:"none", resize:"none", marginBottom:12 }}
                    />
                    <button onClick={() => setStep(2)} style={nextBtn}>
                      Continuar → Agregar referencias
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:"#0A0A0A", marginBottom:4, letterSpacing:"-0.02em" }}>Referencias visuales</h1>
            <p style={{ fontSize:13.5, color:"#888", marginBottom:24 }}>Sube fotos de inspiración para guiar el estilo de la imagen — o salta este paso</p>

            <input ref={refInput} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleReferencias(e.target.files)} />

            {skippedRef ? (
              <div style={{ border:"2px dashed #F0F0F0", borderRadius:14, padding:"36px 20px", textAlign:"center", marginBottom:16, background:"#F9F9F9", opacity:0.5 }}>
                <div style={{ fontSize:28, opacity:0.2, marginBottom:10 }}>+</div>
                <div style={{ fontSize:14, color:"#bbb", fontWeight:500 }}>Paso omitido</div>
              </div>
            ) : (
              <div
                onClick={() => refInput.current.click()}
                style={{ border:"2px dashed #E0E0E0", borderRadius:14, padding:"36px 20px", textAlign:"center", cursor:"pointer", marginBottom:16, background:"#fff", transition:"all 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#9775FA"; e.currentTarget.style.background="#FDFCFF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#E0E0E0"; e.currentTarget.style.background="#fff"; }}
              >
                <div style={{ fontSize:28, opacity:0.25, marginBottom:10 }}>+</div>
                <div style={{ fontSize:14, color:"#555", fontWeight:500 }}>Sube imágenes de referencia</div>
                <div style={{ fontSize:12, color:"#bbb", marginTop:4 }}>Estilos, paletas o composiciones que te inspiran · Máx. 3 fotos</div>
              </div>
            )}

            {referencias.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                {referencias.map((r, i) => (
                  <div key={i} style={{ borderRadius:10, overflow:"hidden", border:"1.5px solid #EAEAEA" }}>
                    <img src={r.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep(3)} style={nextBtn}>
              {referencias.length > 0 ? "Continuar → Agregar talento" : "Continuar → Agregar talento"}
            </button>
            <button onClick={() => { setSkippedRef(true); setReferencias([]); setStep(3); }} style={skipBtn}>Saltar este paso</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:"#0A0A0A", marginBottom:4, letterSpacing:"-0.02em" }}>Foto de talento</h1>
            <p style={{ fontSize:13.5, color:"#888", marginBottom:24 }}>Sube una foto tuya o de una persona para incluirla en la imagen — o salta este paso</p>

            <input ref={talentInput} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleTalento(e.target.files[0])} />

            {skippedTalent ? (
              <div style={{ border:"2px dashed #F0F0F0", borderRadius:14, padding:"48px 20px", textAlign:"center", marginBottom:16, background:"#F9F9F9", opacity:0.5 }}>
                <div style={{ fontSize:36, opacity:0.2, marginBottom:12 }}>◎</div>
                <div style={{ fontSize:14, color:"#bbb", fontWeight:500 }}>Paso omitido</div>
              </div>
            ) : talento ? (
              <div style={{ marginBottom:16 }}>
                <div style={{ borderRadius:14, overflow:"hidden", border:"1.5px solid #7950F2", marginBottom:10, maxWidth:280, margin:"0 auto 12px" }}>
                  <img src={talento.url} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                </div>
                <button onClick={() => setTalento(null)} style={{ display:"block", margin:"0 auto", padding:"7px 16px", background:"none", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:12, color:"#888", cursor:"pointer" }}>
                  Cambiar foto
                </button>
              </div>
            ) : (
              <div
                onClick={() => talentInput.current.click()}
                style={{ border:"2px dashed #E0E0E0", borderRadius:14, padding:"48px 20px", textAlign:"center", cursor:"pointer", marginBottom:16, background:"#fff" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#9775FA"; e.currentTarget.style.background="#FDFCFF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#E0E0E0"; e.currentTarget.style.background="#fff"; }}
              >
                <div style={{ fontSize:36, opacity:0.2, marginBottom:12 }}>◎</div>
                <div style={{ fontSize:14, color:"#555", fontWeight:500 }}>Sube una foto tuya o de tu equipo</div>
                <div style={{ fontSize:12, color:"#bbb", marginTop:4 }}>La IA la usará como referencia para la imagen final</div>
              </div>
            )}

            <button
              onClick={generarImagen}
              disabled={generatingImg}
              style={{ ...nextBtn, background: generatingImg ? "#C5B8FB" : "linear-gradient(135deg,#E64980,#7950F2)", cursor: generatingImg ? "not-allowed" : "pointer" }}
            >
              {generatingImg ? "Generando imagen con IA..." : "Generar imagen final →"}
            </button>
            <button onClick={() => { setSkippedTalent(true); setTalento(null); generarImagen(); }} disabled={generatingImg} style={{ ...skipBtn, cursor: generatingImg ? "not-allowed" : "pointer" }}>
              {generatingImg ? "Generando..." : "Generar sin foto de talento"}
            </button>

            {generatingImg && (
              <div style={{ marginTop:20, background:"#fff", border:"1.5px solid #EDE9FE", borderRadius:12, padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:13, color:"#6741D9", fontWeight:500 }}>{genMessage}</span>
                  <span style={{ fontSize:13, color:"#9775FA", fontWeight:500 }}>{Math.round(Math.min(genProgress, 95))}%</span>
                </div>
                <div style={{ height:6, background:"#EDE9FE", borderRadius:6, overflow:"hidden" }}>
                  <div style={{ height:"100%", width: Math.min(genProgress, 95) + "%", background:"linear-gradient(90deg,#7950F2,#4C6EF5)", borderRadius:6, transition:"width 0.5s ease" }} />
                </div>
                <div style={{ fontSize:11.5, color:"#bbb", marginTop:8, textAlign:"center" }}>Gemini esta procesando tu imagen · Esto puede tardar 20-30 segundos</div>
              </div>
            )}

            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:9, padding:12, color:"#DC2626", fontSize:13, marginTop:12 }}>{error}</div>}
          </div>
        )}

        {step === 4 && resultado && (
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:"#0A0A0A", marginBottom:4, letterSpacing:"-0.02em" }}>Resultado final</h1>
            <p style={{ fontSize:13.5, color:"#888", marginBottom:20 }}>Tu pieza está lista para publicar</p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
              <div>
                <img
                  src={"data:" + resultado.mimeType + ";base64," + resultado.image}
                  alt="Imagen generada"
                  style={{ width:"100%", borderRadius:14, display:"block", border:"1.5px solid #EAEAEA" }}
                />
                <button
                  onClick={() => { const a = document.createElement("a"); a.href = "data:" + resultado.mimeType + ";base64," + resultado.image; a.download = "aistudiobrand.png"; a.click(); }}
                  style={{ width:"100%", padding:11, background:"#F5F5F5", color:"#333", border:"1.5px solid #E0E0E0", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer", marginTop:10, fontFamily:"Inter, sans-serif" }}
                >
                  Descargar imagen
                </button>
              </div>
              <div>
                <div style={{ background:"#fff", border:"1.5px solid #EAEAEA", borderRadius:12, padding:18, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", marginBottom:12 }}>
                  <div style={{ fontSize:10, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Copy final</div>
                  <div style={{ fontSize:13, color:"#333", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{editedCopy}</div>
                </div>

                {savedToLibrary && (
                  <div style={{ background:"#F0FFF4", border:"1px solid #86EFAC", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"#166534", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                    ✓ Guardado en tu biblioteca de resultados
                  </div>
                )}

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setStep(1); setProposals([]); setSelected(null); setPrompt(""); setReferencias([]); setTalento(null); setResultado(null); setSavedToLibrary(false); setSkippedRef(false); setSkippedTalent(false); }} style={{ flex:1, padding:10, border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background:"#fff", color:"#333", fontFamily:"Inter, sans-serif" }}>
                    Nueva pieza
                  </button>
                  <button onClick={() => router.push("/biblioteca")} style={{ flex:1, padding:10, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background:"#7950F2", color:"#fff", fontFamily:"Inter, sans-serif" }}>
                    Ver biblioteca
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}