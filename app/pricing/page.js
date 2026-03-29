"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const content = {
  es: {
    nav: ["Inicio", "Funcionalidades", "Precios", "Contacto"],
    badge: "Precios",
    title: "Elige tu plan",
    sub: "Empieza gratis. Escala cuando lo necesites.",
    note: "Las primeras 20 generaciones son gratis sin registro · Sin tarjeta de crédito",
    monthly: "Mensual",
    yearly: "Anual",
    save: "Ahorra 20%",
    cta1: "Empezar gratis",
    cta2: "Empezar prueba gratis",
    cta3: "Contactar ventas",
    forever: "para siempre",
    perMonth: "por mes",
    gens: "generaciones / mes",
    plans: [
      { name:"Free", price:"$0", gens:"20", period:"para siempre", feats:["Brand Profile básico","Solo paso 1 de generación","Copy con IA (5 propuestas)","Biblioteca: últimas 10 piezas","Soporte por email"], featured:false },
      { name:"Professional", price:"$49", gens:"200", period:"por mes", feats:["Todo lo del plan Free","Flujo completo 3 pasos","Referencias visuales","Foto de talento en imagen","Brand Profile avanzado con IA","Biblioteca ilimitada","Soporte prioritario"], featured:true },
      { name:"Enterprise", price:"$175", gens:"1,000", period:"por mes", feats:["Todo lo del Professional","Hasta 5 marcas activas","Calendario de contenido con IA","Analytics de performance","Account manager dedicado","Onboarding personalizado"], featured:false },
    ],
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { q:"¿Puedo cancelar en cualquier momento?", a:"Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones. Tu acceso continúa hasta el final del período pagado." },
      { q:"¿Qué pasa si me quedo sin generaciones?", a:"Puedes comprar generaciones adicionales o hacer upgrade a un plan superior en cualquier momento." },
      { q:"¿Funciona para cualquier tipo de marca?", a:"Sí, AiStudioBrand está diseñado para creadoras de contenido, coaches, emprendedoras y cualquier marca personal o negocio digital." },
      { q:"¿Puedo usar el contenido generado comercialmente?", a:"Sí, todo el contenido generado es tuyo. Puedes usarlo libremente en tus redes sociales y otros canales." },
    ],
  },
  en: {
    nav: ["Home", "Features", "Pricing", "Contact"],
    badge: "Pricing",
    title: "Choose your plan",
    sub: "Start free. Scale when you need it.",
    note: "First 20 generations are free without registration · No credit card required",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "Save 20%",
    cta1: "Start free",
    cta2: "Start free trial",
    cta3: "Contact sales",
    forever: "forever",
    perMonth: "per month",
    gens: "generations / month",
    plans: [
      { name:"Free", price:"$0", gens:"20", period:"forever", feats:["Basic Brand Profile","Step 1 only (copy generation)","AI copy (5 proposals)","Library: last 10 pieces","Email support"], featured:false },
      { name:"Professional", price:"$49", gens:"200", period:"per month", feats:["Everything in Free","Full 3-step flow","Visual references","Talent photo in image","Advanced AI Brand Profile","Unlimited library","Priority support"], featured:true },
      { name:"Enterprise", price:"$175", gens:"1,000", period:"per month", feats:["Everything in Professional","Up to 5 active brands","AI content calendar","Performance analytics","Dedicated account manager","Personalized onboarding"], featured:false },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      { q:"Can I cancel at any time?", a:"Yes, you can cancel your subscription at any time with no penalties. Your access continues until the end of the paid period." },
      { q:"What happens if I run out of generations?", a:"You can purchase additional generations or upgrade to a higher plan at any time." },
      { q:"Does it work for any type of brand?", a:"Yes, AiStudioBrand is designed for content creators, coaches, entrepreneurs and any personal brand or digital business." },
      { q:"Can I use the generated content commercially?", a:"Yes, all generated content is yours. You can freely use it on your social media and other channels." },
    ],
  }
};

export default function Pricing() {
  const router = useRouter();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);
  const [openFaq, setOpenFaq] = useState(null);
  const t = content[lang];

  const nav = { display:"flex", alignItems:"center", padding:"0 32px", height:62, borderBottom:"1px solid #F0F0F0", background:"#fff", position:"sticky", top:0, zIndex:100 };
  const priceCard = { background:"#fff", border:"0.5px solid #E8E8E8", borderRadius:16, padding:24, position:"relative" };
  const priceCardFeat = { background:"#fff", border:"2px solid #7950F2", borderRadius:16, padding:24, position:"relative" };
  const priceFeat = { fontSize:13, color:"#555", padding:"5px 0", display:"flex", alignItems:"flex-start", gap:8 };
  const priceBtn = { width:"100%", padding:11, borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginTop:16, border:"1.5px solid #E0E0E0", background:"#fff", color:"#333" };
  const priceBtnP = { width:"100%", padding:11, borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginTop:16, border:"none", background:"#7950F2", color:"#fff" };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"Inter, sans-serif" }}>
      <nav style={nav}>
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:30, height:30, background:"#7950F2", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:500 }}>Ai</div>
          <span style={{ fontSize:15, fontWeight:500, color:"#0A0A0A" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:4, marginLeft:"auto", alignItems:"center" }}>
          <button onClick={() => router.push("/")} style={{ padding:"6px 13px", borderRadius:8, fontSize:13, color:"#555", cursor:"pointer", background:"none", border:"none", fontFamily:"Inter, sans-serif" }}>{lang === "en" ? "Home" : "Inicio"}</button>
          <button onClick={() => router.push("/pricing")} style={{ padding:"6px 13px", borderRadius:8, fontSize:13, color:"#7950F2", cursor:"pointer", background:"#F3F0FF", border:"none", fontFamily:"Inter, sans-serif", fontWeight:500 }}>{lang === "en" ? "Pricing" : "Precios"}</button>
          <button onClick={() => router.push("/contacto")} style={{ padding:"6px 13px", borderRadius:8, fontSize:13, color:"#555", cursor:"pointer", background:"none", border:"none", fontFamily:"Inter, sans-serif" }}>{lang === "en" ? "Contact" : "Contacto"}</button>
          <div style={{ display:"flex", background:"#F5F5F5", borderRadius:8, padding:3, gap:2, marginLeft:8 }}>
            <button onClick={() => { setLang("es"); localStorage.setItem("lang", "es"); }} style={{ padding:"5px 10px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background: lang==="es" ? "#fff" : "transparent", border:"none", fontFamily:"Inter, sans-serif", color: lang==="es" ? "#0A0A0A" : "#888" }}>ES</button>
            <button onClick={() => { setLang("en"); localStorage.setItem("lang", "en"); }} style={{ padding:"5px 10px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background: lang==="en" ? "#fff" : "transparent", border:"none", fontFamily:"Inter, sans-serif", color: lang==="en" ? "#0A0A0A" : "#888" }}>EN</button>
          </div>
          <button onClick={() => router.push("/login")} style={{ padding:"8px 18px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginLeft:4 }}>
            {lang === "es" ? "Empieza gratis" : "Start free"}
          </button>
        </div>
      </nav>

      <div style={{ padding:"64px 32px", textAlign:"center" }}>
        <div style={{ display:"inline-block", background:"#F3F0FF", color:"#5B21B6", fontSize:11, fontWeight:500, padding:"4px 12px", borderRadius:20, marginBottom:12 }}>{t.badge}</div>
        <h1 style={{ fontSize:38, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.03em", marginBottom:10 }}>{t.title}</h1>
        <p style={{ fontSize:15, color:"#666", marginBottom:40 }}>{t.sub}</p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, maxWidth:900, margin:"0 auto" }}>
          {t.plans.map((p, i) => (
            <div key={i} style={p.featured ? priceCardFeat : priceCard}>
              {p.featured && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"#7950F2", color:"#fff", fontSize:11, fontWeight:500, padding:"3px 12px", borderRadius:20, whiteSpace:"nowrap" }}>{lang === "es" ? "Más popular" : "Most popular"}</div>}
              <div style={{ fontSize:12, fontWeight:500, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{p.name}</div>
              <div style={{ fontSize:34, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.04em", marginBottom:4 }}>{p.price}</div>
              <div style={{ fontSize:13, color:"#999", marginBottom:10 }}>{p.period}</div>
              <div style={{ display:"inline-block", background:"#F3F0FF", color:"#5B21B6", fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:20, marginBottom:16 }}>{p.gens} {t.gens}</div>
              <div style={{ height:"0.5px", background:"#F0F0F0", margin:"14px 0" }}></div>
              {p.feats.map((f, j) => (
                <div key={j} style={priceFeat}><span style={{ color:"#40C057", fontSize:13 }}>✓</span> {f}</div>
              ))}
              <button style={p.featured ? priceBtnP : priceBtn} onClick={() => router.push("/login")}>
                {i === 0 ? t.cta1 : i === 1 ? t.cta2 : t.cta3}
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:"#999", marginTop:20 }}>{t.note}</div>
      </div>

      <div style={{ padding:"64px 32px", background:"#FAFAFA" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <h2 style={{ fontSize:26, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.02em", marginBottom:28, textAlign:"center" }}>{t.faqTitle}</h2>
          {t.faqs.map((faq, i) => (
            <div key={i} style={{ background:"#fff", border:"0.5px solid #E8E8E8", borderRadius:12, marginBottom:8, overflow:"hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:"100%", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", fontFamily:"Inter, sans-serif", textAlign:"left" }}>
                <span style={{ fontSize:14, fontWeight:500, color:"#0A0A0A" }}>{faq.q}</span>
                <span style={{ fontSize:18, color:"#999", transform: openFaq === i ? "rotate(45deg)" : "none", transition:"transform 0.15s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding:"0 20px 16px", fontSize:13.5, color:"#666", lineHeight:1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"64px 32px", background:"#7950F2", textAlign:"center" }}>
        <h2 style={{ fontSize:28, fontWeight:500, color:"#fff", letterSpacing:"-0.02em", marginBottom:12 }}>
          {lang === "es" ? "Lista para empezar?" : "Ready to get started?"}
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", marginBottom:28 }}>
          {lang === "es" ? "Únete a las primeras creadoras que están usando AiStudioBrand." : "Join the first creators using AiStudioBrand."}
        </p>
        <button onClick={() => router.push("/login")} style={{ padding:"14px 32px", background:"#fff", color:"#7950F2", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
          {lang === "es" ? "Crear cuenta gratis" : "Create free account"}
        </button>
      </div>

      <div style={{ padding:32, borderTop:"0.5px solid #F0F0F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:26, height:26, background:"#7950F2", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:500 }}>Ai</div>
          <span style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ fontSize:12, color:"#bbb" }}>© 2025 AiStudioBrand.</div>
      </div>
    </div>
  );
}