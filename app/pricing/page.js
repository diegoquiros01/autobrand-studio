"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import MarketingNav from "../components/MarketingNav";

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
    cta2: "Suscribirse $49/mes",
    cta3: "Suscribirse $175/mes",
    forever: "para siempre",
    perMonth: "por mes",
    gens: "generaciones / mes",
    plans: [
      { name:"Free", price:"$0", gens:"20", period:"para siempre", feats:["Brand Profile básico","Solo paso 1 de generación","Copy con IA (5 propuestas)","Biblioteca: últimas 10 piezas","Soporte por email"], featured:false },
      { name:"Professional", price:"$49", gens:"200", period:"por mes", feats:["Todo lo del plan Free","Flujo completo 3 pasos","Referencias visuales","Foto de talento en imagen","Brand Profile avanzado con IA","Biblioteca ilimitada","Soporte prioritario"], featured:true },
      { name:"Enterprise", price:"$175", gens:"1,000", period:"por mes", feats:["Todo lo del Free","Flujo completo 3 pasos","Referencias visuales","Foto de talento en imagen","Brand Profile avanzado con IA","Biblioteca ilimitada","Soporte prioritario"], featured:false },
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
    cta2: "Subscribe $49/mo",
    cta3: "Subscribe $175/mo",
    forever: "forever",
    perMonth: "per month",
    gens: "generations / month",
    plans: [
      { name:"Free", price:"$0", gens:"20", period:"forever", feats:["Basic Brand Profile","Step 1 only (copy generation)","AI copy (5 proposals)","Library: last 10 pieces","Email support"], featured:false },
      { name:"Professional", price:"$49", gens:"200", period:"per month", feats:["Everything in Free","Full 3-step flow","Visual references","Talent photo in image","Advanced AI Brand Profile","Unlimited library","Priority support"], featured:true },
      { name:"Enterprise", price:"$175", gens:"1,000", period:"per month", feats:["Everything in Free","Full 3-step flow","Visual references","Talent photo in image","Advanced AI Brand Profile","Unlimited library","Priority support"], featured:false },
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
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planName) => {
    setLoadingPlan(planName);
    try {
      const priceId = planName === "Professional"
        ? "price_1TGRHAFZXtgfLmPe79t0RPn6"
        : "price_1TGRHYFZXtgfLmPealbgoQLu";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: "", email: "" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else console.error("No URL from Stripe:", data);
    } catch(e) {
      console.error("Checkout error:", e);
    }
    setLoadingPlan(null);
  };
  const t = content[lang];

  const setLanguage = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const priceCard = { background:"#16162d", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:24, position:"relative" };
  const priceCardFeat = { backgroundImage:"linear-gradient(#16162d, #16162d), linear-gradient(135deg, #7950F2 0%, #A78BFA 100%)", backgroundOrigin:"border-box", backgroundClip:"padding-box, border-box", boxShadow:"0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(121,80,242,0.1)", transform:"scale(1.05)", zIndex:2, border:"1px solid transparent", borderRadius:24, padding:24, position:"relative" };
  const priceFeat = { fontSize:13, color:"rgba(255,255,255,0.7)", padding:"5px 0", display:"flex", alignItems:"flex-start", gap:8 };
  const priceBtn = { width:"100%", padding:11, borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", marginTop:16, border:"1.5px solid #E0E0E0", background:"#111122", color:"rgba(255,255,255,0.8)", boxShadow:"0 4px 14px rgba(121,80,242,0.4)" };
  const priceBtnP = { width:"100%", padding:11, borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", marginTop:16, border:"none", background:"#7950F2", color:"#fff", boxShadow:"0 4px 14px rgba(121,80,242,0.4)" };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A1A" }}>
      <MarketingNav lang={lang} setLang={setLanguage} activePage="pricing" />

      {/* Hero with gradient mesh */}
      <div style={{ position:"relative", overflow:"hidden", padding:"80px 32px 60px", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, #1a0a2e 0%, #0A0A1A 100%)" }} />
        <div style={{ position:"absolute", top:"-15%", left:"25%", width:"55%", height:"55%", borderRadius:"50%", background:"radial-gradient(circle, rgba(121,80,242,0.5) 0%, transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"15%", right:"0%", width:"45%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(230,73,128,0.3) 0%, transparent 70%)", filter:"blur(70px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"5%", width:"40%", height:"40%", borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-block", background:"rgba(121,80,242,0.15)", border:"1px solid rgba(121,80,242,0.2)", color:"#A78BFA", fontSize:11, fontWeight:600, padding:"5px 14px", borderRadius:20, marginBottom:16 }}>{t.badge}</div>
          <h1 style={{ fontSize:42, fontWeight:800, color:"#fff", letterSpacing:"-0.04em", marginBottom:10 }}>{t.title}</h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", marginBottom:40 }}>{t.sub}</p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, maxWidth:900, margin:"0 auto" }}>
          {t.plans.map((p, i) => (
            <div key={i} style={p.featured ? priceCardFeat : priceCard}>
              {p.featured && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"#7950F2", color:"#fff", fontSize:11, fontWeight:500, padding:"3px 12px", borderRadius:20, whiteSpace:"nowrap" }}>{lang === "es" ? "Más popular" : "Most popular"}</div>}
              <div style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{p.name}</div>
              <div style={{ fontSize:34, fontWeight:500, color:"#fff", letterSpacing:"-0.04em", marginBottom:4 }}>{p.price}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:10 }}>{p.period}</div>
              <div style={{ display:"inline-block", background:"rgba(121,80,242,0.15)", color:"#A78BFA", fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:20, marginBottom:16 }}>{p.gens} {t.gens}</div>
              <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"14px 0" }}></div>
              {p.feats.map((f, j) => (
                <div key={j} style={priceFeat}><span style={{ color:"#40C057", fontSize:13 }}>✓</span> {f}</div>
              ))}
              <button className="btn-primary" style={p.featured ? priceBtnP : priceBtn} onClick={() => i === 0 ? router.push("/login") : handleCheckout(p.name)} disabled={loadingPlan === p.name}>
                {loadingPlan === p.name ? "..." : i === 0 ? t.cta1 : i === 1 ? t.cta2 : t.cta3}
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:20 }}>{t.note}</div>
        </div>
      </div>

      <div style={{ padding:"64px 32px" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <h2 style={{ fontSize:26, fontWeight:500, color:"#fff", letterSpacing:"-0.02em", marginBottom:28, textAlign:"center" }}>{t.faqTitle}</h2>
          {t.faqs.map((faq, i) => (
            <div key={i} style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, marginBottom:8, overflow:"hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:"100%", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>{faq.q}</span>
                <span style={{ fontSize:18, color:"rgba(255,255,255,0.4)", transform: openFaq === i ? "rotate(45deg)" : "none", transition:"transform 0.15s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding:"0 20px 16px", fontSize:13.5, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"64px 32px", background:"linear-gradient(135deg, rgba(121,80,242,0.12), rgba(167,139,250,0.06))", textAlign:"center", margin:"0 32px", borderRadius:24, border:"1px solid rgba(121,80,242,0.15)" }}>
        <h2 style={{ fontSize:28, fontWeight:800, color:"#fff", letterSpacing:"-0.03em", marginBottom:12 }}>
          {lang === "es" ? "Lista para empezar?" : "Ready to get started?"}
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", marginBottom:28 }}>
          {lang === "es" ? "Únete a las primeras creadoras que están usando AiStudioBrand." : "Join the first creators using AiStudioBrand."}
        </p>
        <button onClick={() => router.push("/login?tab=register")} style={{ padding:"16px 36px", background:"linear-gradient(135deg,#7950F2,#A78BFA)", color:"#fff", border:"none", borderRadius:100, fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 30px rgba(121,80,242,0.4)" }}>
          {lang === "es" ? "Crear cuenta gratis" : "Create free account"}
        </button>
      </div>

      <footer style={{ padding:"24px 32px", marginTop:40, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <img src="/logo.svg" alt="" style={{ height: 22 }} />
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>AiStudioBrand</span>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.2)" }}>© 2025 AiStudioBrand.</div>
      </footer>
    </div>
  );
}
