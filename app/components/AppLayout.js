"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

const SIDEBAR_W = 260;

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);
  const [lang, setLang] = useState("es");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push("/login");
      else setUser(session?.user);
    });
    const bp = localStorage.getItem("brandProfile");
    if (bp) setBrandProfile(JSON.parse(bp));
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);

  const setLanguage = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const en = lang === "en";

  const navItems = [
    { icon:"◉", label: en ? "Brand DNA" : "ADN de marca", path:"/adn" },
    { icon:"✦", label: en ? "New piece" : "Nueva pieza", path:"/crear" },
    { icon:"◈", label: en ? "Library" : "Biblioteca", path:"/biblioteca" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A1A", display:"flex", flexDirection:"column" }}>
      {/* Background glows */}
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:600, height:600, background:"radial-gradient(circle, rgba(121,80,242,0.06) 0%, transparent 70%)", filter:"blur(80px)", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-20%", left:"-10%", width:400, height:400, background:"radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)", filter:"blur(60px)", zIndex:0, pointerEvents:"none" }} />

      {/* ═══ HEADER PRINCIPAL ═══ */}
      <nav style={{ display:"flex", alignItems:"center", padding:"0 24px", height:56, borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(10,10,26,0.85)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", position:"fixed", top:0, left:0, right:0, zIndex:50 }}>
        {/* Left: hamburger (mobile) + logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display:"none", background:"none", border:"none", color:"rgba(255,255,255,0.6)", fontSize:20, cursor:"pointer", padding:4 }}>
            ☰
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
            <div style={{ width:30, height:30, background:"linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:11, boxShadow:"0 2px 10px rgba(121,80,242,0.35)" }}>Ai</div>
            <span style={{ fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-0.03em" }}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</span>
          </div>
        </div>

        {/* Right: links + lang + avatar */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={() => router.push("/pricing")} style={{ padding:"6px 14px", background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:500, cursor:"pointer", borderRadius:8 }}>
            {en ? "Pricing" : "Precios"}
          </button>
          <button onClick={() => router.push("/contacto")} style={{ padding:"6px 14px", background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:500, cursor:"pointer", borderRadius:8 }}>
            {en ? "Contact" : "Contacto"}
          </button>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:7, padding:2, gap:1, marginLeft:4 }}>
            <button onClick={() => setLanguage("es")} style={{ padding:"4px 9px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", background: lang === "es" ? "#fff" : "transparent", border:"none", color: lang === "es" ? "#0A0A0A" : "rgba(255,255,255,0.35)" }}>ES</button>
            <button onClick={() => setLanguage("en")} style={{ padding:"4px 9px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", background: lang === "en" ? "#fff" : "transparent", border:"none", color: lang === "en" ? "#0A0A0A" : "rgba(255,255,255,0.35)" }}>EN</button>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginLeft:4, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</div>
          <div className="link-hover" onClick={() => router.push("/cuenta")}
            style={{ width:32, height:32, borderRadius:"50%", background:"rgba(121,80,242,0.15)", border:"1px solid rgba(121,80,242,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#A78BFA", fontWeight:700, cursor:"pointer", transition:"all 0.2s", flexShrink:0 }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ═══ BODY: Sidebar + Main ═══ */}
      <div style={{ display:"flex", flex:1, marginTop:56, position:"relative", zIndex:1 }}>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:39, display:"none" }} />}

        {/* SIDEBAR */}
        <aside className={sidebarOpen ? "sidebar-open" : ""} style={{ width:SIDEBAR_W, background:"#090916", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"20px 14px", display:"flex", flexDirection:"column", position:"fixed", top:56, bottom:0, left:0, zIndex:40, overflowY:"auto", transition:"transform 0.3s ease" }}>
          {brandProfile && (
            <div className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:20, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.2s" }} onClick={() => router.push("/adn")}>
              <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#7950F2,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 }}>
                {(brandProfile.nombre || "M").charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{brandProfile.nombre || (en ? "Your brand" : "Tu marca")}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>
                  {[brandProfile.tono, brandProfile.idioma].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {navItems.map(item => (
              <button key={item.path} onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                className="link-hover"
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderRadius:8, fontSize:13, fontWeight: pathname === item.path ? 600 : 400, color: pathname === item.path ? "#A78BFA" : "rgba(255,255,255,0.5)", background: pathname === item.path ? "rgba(121,80,242,0.1)" : "transparent", border:"none", cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.2s" }}>
                <span style={{ fontSize:15, opacity: pathname === item.path ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:2 }}>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"12px 0" }} />
            <button onClick={() => router.push("/cuenta")} className="link-hover"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderRadius:8, fontSize:12, color:"rgba(255,255,255,0.35)", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", width:"100%" }}>
              <span style={{ fontSize:14 }}>◎</span> {en ? "My account" : "Mi cuenta"}
            </button>
            <button onClick={handleLogout} className="link-hover"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderRadius:8, fontSize:12, color:"rgba(255,100,100,0.45)", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", width:"100%" }}>
              <span style={{ fontSize:14 }}>→</span> {en ? "Log out" : "Salir"}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="app-main" style={{ flex:1, marginLeft:SIDEBAR_W, minHeight:"calc(100vh - 56px)", position:"relative" }}>
          {children}
        </main>
      </div>

      {/* ═══ RESPONSIVE STYLES ═══ */}
      <style>{`
        .link-hover:hover { background: rgba(121,80,242,0.08) !important; color: #A78BFA !important; }
        .card-hover:hover { border-color: rgba(121,80,242,0.3) !important; }

        @media (max-width: 768px) {
          .sidebar-toggle { display: flex !important; }
          aside { transform: translateX(-100%); }
          aside.sidebar-open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
          .app-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
