"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Landing() {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.push("/crear");
    });
  }, []);

  const setLanguage = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const t = {
    badge: lang === "en" ? "AI that learns your brand" : "IA que aprende tu marca",
    title1: lang === "en" ? "Content that sounds" : "Contenido que suena",
    title2: lang === "en" ? "exactly like you" : "exactamente como tú",
    sub: lang === "en" ? "AiStudioBrand learns your brand DNA and generates Instagram content in seconds — aligned to your style, tone and bicultural audience." : "AiStudioBrand aprende el ADN de tu marca y genera contenido para Instagram en segundos — alineado a tu estilo, tono y audiencia bicultural.",
    btn1: lang === "en" ? "Start free →" : "Empieza gratis →",
    btn2: lang === "en" ? "Try the generator" : "Probar el generador",
    note: lang === "en" ? "20 free generations · No credit card required" : "20 generaciones gratis · Sin tarjeta de crédito",
    stats: [
      { num:"3", label: lang === "en" ? "steps to create" : "pasos para crear" },
      { num:"5x", label: lang === "en" ? "faster" : "más rápido" },
      { num:"ES+EN", label: "bicultural" },
    ],
    featBadge: lang === "en" ? "Features" : "Funcionalidades",
    featTitle: lang === "en" ? "Everything you need to scale" : "Todo lo que necesitas para escalar",
    featSub: lang === "en" ? "Designed for bicultural creators who want to produce professional content without depending on a team." : "Diseñado para creadoras biculturales que quieren producir contenido profesional sin depender de un equipo.",
    features: lang === "en" ? [
      { icon:"◉", color:"#F3F0FF", tc:"#7950F2", title:"Learns your brand", desc:"Analyzes your Instagram and assets to understand your visual style, tone and audience automatically." },
      { icon:"✦", color:"#F0FFF4", tc:"#16A34A", title:"Generates in seconds", desc:"Write your idea in one sentence and get 5 copy + image proposals aligned to your brand." },
      { icon:"⬚", color:"#FFF7ED", tc:"#EA580C", title:"Results library", desc:"Every generated piece is automatically saved for reuse in future creations." },
      { icon:"◫", color:"#FDF2F8", tc:"#DB2777", title:"Content calendar", desc:"Define a campaign and get a complete weekly calendar generated automatically." },
      { icon:"◈", color:"#EFF6FF", tc:"#2563EB", title:"Analytics & insights", desc:"Identify what content works best and feed future generations with that data." },
      { icon:"◎", color:"#F3F0FF", tc:"#7950F2", title:"Bicultural by design", desc:"Spanish, English or Spanglish. Your dual identity is your competitive advantage." },
    ] : [
      { icon:"◉", color:"#F3F0FF", tc:"#7950F2", title:"Aprende tu marca", desc:"Analiza tu Instagram y assets para entender tu estilo visual, tono y audiencia automáticamente." },
      { icon:"✦", color:"#F0FFF4", tc:"#16A34A", title:"Genera en segundos", desc:"Escribe tu idea en una frase y recibe 5 propuestas de copy + imagen alineadas a tu marca." },
      { icon:"⬚", color:"#FFF7ED", tc:"#EA580C", title:"Biblioteca de resultados", desc:"Cada pieza generada se guarda automáticamente para reutilizar en futuras creaciones." },
      { icon:"◫", color:"#FDF2F8", tc:"#DB2777", title:"Calendario de contenido", desc:"Define una campaña y obtén un calendario semanal completo generado automáticamente." },
      { icon:"◈", color:"#EFF6FF", tc:"#2563EB", title:"Analytics e insights", desc:"Identifica qué contenido funciona mejor y alimenta futuras generaciones con esos datos." },
      { icon:"◎", color:"#F3F0FF", tc:"#7950F2", title:"Bicultural por diseño", desc:"Español, inglés o Spanglish. Tu identidad dual es tu ventaja competitiva, no una complicación." },
    ],
    howBadge: lang === "en" ? "How it works" : "Cómo funciona",
    howTitle: lang === "en" ? "Three steps to get started" : "Tres pasos para empezar",
    steps: lang === "en" ? [
      { n:"01", t:"Set up your brand", d:"Fill in your Brand Profile. AiStudioBrand learns your style, tone and bicultural audience automatically." },
      { n:"02", t:"Describe your idea", d:"Write what you want to communicate. Choose the type of content and generate 5 proposals in seconds." },
      { n:"03", t:"Generate and publish", d:"Select your favorite proposal, add references and talent photos, and get your final image ready to post." },
    ] : [
      { n:"01", t:"Configura tu marca", d:"Llena tu Brand Profile. AiStudioBrand aprende tu estilo, tono y audiencia bicultural automáticamente." },
      { n:"02", t:"Describe tu idea", d:"Escribe qué quieres comunicar. Elige el tipo de contenido y genera 5 propuestas en segundos." },
      { n:"03", t:"Genera y publica", d:"Selecciona tu propuesta favorita, agrega referencias y fotos de talento, y obtén tu imagen final lista para publicar." },
    ],
    ctaTitle: lang === "en" ? "Ready to get started?" : "Lista para empezar?",
    ctaSub: lang === "en" ? "Join the first creators using AiStudioBrand to scale their content." : "Únete a las primeras creadoras que están usando AiStudioBrand para escalar su contenido.",
    ctaBtn: lang === "en" ? "Create free account" : "Crear cuenta gratis",
    ctaNote: lang === "en" ? "20 free generations · No credit card required" : "20 generaciones gratis · Sin tarjeta de crédito",
    signin: lang === "en" ? "Sign in" : "Iniciar sesión",
    startFree: lang === "en" ? "Start free" : "Empieza gratis",
    home: lang === "en" ? "Home" : "Inicio",
    pricing: lang === "en" ? "Pricing" : "Precios",
    contact: lang === "en" ? "Contact" : "Contacto",
    savedLib: lang === "en" ? "Saved to your library" : "Guardado en tu biblioteca",
    footerTag: lang === "en" ? "Content that sounds like you." : "Contenido que suena como tú.",
    footerRights: lang === "en" ? "2025 AiStudioBrand. All rights reserved." : "2025 AiStudioBrand. Todos los derechos reservados.",
  };

  const S = {
    nav: { display:"flex", alignItems:"center", padding:"0 32px", height:62, borderBottom:"1px solid rgba(255,255,255,0.1)", background:"#0D0D1F", position:"sticky", top:0, zIndex:100 },
    logoIcon: { width:30, height:30, background:"#7950F2", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:500 },
    logoText: { fontSize:15, fontWeight:500, color:"#fff" },
    navLink: { padding:"6px 13px", borderRadius:8, fontSize:13, color:"rgba(255,255,255,0.7)", cursor:"pointer", background:"none", border:"none", fontFamily:"Inter, sans-serif" },
    navCta: { padding:"8px 18px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" },
    sectionBadge: { display:"inline-block", background:"rgba(121,80,242,0.15)", color:"#A78BFA", fontSize:11, fontWeight:500, padding:"4px 12px", borderRadius:20, marginBottom:12 },
    btnPrimary: { padding:"13px 28px", background:"#7950F2", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" },
    btnSecondary: { padding:"12px 24px", background:"#0D0D1F", color:"#fff", border:"1.5px solid #E0E0E0", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" },
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0D1F", fontFamily:"Inter, sans-serif" }}>
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={S.logoIcon}>Ai</div>
          <span style={S.logoText}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:4, marginLeft:"auto", alignItems:"center" }}>
          <button style={S.navLink} onClick={() => router.push("/")}>{t.home}</button>
          <button style={S.navLink} onClick={() => router.push("/pricing")}>{t.pricing}</button>
          <button style={S.navLink} onClick={() => router.push("/contacto")}>{t.contact}</button>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:3, gap:2, marginLeft:8 }}>
            <button onClick={() => setLanguage("en")} style={{ padding:"5px 10px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background: lang==="en" ? "#fff" : "transparent", border:"none", fontFamily:"Inter, sans-serif", color: lang==="en" ? "#0A0A0A" : "#888" }}>EN</button>
            <button onClick={() => setLanguage("es")} style={{ padding:"5px 10px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background: lang==="es" ? "#fff" : "transparent", border:"none", fontFamily:"Inter, sans-serif", color: lang==="es" ? "#0A0A0A" : "#888" }}>ES</button>
          </div>
          <button style={{ padding:"7px 16px", background:"#0D0D1F", color:"#fff", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", marginLeft:4 }} onClick={() => router.push("/login")}>{t.signin}</button>
          <button style={S.navCta} onClick={() => router.push("/login")}>{t.startFree}</button>
        </div>
      </nav>

      <div style={{ padding:"56px 40px", background:"#0D0D1F" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div style={{ textAlign:"left" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(121,80,242,0.15)", color:"#A78BFA", fontSize:12, fontWeight:500, padding:"5px 13px", borderRadius:20, marginBottom:22 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#7950F2", display:"inline-block" }}></span>
              {t.badge}
            </div>
            <h1 style={{ fontSize:42, fontWeight:800, lineHeight:1.12, letterSpacing:"-0.04em", marginBottom:16, background:"linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {t.title1}<br />
              <span style={{ color:"#A78BFA" }}>{t.title2}</span>
            </h1>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", lineHeight:1.7, marginBottom:28 }}>{t.sub}</p>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <button className="btn-primary" style={{...S.btnPrimary, boxShadow:"0 4px 14px rgba(121,80,242,0.4)"}} onClick={() => router.push("/login?tab=register")}>{t.btn1}</button>
              <button style={S.btnSecondary} onClick={() => router.push("/crear")}>{t.btn2}</button>
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{t.note}</div>
            <div style={{ display:"flex", gap:24, marginTop:28 }}>
              {t.stats.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize:22, fontWeight:500, color:"#A78BFA", letterSpacing:"-0.02em" }}>{s.num}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#F3F0FF,#FDF2F8)", borderRadius:20, padding:24 }}>
            <div style={{ background:"#0A0A1A", borderRadius:18, padding:16, maxWidth:240, margin:"0 auto" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:24, height:24, background:"#7950F2", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:500 }}>Ai</div>
                <span style={{ fontSize:12, fontWeight:500, color:"#fff" }}>AiStudioBrand</span>
                <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.4)" }}>generating...</span>
              </div>
              <div style={{ background:"linear-gradient(135deg,#7950F2,#E64980)", borderRadius:12, height:120, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, position:"relative", overflow:"hidden" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:4 }}>◉</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>AI Generated</div>
                </div>
              </div>
              <div style={{ background:"#1A1A2E", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ fontSize:9, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Hook</div>
                <div style={{ fontSize:11, fontWeight:500, color:"#fff", marginBottom:4, lineHeight:1.4 }}>Mami, ya no más stress!</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", lineHeight:1.5, marginBottom:4 }}>Our coaching program es literally a lifesaver para todas las mujeres...</div>
                <div style={{ fontSize:9, color:"#A78BFA", fontWeight:500 }}>DM con LISTA y te cuento todo</div>
              </div>
              <div style={{ background:"#1A1A2E", borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:16, height:16, borderRadius:"50%", background:"#40C057", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff", flexShrink:0 }}>✓</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)" }}>{t.savedLib}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" style={{ padding:"64px 32px", background:"#0A0A18" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={S.sectionBadge}>{t.featBadge}</div>
          <h2 style={{ fontSize:28, fontWeight:500, color:"#fff", letterSpacing:"-0.02em", marginBottom:10 }}>{t.featTitle}</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.7)", lineHeight:1.65, maxWidth:500, marginBottom:40 }}>{t.featSub}</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:12 }}>
            {t.features.map((f, i) => (
              <div key={i} className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(121,80,242,0.15)", borderRadius:16, padding:22 }}>
                <div style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginBottom:12, background:f.color, color:f.tc }}>{f.icon}</div>
                <div style={{ fontSize:14, fontWeight:500, color:"#fff", marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"64px 32px", background:"#0D0D1F" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={S.sectionBadge}>{t.howBadge}</div>
          <h2 style={{ fontSize:28, fontWeight:500, color:"#fff", letterSpacing:"-0.02em", marginBottom:0 }}>{t.howTitle}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:0, marginTop:40 }}>
            {t.steps.map((s, i) => (
              <div key={i} style={{ padding:"28px 24px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div style={{ fontSize:36, fontWeight:500, color:"#E8E4FE", letterSpacing:"-0.04em", marginBottom:14 }}>{s.n}</div>
                <div style={{ fontSize:15, fontWeight:500, color:"#fff", marginBottom:8 }}>{s.t}</div>
                <div style={{ fontSize:13, color:"#777", lineHeight:1.65 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"72px 32px", background:"#7950F2", textAlign:"center" }}>
        <h2 style={{ fontSize:32, fontWeight:500, color:"#fff", letterSpacing:"-0.02em", marginBottom:12 }}>{t.ctaTitle}</h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", marginBottom:28 }}>{t.ctaSub}</p>
        <button className="btn-primary" style={{ padding:"14px 32px", background:"#0D0D1F", color:"#7950F2", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", boxShadow:"0 4px 14px rgba(121,80,242,0.4)" }} onClick={() => router.push("/login?tab=register")}>
          {t.ctaBtn}
        </button>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:12 }}>{t.ctaNote}</div>
      </div>

      <div style={{ padding:32, borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:26, height:26, background:"#7950F2", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:500 }}>Ai</div>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:"#fff" }}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{t.footerTag}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <button onClick={() => router.push("/terminos")} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer" }}>{lang === "en" ? "Terms" : "Términos"}</button>
          <button onClick={() => router.push("/privacidad")} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer" }}>{lang === "en" ? "Privacy" : "Privacidad"}</button>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{t.footerRights}</span>
        </div>
      </div>
    </div>
  );
}