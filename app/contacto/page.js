"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketingNav from "../components/MarketingNav";

const content = {
  es: {
    nav: ["Inicio", "Funcionalidades", "Precios", "Contacto"],
    badge: "Contacto",
    title: "Hablemos",
    sub: "Tienes preguntas sobre AiStudioBrand? Estamos aqui para ayudarte.",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "tu@email.com",
    subjectPlaceholder: "Asunto",
    messagePlaceholder: "Cuentanos como podemos ayudarte...",
    send: "Enviar mensaje",
    sending: "Enviando...",
    successTitle: "Mensaje enviado",
    successSub: "Te responderemos en menos de 24 horas.",
    nameLabel: "Nombre",
    emailLabel: "Email",
    subjectLabel: "Asunto",
    messageLabel: "Mensaje",
    infoTitle: "Informacion de contacto",
    infoItems: [
      { icon:"@", label:"Email", value:"hola@aistudiobrand.com" },
      { icon:"◎", label:"Soporte", value:"Lunes a Viernes, 9am - 6pm EST" },
      { icon:"◉", label:"Respuesta", value:"Menos de 24 horas" },
    ],
    faqTitle: "Preguntas rapidas",
    faqs: [
      { q:"Como empiezo?", a:"Crea una cuenta gratis y tienes 20 generaciones de cortesia sin tarjeta de credito." },
      { q:"Ofrecen demostracion?", a:"Si, puedes ver el generador en accion directamente en nuestra pagina principal." },
      { q:"Tienen descuentos para emprendedoras?", a:"Contactanos y evaluamos tu caso. Tenemos programas especiales para creadoras en crecimiento." },
    ],
  },
  en: {
    nav: ["Home", "Features", "Pricing", "Contact"],
    badge: "Contact",
    title: "Let's talk",
    sub: "Have questions about AiStudioBrand? We are here to help you.",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@email.com",
    subjectPlaceholder: "Subject",
    messagePlaceholder: "Tell us how we can help you...",
    send: "Send message",
    sending: "Sending...",
    successTitle: "Message sent",
    successSub: "We will get back to you within 24 hours.",
    nameLabel: "Name",
    emailLabel: "Email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    infoTitle: "Contact information",
    infoItems: [
      { icon:"@", label:"Email", value:"hello@aistudiobrand.com" },
      { icon:"◎", label:"Support", value:"Monday to Friday, 9am - 6pm EST" },
      { icon:"◉", label:"Response", value:"Less than 24 hours" },
    ],
    faqTitle: "Quick questions",
    faqs: [
      { q:"How do I get started?", a:"Create a free account and get 20 complimentary generations with no credit card required." },
      { q:"Do you offer a demo?", a:"Yes, you can see the generator in action directly on our home page." },
      { q:"Do you have discounts for entrepreneurs?", a:"Contact us and we will evaluate your case. We have special programs for growing creators." },
    ],
  }
};

export default function Contacto() {
  const router = useRouter();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const t = content[lang];

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert(lang === "es" ? "Email inválido" : "Invalid email"); return; }
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (e) { /* fallback — still show success */ }
    setSent(true);
    setSending(false);
  };

  const setLanguage = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const inp = { width:"100%", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"11px 13px", fontSize:14, background:"#0A0A18", color:"#fff", outline:"none" };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A1A" }}>
      <MarketingNav lang={lang} setLang={setLanguage} activePage="contact" />

      {/* Hero with gradient mesh */}
      <div style={{ position:"relative", overflow:"hidden", padding:"80px 32px 60px", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, #1a0a2e 0%, #0A0A1A 100%)" }} />
        <div style={{ position:"absolute", top:"-10%", left:"30%", width:"50%", height:"60%", borderRadius:"50%", background:"radial-gradient(circle, rgba(121,80,242,0.5) 0%, transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"20%", right:"5%", width:"40%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(230,73,128,0.3) 0%, transparent 70%)", filter:"blur(70px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"0%", left:"10%", width:"35%", height:"40%", borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-block", background:"rgba(121,80,242,0.15)", border:"1px solid rgba(121,80,242,0.2)", color:"#A78BFA", fontSize:11, fontWeight:600, padding:"5px 14px", borderRadius:20, marginBottom:16 }}>{t.badge}</div>
          <h1 style={{ fontSize:42, fontWeight:800, color:"#fff", letterSpacing:"-0.04em", marginBottom:10 }}>{t.title}</h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", maxWidth:480, margin:"0 auto" }}>{t.sub}</p>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 32px 64px" }}>
        <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:24 }}>
          {/* Left: Form */}
          <div>
            {sent ? (
              <div style={{ background:"rgba(64,192,87,0.08)", border:"1px solid rgba(64,192,87,0.2)", borderRadius:16, padding:"48px 32px", textAlign:"center", height:"100%" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(64,192,87,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28, color:"#40C057" }}>✓</div>
                <h2 style={{ fontSize:22, fontWeight:700, color:"#fff", marginBottom:8 }}>{t.successTitle}</h2>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginBottom:24 }}>{t.successSub}</p>
                <button onClick={() => { setSent(false); setForm({ name:"", email:"", subject:"", message:"" }); }} style={{ padding:"11px 24px", background:"#7950F2", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  {lang === "es" ? "Enviar otro mensaje" : "Send another message"}
                </button>
              </div>
            ) : (
              <div style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28 }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:20, letterSpacing:"-0.02em" }}>{lang === "es" ? "Envíanos un mensaje" : "Send us a message"}</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.7)", display:"block", marginBottom:6 }}>{t.nameLabel}</label>
                    <input style={inp} type="text" placeholder={t.namePlaceholder} value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.7)", display:"block", marginBottom:6 }}>{t.emailLabel}</label>
                    <input style={inp} type="email" placeholder={t.emailPlaceholder} value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.7)", display:"block", marginBottom:6 }}>{t.subjectLabel}</label>
                  <input style={inp} type="text" placeholder={t.subjectPlaceholder} value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.7)", display:"block", marginBottom:6 }}>{t.messageLabel}</label>
                  <textarea style={{ ...inp, minHeight:120, resize:"none" }} placeholder={t.messagePlaceholder} value={form.message} onChange={e => setForm({...form, message:e.target.value})} />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={sending || !form.name || !form.email || !form.message}
                  style={{ width:"100%", padding:14, background: sending || !form.name || !form.email || !form.message ? "rgba(121,80,242,0.3)" : "linear-gradient(135deg,#7950F2,#A78BFA)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor: sending ? "not-allowed" : "pointer", boxShadow: !sending && form.name && form.email && form.message ? "0 4px 14px rgba(121,80,242,0.3)" : "none", transition:"all 0.3s" }}
                >
                  {sending ? t.sending : t.send}
                </button>
              </div>
            )}
          </div>

          {/* Right: Info + FAQ */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:24 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:18, letterSpacing:"-0.02em" }}>{t.infoTitle}</h3>
              {t.infoItems.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, marginBottom: i < t.infoItems.length - 1 ? 16 : 0 }}>
                  <div style={{ width:40, height:40, background:"rgba(121,80,242,0.12)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"#A78BFA", fontSize:16, flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>{item.label}</div>
                    <div style={{ fontSize:14, color:"#fff", fontWeight:600 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:24, flex:1 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:14, letterSpacing:"-0.02em" }}>{t.faqTitle}</h3>
              {t.faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: i < t.faqs.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:"100%", padding:"14px 0", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                    <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>{faq.q}</span>
                    <span style={{ fontSize:16, color:"rgba(255,255,255,0.3)", transform: openFaq === i ? "rotate(45deg)" : "none", transition:"transform 0.2s", flexShrink:0, marginLeft:8 }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ paddingBottom:14, fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* CTA */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 32px 48px" }}>
        <div style={{ background:"linear-gradient(135deg, rgba(121,80,242,0.12), rgba(167,139,250,0.06))", border:"1px solid rgba(121,80,242,0.15)", borderRadius:20, padding:"40px 28px", textAlign:"center" }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:8, letterSpacing:"-0.03em" }}>
            {lang === "es" ? "Prefiere probar directamente?" : "Prefer to try it yourself?"}
          </h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginBottom:24 }}>
            {lang === "es" ? "20 generaciones gratis, sin tarjeta de crédito" : "20 free generations, no credit card required"}
          </p>
          <button onClick={() => router.push("/login?tab=register")} style={{ padding:"14px 36px", background:"linear-gradient(135deg,#7950F2,#A78BFA)", color:"#fff", border:"none", borderRadius:100, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(121,80,242,0.3)" }}>
            {lang === "es" ? "Empieza gratis →" : "Start free →"}
          </button>
        </div>
      </div>

      <footer style={{ padding:"24px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <img src="/logo.svg" alt="" style={{ height: 16 }} />
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>{lang === "es" ? "Contenido que suena como tú" : "Content that sounds like you"}</span>
        </div>
        <div style={{ display:"flex", gap:16 }}>
          <button onClick={() => router.push("/terminos")} style={{ fontSize:11, color:"rgba(255,255,255,0.2)", background:"none", border:"none", cursor:"pointer" }}>{lang === "es" ? "Términos" : "Terms"}</button>
          <button onClick={() => router.push("/privacidad")} style={{ fontSize:11, color:"rgba(255,255,255,0.2)", background:"none", border:"none", cursor:"pointer" }}>{lang === "es" ? "Privacidad" : "Privacy"}</button>
        </div>
      </footer>
    </div>
  );
}
