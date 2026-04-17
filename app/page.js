"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Landing() {
  const router = useRouter();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.push("/crear");
    });
  }, []);

  const setLanguage = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const en = lang === "en";

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A1A", fontFamily:"Inter, sans-serif", color:"#fff", overflowX:"hidden" }}>

      {/* ═══ AMBIENT GLOWS ═══ */}
      <div style={{ position:"fixed", top:"-300px", left:"50%", transform:"translateX(-50%)", width:800, height:800, background:"radial-gradient(circle, rgba(121,80,242,0.12) 0%, transparent 60%)", filter:"blur(80px)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-200px", right:"-100px", width:500, height:500, background:"radial-gradient(circle, rgba(230,73,128,0.06) 0%, transparent 60%)", filter:"blur(60px)", pointerEvents:"none", zIndex:0 }} />

      {/* ═══ NAV ═══ */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", height:64, position:"sticky", top:0, zIndex:100, background:"rgba(10,10,26,0.8)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>Ai</div>
          <span style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.03em" }}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={() => router.push("/pricing")} style={{ padding:"6px 14px", background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"Inter" }}>{en ? "Pricing" : "Precios"}</button>
          <button onClick={() => router.push("/contacto")} style={{ padding:"6px 14px", background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"Inter" }}>{en ? "Contact" : "Contacto"}</button>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:7, padding:2, gap:1, marginLeft:8 }}>
            <button onClick={() => setLanguage("en")} style={{ padding:"4px 9px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", background: en ? "#fff" : "transparent", border:"none", color: en ? "#0A0A0A" : "rgba(255,255,255,0.4)", fontFamily:"Inter" }}>EN</button>
            <button onClick={() => setLanguage("es")} style={{ padding:"4px 9px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", background: !en ? "#fff" : "transparent", border:"none", color: !en ? "#0A0A0A" : "rgba(255,255,255,0.4)", fontFamily:"Inter" }}>ES</button>
          </div>
          <button onClick={() => router.push("/login")} style={{ padding:"7px 16px", background:"none", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:500, cursor:"pointer", marginLeft:6, fontFamily:"Inter" }}>{en ? "Log in" : "Entrar"}</button>
          <button className="btn-primary" onClick={() => router.push("/login?tab=register")} style={{ padding:"8px 18px", background:"#7950F2", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Inter", boxShadow:"0 2px 12px rgba(121,80,242,0.4)" }}>{en ? "Start free" : "Empieza gratis"}</button>
        </div>
      </nav>

      {/* ═══ HERO — CENTERED ═══ */}
      <section style={{ textAlign:"center", padding:"100px 24px 60px", position:"relative", zIndex:1 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:100, padding:"6px 16px 6px 8px", marginBottom:32 }}>
          <span style={{ background:"#7950F2", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>NEW</span>
          <span style={{ fontSize:13, color:"#A78BFA", fontWeight:500 }}>{en ? "Art Director AI — visual brief + validation" : "Art Director IA — brief visual + validación"}</span>
        </div>

        <h1 style={{ fontSize:64, fontWeight:800, lineHeight:1.05, letterSpacing:"-0.045em", maxWidth:800, margin:"0 auto 24px", background:"linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.65) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          {en ? "Your brand voice," : "Tu voz de marca,"}
          <br />
          {en ? "powered by AI" : "potenciada por IA"}
        </h1>

        <p style={{ fontSize:18, color:"rgba(255,255,255,0.5)", lineHeight:1.7, maxWidth:520, margin:"0 auto 40px" }}>
          {en
            ? "Generate Instagram posts that sound exactly like you — copy, image, and everything in between. In 30 seconds."
            : "Genera posts de Instagram que suenan exactamente como tú — copy, imagen, y todo lo demás. En 30 segundos."}
        </p>

        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:16 }}>
          <button className="btn-primary" onClick={() => router.push("/login?tab=register")} style={{ padding:"15px 36px", background:"#7950F2", border:"none", borderRadius:12, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"Inter", boxShadow:"0 4px 24px rgba(121,80,242,0.5)", transition:"all 0.2s" }}>
            {en ? "Start creating — it's free" : "Empieza a crear — es gratis"}
          </button>
        </div>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>{en ? "No credit card · 20 free generations" : "Sin tarjeta · 20 generaciones gratis"}</p>
      </section>

      {/* ═══ PRODUCT DEMO ═══ */}
      <section style={{ padding:"0 40px 80px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:900, margin:"0 auto", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", background:"linear-gradient(180deg, rgba(22,22,45,0.8) 0%, rgba(10,10,26,0.9) 100%)", padding:2, boxShadow:"0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(121,80,242,0.08)" }}>
          <div style={{ background:"#111128", borderRadius:18, padding:"24px 32px" }}>
            {/* Fake browser bar */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }} />
              <div style={{ width:10, height:10, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }} />
              <div style={{ width:10, height:10, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }} />
              <div style={{ flex:1, height:24, background:"rgba(255,255,255,0.04)", borderRadius:6, marginLeft:12, display:"flex", alignItems:"center", paddingLeft:12 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>aistudiobrand.com/crear</span>
              </div>
            </div>
            {/* Product mockup */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div>
                <div style={{ background:"linear-gradient(135deg,#7950F2 0%,#E64980 50%,#F59E0B 100%)", borderRadius:14, aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:48, opacity:0.3, marginBottom:4 }}>✦</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>AI Generated</div>
                  </div>
                  <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:"#40C057", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:"#fff" }}>✓</div>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.8)", fontWeight:500 }}>{en ? "Quality validated" : "Calidad validada"}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:16, flex:1 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#A78BFA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Hook</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"#fff", lineHeight:1.4, marginBottom:8 }}>Mami, ya no más stress!</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6, marginBottom:8 }}>{en ? "Our coaching program is literally a lifesaver para todas las mujeres que..." : "Nuestro programa de coaching es literally a lifesaver para todas las mujeres que..."}</div>
                  <div style={{ fontSize:12, color:"#A78BFA", fontWeight:600 }}>DM con LISTA y te cuento todo</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ flex:1, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#A78BFA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>{en ? "Type" : "Tipo"}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>Comercial</div>
                  </div>
                  <div style={{ flex:1, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#A78BFA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>{en ? "Language" : "Idioma"}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>Spanglish</div>
                  </div>
                  <div style={{ flex:1, background:"rgba(64,192,87,0.1)", border:"1px solid rgba(64,192,87,0.2)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#86EFAC", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Status</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#86EFAC" }}>{en ? "Saved" : "Guardado"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF STRIP ═══ */}
      <section style={{ borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"28px 40px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", justifyContent:"center", gap:48 }}>
          {[
            { n: "30s", l: en ? "to generate a post" : "para generar un post" },
            { n: "3", l: en ? "steps to create" : "pasos para crear" },
            { n: "ES+EN", l: en ? "bicultural content" : "contenido bicultural" },
            { n: "20", l: en ? "free generations" : "generaciones gratis" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", background:"linear-gradient(180deg,#fff 0%,rgba(255,255,255,0.5) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{s.n}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding:"100px 40px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <div style={{ display:"inline-block", background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.15)", borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:600, color:"#A78BFA", letterSpacing:"0.02em", marginBottom:16 }}>{en ? "How it works" : "Cómo funciona"}</div>
            <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-0.04em", background:"linear-gradient(180deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{en ? "From idea to post in three steps" : "De la idea al post en tres pasos"}</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {(en ? [
              { n:"01", t:"Define your brand DNA", d:"Upload screenshots, connect your web. Our AI analyzes your style, tone, and audience in seconds.", icon:"◉" },
              { n:"02", t:"Describe your idea", d:"Write what you want to say. Choose the type, format, and language. One sentence is enough.", icon:"✦" },
              { n:"03", t:"Get your post", d:"Art Director AI creates a visual brief, generates the image, validates quality, and writes 3 copy options.", icon:"◈" },
            ] : [
              { n:"01", t:"Define tu ADN de marca", d:"Sube screenshots, conecta tu web. Nuestra IA analiza tu estilo, tono y audiencia en segundos.", icon:"◉" },
              { n:"02", t:"Describe tu idea", d:"Escribe qué quieres comunicar. Elige tipo, formato e idioma. Una frase es suficiente.", icon:"✦" },
              { n:"03", t:"Recibe tu post", d:"Art Director IA crea un brief visual, genera la imagen, valida calidad, y escribe 3 opciones de copy.", icon:"◈" },
            ]).map((s, i) => (
              <div key={i} style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"32px 28px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-20, right:-10, fontSize:100, fontWeight:900, color:"rgba(121,80,242,0.04)", letterSpacing:"-0.05em", lineHeight:1 }}>{s.n}</div>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(121,80,242,0.12)", border:"1px solid rgba(121,80,242,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#A78BFA", marginBottom:20 }}>{s.icon}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>{s.t}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.65 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENTO FEATURES ═══ */}
      <section style={{ padding:"0 40px 100px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-block", background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.15)", borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:600, color:"#A78BFA", letterSpacing:"0.02em", marginBottom:16 }}>{en ? "Features" : "Funcionalidades"}</div>
            <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-0.04em", background:"linear-gradient(180deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{en ? "Built for creators who mean business" : "Hecho para creadoras que van en serio"}</h2>
          </div>
          {/* Bento grid — 2 big + 2 small top, 2 small + 1 big bottom */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {/* Big card — Brand DNA */}
            <div className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"36px 28px", gridRow:"span 2", display:"flex", flexDirection:"column", justifyContent:"space-between", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", cursor:"pointer" }}>
              <div>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(121,80,242,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#A78BFA", marginBottom:20 }}>◉</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>{en ? "Your brand DNA" : "Tu ADN de marca"}</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.65 }}>{en ? "AI analyzes your Instagram, TikTok, and website to extract your visual style, tone, colors, and personality. Every post sounds like you." : "La IA analiza tu Instagram, TikTok y web para extraer tu estilo visual, tono, colores y personalidad. Cada post suena como tú."}</div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:24 }}>
                {["#7950F2","#E64980","#F59E0B","#40C057"].map((c,i) => (
                  <div key={i} style={{ width:24, height:24, borderRadius:6, background:c, opacity:0.7 }} />
                ))}
                <div style={{ width:24, height:24, borderRadius:6, border:"1px dashed rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"rgba(255,255,255,0.3)" }}>+</div>
              </div>
            </div>
            {/* Small card — Speed */}
            <div className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"28px 24px", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", cursor:"pointer" }}>
              <div style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.04em", background:"linear-gradient(135deg,#7950F2,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:8 }}>30s</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>{en ? "Generate in seconds" : "Genera en segundos"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>{en ? "One sentence → image + 3 copy options" : "Una frase → imagen + 3 opciones de copy"}</div>
            </div>
            {/* Small card — Bicultural */}
            <div className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"28px 24px", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", cursor:"pointer" }}>
              <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                {["ES","EN","MIX"].map((l,i) => (
                  <span key={i} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700, background: i===2 ? "rgba(121,80,242,0.15)" : "rgba(255,255,255,0.06)", color: i===2 ? "#A78BFA" : "rgba(255,255,255,0.5)", border: i===2 ? "1px solid rgba(121,80,242,0.3)" : "1px solid rgba(255,255,255,0.06)" }}>{l}</span>
                ))}
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>{en ? "Bicultural by design" : "Bicultural por diseño"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>{en ? "Spanish, English, or Spanglish — your voice" : "Español, inglés o Spanglish — tu voz"}</div>
            </div>
          </div>
          {/* Second row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
            <div className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"28px 24px", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", cursor:"pointer" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(64,192,87,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#86EFAC", marginBottom:16 }}>◈</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>{en ? "Your library" : "Tu biblioteca"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>{en ? "Every piece auto-saved. Filter, reuse, remix." : "Cada pieza se guarda automáticamente. Filtra, reutiliza, remezcla."}</div>
            </div>
            <div className="card-hover" style={{ background:"linear-gradient(135deg,rgba(121,80,242,0.15),rgba(230,73,128,0.08))", border:"1px solid rgba(121,80,242,0.15)", borderRadius:20, padding:"28px 24px", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", cursor:"pointer" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(121,80,242,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#A78BFA", marginBottom:16 }}>✦</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>{en ? "Art Director AI" : "Art Director IA"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>{en ? "Claude creates the brief, Gemini renders, Claude validates. You only see approved results." : "Claude crea el brief, Gemini renderiza, Claude valida. Solo ves resultados aprobados."}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section style={{ padding:"100px 40px", textAlign:"center", position:"relative", zIndex:1, background:"linear-gradient(180deg, #0A0A1A 0%, #16162d 50%, #0A0A1A 100%)" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontSize:40, fontWeight:800, letterSpacing:"-0.04em", marginBottom:16, background:"linear-gradient(180deg,#fff,rgba(255,255,255,0.65))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {en ? "Your content, your voice, your brand." : "Tu contenido, tu voz, tu marca."}
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.45)", marginBottom:36, lineHeight:1.7 }}>
            {en ? "Join creators who stopped outsourcing their voice." : "Únete a las creadoras que dejaron de tercerizar su voz."}
          </p>
          <button className="btn-primary" onClick={() => router.push("/login?tab=register")} style={{ padding:"16px 40px", background:"#7950F2", border:"none", borderRadius:14, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"Inter", boxShadow:"0 4px 30px rgba(121,80,242,0.5)", transition:"all 0.2s" }}>
            {en ? "Start creating — it's free" : "Empieza a crear — es gratis"}
          </button>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", marginTop:14 }}>{en ? "No credit card required · Cancel anytime" : "Sin tarjeta de crédito · Cancela cuando quieras"}</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding:"24px 40px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:22, height:22, background:"#7950F2", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>Ai</div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>AiStudioBrand · {en ? "Content that sounds like you" : "Contenido que suena como tú"}</span>
        </div>
        <div style={{ display:"flex", gap:16 }}>
          <button onClick={() => router.push("/terminos")} style={{ fontSize:11, color:"rgba(255,255,255,0.25)", background:"none", border:"none", cursor:"pointer" }}>{en ? "Terms" : "Términos"}</button>
          <button onClick={() => router.push("/privacidad")} style={{ fontSize:11, color:"rgba(255,255,255,0.25)", background:"none", border:"none", cursor:"pointer" }}>{en ? "Privacy" : "Privacidad"}</button>
        </div>
      </footer>
    </div>
  );
}
