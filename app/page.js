"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// --- SCROLL REVEAL HOOK ---
const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
};

const RevealSection = ({ children, style }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <section ref={ref} className={isVisible ? "visible" : "hidden"} style={{ ...s.section, ...style }}>
      {children}
    </section>
  );
};

// --- TYPING EFFECT COMPONENT ---
const TypingPrompt = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typeSpeed = isDeleting ? 30 : 60;
    const pauseDelay = isDeleting ? 500 : 2000;

    if (!isDeleting && charIndex === text.length) {
      const t = setTimeout(() => setIsDeleting(true), pauseDelay);
      return () => clearTimeout(t);
    }
    if (isDeleting && charIndex === 0) {
      const t = setTimeout(() => setIsDeleting(false), pauseDelay);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setCharIndex(prev => prev + (isDeleting ? -1 : 1));
      setDisplayed(text.slice(0, charIndex + (isDeleting ? -1 : 1)));
    }, typeSpeed);
    return () => clearTimeout(t);
  }, [charIndex, isDeleting, text]);

  return (
    <span>{displayed}<span className="typing-cursor">|</span></span>
  );
};

export default function Landing() {
  const router = useRouter();
  const [lang, setLang] = useState("es");
  const [email, setEmail] = useState("");

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
    <div style={s.container}>
      <GlobalAnimations />

      {/* ═══ NAV ═══ */}
      <nav style={s.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={s.logoIcon}>Ai</div>
          <span style={s.logoText}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={() => router.push("/pricing")} style={s.navLink}>{en ? "Pricing" : "Precios"}</button>
          <button onClick={() => router.push("/contacto")} style={s.navLink}>{en ? "Contact" : "Contacto"}</button>
          <div style={s.langToggle}>
            <button onClick={() => setLanguage("en")} style={{ ...s.langBtn, ...(en ? s.langActive : {}) }}>EN</button>
            <button onClick={() => setLanguage("es")} style={{ ...s.langBtn, ...(!en ? s.langActive : {}) }}>ES</button>
          </div>
          <button onClick={() => router.push("/login")} style={s.navSignin}>{en ? "Log in" : "Entrar"}</button>
          <button className="pulse-glow" onClick={() => router.push("/login?tab=register")} style={s.navCta}>{en ? "Start free" : "Empieza gratis"}</button>
        </div>
      </nav>

      {/* ═══ HERO — FULL VIEWPORT ═══ */}
      <section style={s.heroSection}>
        {/* Animated gradient background */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 50% at 50% -20%, rgba(121,80,242,0.25) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(230,73,128,0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 10% 80%, rgba(167,139,250,0.06) 0%, transparent 50%)", zIndex:0 }} />
        {/* Slow moving orbs */}
        <div className="orb-1" style={{ position:"absolute", top:"15%", left:"20%", width:300, height:300, borderRadius:"50%", background:"rgba(121,80,242,0.08)", filter:"blur(80px)", pointerEvents:"none", zIndex:0 }} />
        <div className="orb-2" style={{ position:"absolute", bottom:"10%", right:"15%", width:250, height:250, borderRadius:"50%", background:"rgba(230,73,128,0.06)", filter:"blur(70px)", pointerEvents:"none", zIndex:0 }} />
        <div className="orb-3" style={{ position:"absolute", top:"60%", left:"60%", width:200, height:200, borderRadius:"50%", background:"rgba(167,139,250,0.05)", filter:"blur(60px)", pointerEvents:"none", zIndex:0 }} />
        {/* Grid overlay */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize:"40px 40px", maskImage:"radial-gradient(ellipse 70% 50% at 50% 40%, black, transparent)", WebkitMaskImage:"radial-gradient(ellipse 70% 50% at 50% 40%, black, transparent)", pointerEvents:"none", zIndex:0 }} />
        {/* Horizon line glow */}
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"linear-gradient(90deg, transparent 5%, rgba(121,80,242,0.15) 30%, rgba(167,139,250,0.2) 50%, rgba(121,80,242,0.15) 70%, transparent 95%)", zIndex:0 }} />
        <div style={s.contentWrapper}>
          <div className="animate-hero" style={{ ...s.heroBadge, backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}>
            <span style={{ fontSize:16 }}>🧠</span>
            <span style={s.badgeNew}>NEW</span>
            <span>AI Brand Studio</span>
          </div>

          <h1 className="animate-hero" style={{ ...s.heroHeadline, animationDelay:"0.1s" }}>
            {en ? "Your brand. " : "Tu marca. "}
            <span style={s.textAccent}>{en ? "Your voice." : "Tu voz."}</span>
            <br />
            {en ? "AI content in 30 seconds." : "Contenido IA en 30 segundos."}
          </h1>

          {/* Prompt box with typing effect */}
          <div className="animate-hero" style={{ animationDelay:"0.2s", maxWidth:720, margin:"0 auto 48px" }}>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, border:"1px solid rgba(255,255,255,0.1)", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ padding:"22px 26px 40px", fontSize:16, color:"rgba(255,255,255,0.35)", textAlign:"left", lineHeight:1.6, minHeight:80 }}>
                <TypingPrompt text={en ? "Ask AiStudioBrand to create a Post for my Instagram account..." : "Pedile a AiStudioBrand que cree un Post para mi cuenta de Instagram..."} />
              </div>
              <div style={{ padding:"10px 16px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width:30, height:30, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>+</div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>{en ? "Create" : "Crear"} <span style={{ fontSize:10 }}>▾</span></span>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"#7950F2", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <span style={{ fontSize:13, color:"#fff" }}>↑</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="animate-hero" style={{ ...s.heroSub, animationDelay:"0.3s" }}>
            {en
              ? "The first bicultural AI that learns your brand DNA to create Instagram posts that sound exactly like you. "
              : "La primera IA bicultural que aprende tu ADN de marca para crear posts de Instagram que suenan exactamente como tú. "}
            <span style={{ color:"#fff" }}>Spanglish included.</span>
          </p>

          <div className="animate-hero" style={{ ...s.ctaWrapper, animationDelay:"0.4s" }}>
            <button className="magnetic-btn" onClick={() => router.push("/login?tab=register")} style={s.mainCta}>
              {en ? "Try 20 Free Generations" : "Prueba 20 Generaciones Gratis"}
            </button>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:16 }}>{en ? "No credit card required · Setup in 2 min" : "Sin tarjeta de crédito · Setup en 2 min"}</p>
          </div>
        </div>
      </section>

      {/* ═══ VIDEO DEMO ═══ */}
      <RevealSection style={{ paddingTop:0 }}>
        <div style={{ maxWidth:900, margin:"0 auto", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(121,80,242,0.06)" }}>
          <video autoPlay loop muted playsInline style={{ width:"100%", display:"block" }} src="/assets/hero-video.mp4" />
        </div>
      </RevealSection>

      {/* ═══ HOW IT WORKS ═══ */}
      <RevealSection>
        <div style={s.sectionBadge}>{en ? "How it works" : "Cómo funciona"}</div>
        <h2 style={s.sectionTitle}>{en ? "From idea to post in three steps" : "De la idea al post en tres pasos"}</h2>
        <div style={s.stepsGrid}>
          {(en ? [
            { n:"01", icon:"◉", t:"Define your brand DNA", d:"Upload screenshots, connect your web. AI analyzes your style, tone, and audience in seconds." },
            { n:"02", icon:"✦", t:"Describe your idea", d:"Write what you want to say. Choose type, format, and language. One sentence is enough." },
            { n:"03", icon:"◈", t:"Get your post", d:"Art Director AI creates a brief, generates the image, validates quality, and writes 3 copy options." },
          ] : [
            { n:"01", icon:"◉", t:"Define tu ADN de marca", d:"Sube screenshots, conecta tu web. La IA analiza tu estilo, tono y audiencia en segundos." },
            { n:"02", icon:"✦", t:"Describe tu idea", d:"Escribe qué quieres comunicar. Elige tipo, formato e idioma. Una frase es suficiente." },
            { n:"03", icon:"◈", t:"Recibe tu post", d:"Art Director IA crea el brief, genera la imagen, valida calidad y escribe 3 opciones de copy." },
          ]).map((step, i) => (
            <div key={i} className="card-hover" style={s.stepCard}>
              <div style={s.stepBigNum}>{step.n}</div>
              <div style={s.stepIcon}>{step.icon}</div>
              <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>{step.t}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.65 }}>{step.d}</div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ═══ BENTO FEATURES ═══ */}
      <RevealSection>
        <div style={s.sectionBadge}>{en ? "Features" : "Funcionalidades"}</div>
        <h2 style={s.sectionTitle}>{en ? "Built for creators who mean business" : "Hecho para creadoras que van en serio"}</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16, textAlign:"left" }}>
          {/* Claude Art Director — full width */}
          <div className="card-hover" style={{ ...s.bentoCard, gridColumn:"span 2", background:"linear-gradient(135deg, #16162d, #0A0A1A)" }}>
            <div style={s.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h3a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1v3a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3h3V9.4C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/><circle cx="10" cy="6" r="1" fill="#A78BFA"/><circle cx="14" cy="6" r="1" fill="#A78BFA"/></svg>
            </div>
            <h3 style={s.cardTitle}>Claude Art Director</h3>
            <p style={s.cardDesc}>{en ? "Claude analyzes your brand and dictates the brief to Gemini. Results are validated before you see them." : "Claude analiza tu marca y dicta el brief a Gemini. Resultados validados antes de que los veas."}</p>
          </div>
          {/* Native Spanglish */}
          <div className="card-hover" style={s.bentoCard}>
            <div style={s.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
            </div>
            <h3 style={s.cardTitle}>{en ? "Native Spanglish" : "Spanglish Nativo"}</h3>
            <p style={s.cardDesc}>{en ? "Copy that connects. We understand culture, not just language." : "Copy que conecta. Entendemos la cultura, no solo el idioma."}</p>
          </div>
          {/* 30 Seconds */}
          <div className="card-hover" style={s.bentoCard}>
            <div style={s.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3 style={s.cardTitle}>{en ? "30 Seconds" : "30 Segundos"}</h3>
            <p style={s.cardDesc}>{en ? "From idea to final art in under a minute." : "De la idea al arte final en menos de un minuto."}</p>
          </div>
          {/* Unique Brand DNA */}
          <div className="card-hover" style={s.bentoCard}>
            <div style={s.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 style={s.cardTitle}>{en ? "Unique Brand DNA" : "ADN de Marca Único"}</h3>
            <p style={s.cardDesc}>{en ? "Your colors, your typography, and your personality in every generated pixel." : "Tus colores, tu tipografía y tu personalidad en cada píxel generado."}</p>
          </div>
          {/* Auto Library */}
          <div className="card-hover" style={s.bentoCard}>
            <div style={s.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <h3 style={s.cardTitle}>{en ? "Auto Library" : "Biblioteca Auto"}</h3>
            <p style={s.cardDesc}>{en ? "Every piece saved automatically. Filter, reuse, remix." : "Cada pieza se guarda automáticamente. Filtra, reutiliza, remezcla."}</p>
          </div>
        </div>
      </RevealSection>

      {/* ═══ CTA FINAL ═══ */}
      <RevealSection>
        <div style={s.finalCta}>
          <h2 style={{ ...s.heroHeadline, fontSize:"clamp(32px, 6vw, 52px)", marginBottom:16 }}>
            {en ? "Ready to sound like yourself?" : "¿Lista para sonar como tú misma?"}
          </h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.5)", marginBottom:36, lineHeight:1.7, maxWidth:500, margin:"0 auto 36px" }}>
            {en ? "Join creators who stopped outsourcing their voice." : "Únete a las creadoras que dejaron de tercerizar su voz."}
          </p>
          <div style={s.inputGroup}>
            <input type="email" placeholder="tu@email.com" style={s.emailInput} value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={() => router.push("/login?tab=register")} style={s.inputCta}>{en ? "Start Now" : "Empezar Ahora"}</button>
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{en ? "20 free credits · Setup in 2 min" : "20 créditos gratis · Setup en 2 min"}</span>
        </div>
      </RevealSection>

      {/* ═══ FOOTER ═══ */}
      <footer style={s.footer}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:22, height:22, background:"#7950F2", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>Ai</div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>AiStudioBrand · {en ? "Content that sounds like you" : "Contenido que suena como tú"}</span>
        </div>
        <div style={{ display:"flex", gap:16 }}>
          <button onClick={() => router.push("/terminos")} style={s.footerLink}>{en ? "Terms" : "Términos"}</button>
          <button onClick={() => router.push("/privacidad")} style={s.footerLink}>{en ? "Privacy" : "Privacidad"}</button>
        </div>
      </footer>
    </div>
  );
}

// --- GLOBAL ANIMATIONS ---
const GlobalAnimations = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 20px rgba(121,80,242,0.4), inset 0 0 10px rgba(255,255,255,0.2); }
      70% { box-shadow: 0 0 35px rgba(121,80,242,0.6), inset 0 0 10px rgba(255,255,255,0.2); }
      100% { box-shadow: 0 0 20px rgba(121,80,242,0.4), inset 0 0 10px rgba(255,255,255,0.2); }
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    @keyframes orbFloat1 {
      0% { transform: translate(0, 0); }
      33% { transform: translate(30px, -20px); }
      66% { transform: translate(-20px, 15px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes orbFloat2 {
      0% { transform: translate(0, 0); }
      33% { transform: translate(-25px, 20px); }
      66% { transform: translate(15px, -25px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes orbFloat3 {
      0% { transform: translate(0, 0); }
      33% { transform: translate(20px, 15px); }
      66% { transform: translate(-15px, -20px); }
      100% { transform: translate(0, 0); }
    }
    .orb-1 { animation: orbFloat1 8s ease-in-out infinite; }
    .orb-2 { animation: orbFloat2 10s ease-in-out infinite; }
    .orb-3 { animation: orbFloat3 12s ease-in-out infinite; }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes unveil {
      from { clip-path: inset(100% 0 0 0); }
      to { clip-path: inset(0 0 0 0); }
    }
    @keyframes typing {
      from { width: 0% }
      to { width: 100% }
    }
    .hidden { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.4,0,0.2,1); }
    .visible { opacity: 1; transform: translateY(0); transition: all 0.8s cubic-bezier(0.4,0,0.2,1); }
    .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
    .fade-in-up-delay { animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; opacity: 0; }
    .fade-in-up-delay-2 { animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards; opacity: 0; }
    .animate-hero { animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
    .magnetic-btn { transition: all 0.3s ease; }
    .magnetic-btn:hover { transform: scale(1.05) !important; box-shadow: 0 0 35px rgba(121,80,242,0.6), inset 0 0 10px rgba(255,255,255,0.2) !important; }
    .magnetic-btn:active { transform: scale(0.97) !important; }
    .float-anim { animation: float 4s ease-in-out infinite; }
    .image-reveal { animation: unveil 1.5s cubic-bezier(0.19,1,0.22,1) forwards; }
    @keyframes reveal { from { clip-path: inset(100% 0 0 0); opacity: 0; } to { clip-path: inset(0 0 0 0); opacity: 1; } }
    @keyframes blink { from, to { border-color: transparent } 50% { border-color: #7950F2 } }
    .reveal-animation { animation: reveal 1.5s cubic-bezier(0.19,1,0.22,1) forwards; }
    .typing-cursor { animation: blink 0.8s step-end infinite; font-weight: 100; color: rgba(255,255,255,0.5); }
    .pulse-text { animation: pulse-glow-text 2s infinite; }
    @keyframes pulse-glow-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .typing-effect { animation: typing 3s steps(40, end), blink 0.75s step-end infinite; }
    .progress-fill { width:0%; height:100%; background:linear-gradient(90deg,#7950F2,#A78BFA); border-radius:4px; animation: typing 3s ease-in-out forwards; }
    .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
    .card-hover:hover { transform: translateY(-6px); border-color: rgba(121,80,242,0.4) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  `}</style>
);

// --- STYLES ---
const s = {
  container: { backgroundColor:"#0A0A1A", color:"#fff", overflowX:"hidden" },
  section: { padding:"100px 20px", maxWidth:1100, margin:"0 auto", textAlign:"center" },

  // Nav
  nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", height:64, position:"sticky", top:0, zIndex:100, background:"rgba(10,10,26,0.8)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.05)" },
  logoIcon: { width:30, height:30, background:"linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" },
  logoText: { fontSize:15, fontWeight:700, letterSpacing:"-0.03em" },
  navLink: { padding:"8px 16px", background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:14, fontWeight:500, letterSpacing:"0.02em", cursor:"pointer", borderRadius:8, transition:"all 0.2s" },
  langToggle: { display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:7, padding:2, gap:1, marginLeft:8 },
  langBtn: { padding:"4px 9px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", background:"transparent", border:"none", color:"rgba(255,255,255,0.35)" },
  langActive: { background:"#fff", color:"#0A0A0A" },
  navSignin: { padding:"7px 16px", background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:500, cursor:"pointer", marginLeft:4 },
  navCta: { padding:"8px 18px", background:"#7950F2", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 12px rgba(121,80,242,0.4)" },

  // Hero
  heroSection: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", textAlign:"center", padding:"0 24px" },
  heroGradient: { position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(circle at 50% -20%, rgba(121,80,242,0.18) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(167,139,250,0.05) 0%, transparent 40%)", zIndex:0 },
  heroGradient2: { position:"absolute", top:"10%", right:"-10%", width:500, height:500, background:"radial-gradient(circle, rgba(230,73,128,0.06) 0%, transparent 60%)", filter:"blur(80px)", zIndex:0 },
  contentWrapper: { zIndex:2, maxWidth:900 },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:8, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:100, padding:"6px 16px 6px 8px", marginBottom:32, fontSize:13, color:"#A78BFA", fontWeight:500 },
  badgeNew: { background:"#7950F2", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:100 },
  heroHeadline: { fontSize:"clamp(44px, 9vw, 84px)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.05em", marginBottom:28, background:"linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.6) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  textAccent: { background:"linear-gradient(90deg,#7950F2,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  heroSub: { fontSize:"clamp(16px, 3vw, 20px)", color:"rgba(255,255,255,0.5)", marginBottom:40, lineHeight:1.65, maxWidth:640, margin:"0 auto 40px" },
  ctaWrapper: { display:"flex", flexDirection:"column", alignItems:"center", gap:0 },
  mainCta: { background:"linear-gradient(135deg,#7950F2 0%,#A78BFA 100%)", color:"#fff", padding:"20px 44px", borderRadius:100, fontSize:18, fontWeight:700, border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", boxShadow:"0 0 20px rgba(121,80,242,0.4), inset 0 0 10px rgba(255,255,255,0.2)" },
  socialProof: { marginTop:28, display:"flex", flexDirection:"column", alignItems:"center", gap:10 },
  avatarGroup: { display:"flex" },
  avatarPlaceholder: { width:40, height:40, borderRadius:"50%", border:"2px solid #0A0A1A", marginLeft:-12 },
  socialText: { fontSize:13, color:"rgba(255,255,255,0.35)" },

  // Demo
  demoWindow: { background:"#16162d", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(121,80,242,0.06)", maxWidth:960, margin:"0 auto" },
  windowHeader: { padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:12, background:"rgba(0,0,0,0.2)" },
  windowDots: { display:"flex", gap:7 },
  dot: { width:10, height:10, borderRadius:"50%", display:"inline-block" },
  windowUrl: { flex:1, height:26, background:"rgba(255,255,255,0.04)", borderRadius:6, display:"flex", alignItems:"center", paddingLeft:12, fontSize:11, color:"rgba(255,255,255,0.2)" },
  demoContent: { display:"grid", gridTemplateColumns:"1fr 1fr", padding:"32px 36px", gap:32 },
  demoLeft: { textAlign:"left" },
  miniLabel: { fontSize:10, fontWeight:700, color:"#A78BFA", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 },
  fakeInput: { background:"rgba(0,0,0,0.3)", padding:"16px 18px", borderRadius:12, fontSize:13, color:"rgba(167,139,250,0.8)", border:"1px solid rgba(121,80,242,0.25)", marginBottom:16, lineHeight:1.5, fontStyle:"italic" },
  demoProgress: { height:3, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", marginBottom:16 },
  progressFill: {},
  statusSteps: { marginTop:4 },
  demoRight: { display:"flex", flexDirection:"column", gap:12 },
  resultImage: { flex:1, background:"linear-gradient(135deg,#7950F2 0%,#E64980 50%,#F59E0B 100%)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", minHeight:200 },
  validatedBadge: { position:"absolute", bottom:10, left:10, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:8, padding:"5px 12px", fontSize:10, color:"rgba(255,255,255,0.8)", fontWeight:600, display:"flex", alignItems:"center", gap:6 },
  copyPreview: { background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"14px 16px", textAlign:"left" },
  copyLabel: { fontSize:9, fontWeight:700, color:"#A78BFA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 },

  // Proof strip
  proofStrip: { display:"flex", justifyContent:"center", gap:56, padding:"20px 0", borderTop:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  proofNum: { fontSize:24, fontWeight:800, letterSpacing:"-0.03em", background:"linear-gradient(180deg,#fff,rgba(255,255,255,0.5))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  proofLabel: { fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:2 },

  // Section common
  sectionBadge: { display:"inline-block", background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.15)", borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:600, color:"#A78BFA", letterSpacing:"0.02em", marginBottom:16 },
  sectionTitle: { fontSize:40, fontWeight:800, letterSpacing:"-0.04em", marginBottom:56, background:"linear-gradient(180deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },

  // Steps
  stepsGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, textAlign:"left" },
  stepCard: { background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"32px 24px", position:"relative", overflow:"hidden" },
  stepBigNum: { position:"absolute", top:-24, right:-8, fontSize:110, fontWeight:900, color:"rgba(121,80,242,0.04)", letterSpacing:"-0.05em", lineHeight:1, pointerEvents:"none" },
  stepIcon: { width:44, height:44, borderRadius:12, background:"rgba(121,80,242,0.12)", border:"1px solid rgba(121,80,242,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#A78BFA", marginBottom:18 },

  // Bento
  bentoGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, textAlign:"left" },
  bentoCard: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", padding:"32px", borderRadius:24, transition:"all 0.3s ease" },
  featureIcon: { width:44, height:44, borderRadius:12, background:"rgba(121,80,242,0.12)", border:"1px solid rgba(121,80,242,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 },
  cardTitle: { fontSize:16, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-0.02em" },
  cardDesc: { fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6, margin:0 },

  // Final CTA
  finalCta: { background:"linear-gradient(180deg, rgba(121,80,242,0.08) 0%, transparent 100%)", padding:"72px 40px", borderRadius:32, border:"1px solid rgba(121,80,242,0.15)" },
  inputGroup: { display:"flex", maxWidth:460, margin:"0 auto 16px", gap:10 },
  emailInput: { flex:1, padding:"14px 20px", borderRadius:100, border:"1px solid rgba(255,255,255,0.1)", backgroundColor:"rgba(0,0,0,0.3)", color:"#fff", outline:"none", fontSize:14 },
  inputCta: { backgroundColor:"#fff", color:"#0A0A1A", padding:"14px 28px", borderRadius:100, fontWeight:700, border:"none", cursor:"pointer", fontSize:14, whiteSpace:"nowrap" },

  // Footer
  footer: { padding:"24px 32px", borderTop:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between" },
  footerLink: { fontSize:11, color:"rgba(255,255,255,0.2)", background:"none", border:"none", cursor:"pointer" },
};
