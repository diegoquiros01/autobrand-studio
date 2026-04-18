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
    { icon: "◉", label: en ? "Brand DNA" : "ADN de marca", path: "/adn" },
    { icon: "✦", label: en ? "New piece" : "Nueva pieza", path: "/crear" },
    { icon: "◈", label: en ? "Library" : "Biblioteca", path: "/biblioteca" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A1A", display: "flex", flexDirection: "column" }}>

      {/* ═══ HEADER ═══ */}
      <nav style={{
        display: "flex", alignItems: "center", padding: "0 28px", height: 64,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(10,10,26,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      }}>
        {/* Left: hamburger + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: 4 }}>
            ☰
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, boxShadow: "0 2px 12px rgba(121,80,242,0.4)" }}>Ai</div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>Ai<span style={{ color: "#A78BFA" }}>Studio</span>Brand</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => router.push("/pricing")} style={{ padding: "8px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8, transition: "color 0.2s" }}>
            {en ? "Pricing" : "Precios"}
          </button>
          <button onClick={() => router.push("/contacto")} style={{ padding: "8px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8, transition: "color 0.2s" }}>
            {en ? "Contact" : "Contacto"}
          </button>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 3, gap: 2, marginLeft: 4 }}>
            <button onClick={() => setLanguage("es")} style={{ padding: "5px 11px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: lang === "es" ? "#fff" : "transparent", border: "none", color: lang === "es" ? "#0A0A0A" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>ES</button>
            <button onClick={() => setLanguage("en")} style={{ padding: "5px 11px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: lang === "en" ? "#fff" : "transparent", border: "none", color: lang === "en" ? "#0A0A0A" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>EN</button>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <div onClick={() => router.push("/cuenta")}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7950F2,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 700, cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 10px rgba(121,80,242,0.3)" }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ═══ BODY ═══ */}
      <div style={{ display: "flex", flex: 1, marginTop: 64, position: "relative", zIndex: 1 }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 39, display: "none" }} />}

        {/* ═══ SIDEBAR ═══ */}
        <aside className={sidebarOpen ? "sidebar-open" : ""} style={{
          width: SIDEBAR_W, background: "#0E0E1E",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          padding: "24px 16px", display: "flex", flexDirection: "column",
          position: "fixed", top: 64, bottom: 0, left: 0, zIndex: 40,
          overflowY: "auto", transition: "transform 0.3s ease",
        }}>
          {/* Brand card */}
          {brandProfile && (
            <div onClick={() => router.push("/adn")} style={{
              background: "rgba(121,80,242,0.08)", border: "1px solid rgba(121,80,242,0.2)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 24, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7950F2,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {(brandProfile.nombre || "M").charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brandProfile.nombre || (en ? "Your brand" : "Tu marca")}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {[brandProfile.tono, brandProfile.idioma].filter(Boolean).join(" · ") || (en ? "Set up DNA" : "Configura ADN")}
                </div>
              </div>
            </div>
          )}

          {/* Nav items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(item => {
              const active = pathname === item.path;
              return (
                <button key={item.path} onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                    borderRadius: 10, fontSize: 15, fontWeight: active ? 700 : 500,
                    color: active ? "#fff" : "rgba(255,255,255,0.5)",
                    background: active ? "rgba(121,80,242,0.15)" : "transparent",
                    border: active ? "1px solid rgba(121,80,242,0.25)" : "1px solid transparent",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "all 0.2s",
                  }}>
                  <span style={{ fontSize: 17, color: active ? "#A78BFA" : "rgba(255,255,255,0.35)" }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Bottom */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "16px 0" }} />
            <button onClick={() => router.push("/cuenta")}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 10, fontSize: 14, color: "rgba(255,255,255,0.45)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s" }}>
              <span style={{ fontSize: 16 }}>◎</span> {en ? "My account" : "Mi cuenta"}
            </button>
            <button onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 10, fontSize: 14, color: "rgba(255,100,100,0.6)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s" }}>
              <span style={{ fontSize: 16 }}>→</span> {en ? "Log out" : "Salir"}
            </button>
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="app-main" style={{ flex: 1, marginLeft: SIDEBAR_W, minHeight: "calc(100vh - 64px)", position: "relative" }}>
          {children}
        </main>
      </div>

      {/* Responsive */}
      <style>{`
        nav button:hover { color: rgba(255,255,255,0.9) !important; }
        aside button:hover { background: rgba(121,80,242,0.1) !important; color: #A78BFA !important; }
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
