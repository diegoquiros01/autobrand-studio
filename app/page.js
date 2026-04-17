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
        <div style={s.heroGradient} />
        <div style={s.heroGradient2} />
        <div style={s.contentWrapper}>
          <div className="fade-in-up" style={s.heroBadge}>
            <span style={s.badgeNew}>NEW</span>
            <span>{en ? "Art Director AI — visual brief + quality validation" : "Art Director IA — brief visual + validación de calidad"}</span>
          </div>

          <h1 className="fade-in-up" style={s.heroHeadline}>
            {en ? "Your brand. " : "Tu marca. "}
            <span style={s.textAccent}>{en ? "Your voice." : "Tu voz."}</span>
            <br />
            {en ? "AI content in 30 seconds." : "Contenido IA en 30 segundos."}
          </h1>

          <p className="fade-in-up-delay" style={s.heroSub}>
            {en
              ? "The first bicultural AI that learns your brand DNA to create Instagram posts that sound exactly like you. "
              : "La primera IA bicultural que aprende tu ADN de marca para crear posts de Instagram que suenan exactamente como tú. "}
            <span style={{ color:"#fff" }}>Spanglish included.</span>
          </p>

          <div className="fade-in-up-delay-2" style={s.ctaWrapper}>
            <button className="pulse-glow" onClick={() => router.push("/login?tab=register")} style={s.mainCta}>
              {en ? "Try 20 Free Generations" : "Prueba 20 Generaciones Gratis"}
            </button>
            <div style={s.socialProof}>
              <div style={s.avatarGroup}>
                {["#7950F2","#E64980","#F59E0B","#40C057"].map((c, i) => (
                  <div key={i} style={{ ...s.avatarPlaceholder, background:c, zIndex:4-i }} />
                ))}
              </div>
              <span style={s.socialText}>{en ? "500+ creators already use it" : "500+ creadoras ya lo usan"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DEMO INTERACTIVO ═══ */}
      <RevealSection>
        <div style={s.demoWindow}>
          <div style={s.windowHeader}>
            <div style={s.windowDots}>
              <span style={{ ...s.dot, background:"#FF5F56" }} />
              <span style={{ ...s.dot, background:"#FFBD2E" }} />
              <span style={{ ...s.dot, background:"#27C93F" }} />
            </div>
            <div style={s.windowUrl}>aistudiobrand.com/crear</div>
          </div>
          <div style={s.demoContent}>
            <div style={s.demoLeft}>
              <div style={s.miniLabel}>{en ? "POST IDEA" : "IDEA DEL POST"}</div>
              <div className="typing-text" style={s.fakeInput}>
                {en
                  ? "\"I want to announce my new coaching spots for Latinas in tech...\""
                  : "\"Quiero anunciar mis nuevos spots de coaching para latinas en tech...\""}
              </div>
              <div style={s.demoProgress}>
                <div className="progress-fill" style={s.progressFill} />
              </div>
              <div style={s.statusSteps}>
                {(en
                  ? ["Claude analyzing brand...", "Creating visual brief...", "Gemini rendering image...", "Validating quality..."]
                  : ["Claude analizando marca...", "Creando brief visual...", "Gemini renderizando imagen...", "Validando calidad..."]
                ).map((step, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", background: i < 3 ? "#40C057" : "rgba(121,80,242,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff", flexShrink:0 }}>{i < 3 ? "✓" : "⟳"}</div>
                    <span style={{ fontSize:12, color: i < 3 ? "rgba(255,255,255,0.5)" : "#A78BFA", fontWeight: i === 3 ? 600 : 400 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.demoRight}>
              <div className="image-reveal" style={s.resultImage}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:48, opacity:0.4, marginBottom:8 }}>✦</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)" }}>{en ? "AI Generated" : "Generado con IA"}</div>
                </div>
                <div style={s.validatedBadge}>
                  <span style={{ fontSize:8 }}>✓</span> {en ? "Quality validated" : "Calidad validada"}
                </div>
              </div>
              <div style={s.copyPreview}>
                <div style={s.copyLabel}>HOOK</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:6 }}>Mami, ya no más stress!</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>Our coaching program es literally a lifesaver para todas las mujeres...</div>
                <div style={{ fontSize:12, color:"#A78BFA", fontWeight:600, marginTop:6 }}>DM con LISTA y te cuento todo →</div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ═══ SOCIAL PROOF STRIP ═══ */}
      <RevealSection style={{ padding:"40px 20px" }}>
        <div style={s.proofStrip}>
          {[
            { n:"30s", l: en ? "to generate" : "para generar" },
            { n:"3", l: en ? "steps" : "pasos" },
            { n:"ES+EN", l: "bicultural" },
            { n:"20", l: en ? "free gens" : "gratis" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={s.proofNum}>{item.n}</div>
              <div style={s.proofLabel}>{item.l}</div>
            </div>
          ))}
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
        <div style={s.bentoGrid}>
          <div className="card-hover" style={{ ...s.bentoCard, gridColumn:"span 2", background:"linear-gradient(135deg, #16162d, #0A0A1A)" }}>
            <span style={s.cardEmoji}>🧠</span>
            <h3 style={s.cardTitle}>Claude Art Director</h3>
            <p style={s.cardDesc}>{en ? "Claude analyzes your brand and dictates the brief to Gemini. Results are validated before you see them." : "Claude analiza tu marca y dicta el brief a Gemini. Resultados validados antes de que los veas."}</p>
          </div>
          <div className="card-hover" style={s.bentoCard}>
            <span style={s.cardEmoji}>🇲🇽</span>
            <h3 style={s.cardTitle}>{en ? "Native Spanglish" : "Spanglish Nativo"}</h3>
            <p style={s.cardDesc}>{en ? "Copy that connects. We understand culture, not just language." : "Copy que conecta. Entendemos la cultura, no solo el idioma."}</p>
          </div>
          <div className="card-hover" style={s.bentoCard}>
            <span style={s.cardEmoji}>⚡</span>
            <h3 style={s.cardTitle}>{en ? "30 Seconds" : "30 Segundos"}</h3>
            <p style={s.cardDesc}>{en ? "From idea to final art in under a minute." : "De la idea al arte final en menos de un minuto."}</p>
          </div>
          <div className="card-hover" style={{ ...s.bentoCard, gridColumn:"span 2" }}>
            <span style={s.cardEmoji}>🎨</span>
            <h3 style={s.cardTitle}>{en ? "Unique Brand DNA" : "ADN de Marca Único"}</h3>
            <p style={s.cardDesc}>{en ? "Your colors, your typography, and your personality in every generated pixel." : "Tus colores, tu tipografía y tu personalidad en cada píxel generado."}</p>
          </div>
          <div className="card-hover" style={s.bentoCard}>
            <span style={s.cardEmoji}>📚</span>
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
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(121,80,242,0.4); }
      70% { box-shadow: 0 0 0 20px rgba(121,80,242,0); }
      100% { box-shadow: 0 0 0 0 rgba(121,80,242,0); }
    }
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
    .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
    .fade-in-up-delay { animation: fadeInUp 0.8s ease-out 0.2s forwards; opacity: 0; }
    .fade-in-up-delay-2 { animation: fadeInUp 0.8s ease-out 0.4s forwards; opacity: 0; }
    .pulse-glow { animation: pulseGlow 2.5s infinite; }
    .image-reveal { animation: unveil 1.5s cubic-bezier(0.19,1,0.22,1) forwards; }
    .progress-fill { width:0%; height:100%; background:linear-gradient(90deg,#7950F2,#A78BFA); border-radius:4px; animation: typing 3s ease-in-out forwards; }
    .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
    .card-hover:hover { transform: translateY(-6px); border-color: rgba(121,80,242,0.4) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  `}</style>
);

// --- STYLES ---
const s = {
  container: { backgroundColor:"#0A0A1A", color:"#fff", fontFamily:"Inter, sans-serif", overflowX:"hidden" },
  section: { padding:"100px 20px", maxWidth:1100, margin:"0 auto", textAlign:"center" },

  // Nav
  nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", height:64, position:"sticky", top:0, zIndex:100, background:"rgba(10,10,26,0.8)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.05)" },
  logoIcon: { width:30, height:30, background:"linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" },
  logoText: { fontSize:15, fontWeight:700, letterSpacing:"-0.03em" },
  navLink: { padding:"6px 14px", background:"none", border:"none", color:"rgba(255,255,255,0.45)", fontSize:13, cursor:"pointer", fontFamily:"Inter" },
  langToggle: { display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:7, padding:2, gap:1, marginLeft:8 },
  langBtn: { padding:"4px 9px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", background:"transparent", border:"none", color:"rgba(255,255,255,0.35)", fontFamily:"Inter" },
  langActive: { background:"#fff", color:"#0A0A0A" },
  navSignin: { padding:"7px 16px", background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:500, cursor:"pointer", marginLeft:4, fontFamily:"Inter" },
  navCta: { padding:"8px 18px", background:"#7950F2", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Inter", boxShadow:"0 2px 12px rgba(121,80,242,0.4)" },

  // Hero
  heroSection: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", textAlign:"center", padding:"0 24px" },
  heroGradient: { position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(circle at 50% 40%, rgba(121,80,242,0.15) 0%, transparent 50%)", zIndex:0 },
  heroGradient2: { position:"absolute", top:"20%", right:"-10%", width:400, height:400, background:"radial-gradient(circle, rgba(230,73,128,0.08) 0%, transparent 60%)", filter:"blur(60px)", zIndex:0 },
  contentWrapper: { zIndex:2, maxWidth:900 },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:8, background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:100, padding:"6px 16px 6px 8px", marginBottom:32, fontSize:13, color:"#A78BFA", fontWeight:500 },
  badgeNew: { background:"#7950F2", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:100 },
  heroHeadline: { fontSize:"clamp(40px, 8vw, 72px)", fontWeight:800, lineHeight:1.08, letterSpacing:"-0.045em", marginBottom:24 },
  textAccent: { background:"linear-gradient(90deg,#7950F2,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  heroSub: { fontSize:"clamp(16px, 3vw, 20px)", color:"rgba(255,255,255,0.5)", marginBottom:40, lineHeight:1.65, maxWidth:640, margin:"0 auto 40px" },
  ctaWrapper: { display:"flex", flexDirection:"column", alignItems:"center", gap:0 },
  mainCta: { backgroundColor:"#7950F2", color:"#fff", padding:"18px 44px", borderRadius:100, fontSize:17, fontWeight:700, border:"none", cursor:"pointer", transition:"transform 0.2s", fontFamily:"Inter" },
  socialProof: { marginTop:28, display:"flex", flexDirection:"column", alignItems:"center", gap:10 },
  avatarGroup: { display:"flex" },
  avatarPlaceholder: { width:30, height:30, borderRadius:"50%", border:"2px solid #0A0A1A", marginLeft:-8 },
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
  sectionTitle: { fontSize:36, fontWeight:800, letterSpacing:"-0.04em", marginBottom:48, background:"linear-gradient(180deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },

  // Steps
  stepsGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, textAlign:"left" },
  stepCard: { background:"#16162d", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"32px 24px", position:"relative", overflow:"hidden" },
  stepBigNum: { position:"absolute", top:-24, right:-8, fontSize:110, fontWeight:900, color:"rgba(121,80,242,0.04)", letterSpacing:"-0.05em", lineHeight:1, pointerEvents:"none" },
  stepIcon: { width:44, height:44, borderRadius:12, background:"rgba(121,80,242,0.12)", border:"1px solid rgba(121,80,242,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#A78BFA", marginBottom:18 },

  // Bento
  bentoGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, textAlign:"left" },
  bentoCard: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", padding:"28px 24px", borderRadius:20 },
  cardEmoji: { fontSize:32, display:"block", marginBottom:16 },
  cardTitle: { fontSize:16, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-0.02em" },
  cardDesc: { fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6, margin:0 },

  // Final CTA
  finalCta: { background:"linear-gradient(180deg, rgba(121,80,242,0.08) 0%, transparent 100%)", padding:"72px 40px", borderRadius:32, border:"1px solid rgba(121,80,242,0.15)" },
  inputGroup: { display:"flex", maxWidth:460, margin:"0 auto 16px", gap:10 },
  emailInput: { flex:1, padding:"14px 20px", borderRadius:100, border:"1px solid rgba(255,255,255,0.1)", backgroundColor:"rgba(0,0,0,0.3)", color:"#fff", outline:"none", fontSize:14, fontFamily:"Inter" },
  inputCta: { backgroundColor:"#fff", color:"#0A0A1A", padding:"14px 28px", borderRadius:100, fontWeight:700, border:"none", cursor:"pointer", fontSize:14, fontFamily:"Inter", whiteSpace:"nowrap" },

  // Footer
  footer: { padding:"24px 32px", borderTop:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between" },
  footerLink: { fontSize:11, color:"rgba(255,255,255,0.2)", background:"none", border:"none", cursor:"pointer" },
};
