"use client";
import { useRouter } from "next/navigation";

export default function MarketingNav({ lang, setLang, activePage }) {
  const router = useRouter();
  const en = lang === "en";

  const links = [
    { key: "home", label: en ? "Home" : "Inicio", path: "/" },
    { key: "pricing", label: en ? "Pricing" : "Precios", path: "/pricing" },
    { key: "contact", label: en ? "Contact" : "Contacto", path: "/contacto" },
  ];

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
        <img src="/logo.svg" alt="AiStudioBrand" style={{ height: 32 }} />
      </div>

      {/* Center links */}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {links.map(link => (
          <button
            key={link.key}
            onClick={() => router.push(link.path)}
            style={link.key === activePage ? linkActive : linkDefault}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right: lang + CTA */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={langToggle}>
          <button onClick={() => { setLang("es"); localStorage.setItem("lang", "es"); }} style={lang === "es" ? langActive : langBtn}>ES</button>
          <button onClick={() => { setLang("en"); localStorage.setItem("lang", "en"); }} style={lang === "en" ? langActive : langBtn}>EN</button>
        </div>
        <button onClick={() => router.push("/login")} style={signinBtn}>{en ? "Log in" : "Entrar"}</button>
        <button onClick={() => router.push("/login?tab=register")} style={ctaBtn}>{en ? "Start free" : "Empieza gratis"}</button>
      </div>
    </nav>
  );
}

const navStyle = {
  display:"flex", alignItems:"center", justifyContent:"space-between",
  padding:"0 32px", height:64, position:"sticky", top:0, zIndex:100,
  background:"rgba(10,10,26,0.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
  borderBottom:"1px solid rgba(255,255,255,0.06)",
};

const linkDefault = {
  padding:"7px 16px", borderRadius:8, fontSize:14, fontWeight:500,
  color:"rgba(255,255,255,0.75)", cursor:"pointer", background:"none",
  border:"none", transition:"all 0.2s",
};

const linkActive = {
  padding:"7px 16px", borderRadius:8, fontSize:14, fontWeight:600,
  color:"#7950F2", cursor:"pointer", background:"rgba(121,80,242,0.1)",
  border:"1px solid rgba(121,80,242,0.15)",
};

const langToggle = {
  display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:7,
  padding:2, gap:1,
};

const langBtn = {
  padding:"5px 10px", borderRadius:5, fontSize:11, fontWeight:600,
  cursor:"pointer", background:"transparent", border:"none",
  color:"rgba(255,255,255,0.35)",
};

const langActive = {
  padding:"5px 10px", borderRadius:5, fontSize:11, fontWeight:600,
  cursor:"pointer", background:"#fff", border:"none", color:"#0A0A0A",
};

const signinBtn = {
  padding:"7px 16px", background:"none", border:"1px solid rgba(255,255,255,0.12)",
  borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:500,
  cursor:"pointer",
};

const ctaBtn = {
  padding:"8px 20px", background:"#7950F2", border:"none", borderRadius:8,
  color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
  boxShadow:"0 2px 12px rgba(121,80,242,0.4)",
};
