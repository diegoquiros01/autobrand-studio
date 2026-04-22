"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

const SIDEBAR_W = 260;

const fullToCache = (full) => ({
  id: full.id, nombre: full.nombre || "", descripcion: full.descripcion || "",
  audiencia: full.audiencia || "", tono: full.tono || "",
  idioma: full.idioma || "", categorias: full.categorias || [],
  propuestaValor: full.propuesta_valor || "",
  instagramUrl: full.instagram_url || "", tiktokUrl: full.tiktok_url || "",
  webUrl: full.web_url || "", canvaUrl: full.canva_url || "",
  personalidad: full.personalidad || "", coloresMarca: full.colores_marca || [],
  estiloVisual: full.estilo_visual || "",
  ejemplosCopy: full.ejemplos_copy || [], competidores: full.competidores || [],
});

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [lang, setLang] = useState("es");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dnaSectionOpen, setDnaSectionOpen] = useState(true);

  useEffect(() => {
    // Instant render from localStorage cache
    const cachedBp = localStorage.getItem("brandProfile");
    if (cachedBp) {
      try {
        const bp = JSON.parse(cachedBp);
        if (bp.id && bp.nombre) {
          setActiveBrand({ id: bp.id, nombre: bp.nombre, tono: bp.tono, idioma: bp.idioma });
          setBrands([{ id: bp.id, nombre: bp.nombre, tono: bp.tono, idioma: bp.idioma }]);
        }
      } catch(e) {}
    }

    const init = async () => {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);

      // Load brands via server API
      await loadBrands(session.user.id);
    };
    init();

    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push("/login");
      else { setUser(session?.user); if (session?.user) loadBrands(session.user.id); }
    });

    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);

    const handleBrandChanged = () => reloadBrands();
    window.addEventListener("brandChanged", handleBrandChanged);
    return () => window.removeEventListener("brandChanged", handleBrandChanged);
  }, []);

  const reloadBrands = async () => {
    // Load by activeBrandId — always works, no auth needed
    const bid = localStorage.getItem("activeBrandId");
    if (bid) {
      try {
        const res = await fetch("/api/brands?brandId=" + bid);
        const json = await res.json();
        if (json.brand) {
          const b = json.brand;
          const item = { id: b.id, nombre: b.nombre, tono: b.tono, idioma: b.idioma };
          // Update active brand info without clearing the list
          setActiveBrand(item);
          setBrands(prev => {
            const exists = prev.find(x => x.id === b.id);
            if (exists) return prev.map(x => x.id === b.id ? item : x);
            return [...prev, item];
          });
          localStorage.setItem("brandProfile", JSON.stringify(fullToCache(b)));
        }
      } catch(e) {}
    }
  };

  const loadBrands = async (userId) => {
    try {
      const res = await fetch("/api/brands?userId=" + userId);
      const json = await res.json();
      const list = json.data || [];

      // Only update if we got results — never clear existing brands
      if (list.length === 0) return;

      setBrands(list);

      // Determine active brand
      const savedId = localStorage.getItem("activeBrandId");
      const found = savedId ? list.find(b => b.id === savedId) : null;
      const active = found || list[0];
      setActiveBrand(active);
      localStorage.setItem("activeBrandId", active.id);

      // Load full profile into cache
      const res2 = await fetch("/api/brands?brandId=" + active.id);
      const json2 = await res2.json();
      if (json2.brand) {
        localStorage.setItem("brandProfile", JSON.stringify(fullToCache(json2.brand)));
      }
    } catch(e) { console.warn("loadBrands error:", e); }
  };

  const switchBrand = async (brand) => {
    setActiveBrand(brand);
    localStorage.setItem("activeBrandId", brand.id);
    try {
      const res = await fetch("/api/brands?brandId=" + brand.id);
      const json = await res.json();
      if (json.brand) {
        localStorage.setItem("brandProfile", JSON.stringify(fullToCache(json.brand)));
      }
    } catch(e) {}
    // No dispatchEvent here — state is already updated locally
  };

  const setLanguage = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const en = lang === "en";

  const tonoDisplay = (tono) => Array.isArray(tono) ? tono.join(", ") : tono || "";

  const navItems = [
    { icon: "✦", label: en ? "New piece" : "Nueva pieza", path: "/crear" },
    { icon: "◈", label: en ? "Library" : "Biblioteca", path: "/biblioteca" },
  ];

  const handleLogout = async () => {
    localStorage.removeItem("brandProfile");
    localStorage.removeItem("activeBrandId");
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: 4 }}>
            ☰
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push("/")}>
            <img src="/logo.svg" alt="AiStudioBrand" style={{ height: 28 }} />
          </div>
        </div>

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
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 39, display: "none" }} />}

        {/* ═══ SIDEBAR ═══ */}
        <aside className={sidebarOpen ? "sidebar-open" : ""} style={{
          width: SIDEBAR_W, background: "#0E0E1E",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          padding: "24px 16px", display: "flex", flexDirection: "column",
          position: "fixed", top: 64, bottom: 0, left: 0, zIndex: 40,
          overflowY: "auto", transition: "transform 0.3s ease",
        }}>
          {/* Brand DNA section */}
          <div style={{ marginBottom: 4 }}>
            <button onClick={() => setDnaSectionOpen(!dnaSectionOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                borderRadius: 10, fontSize: 15, fontWeight: pathname === "/adn" ? 700 : 500,
                color: pathname === "/adn" ? "#fff" : "rgba(255,255,255,0.5)",
                background: pathname === "/adn" ? "rgba(121,80,242,0.15)" : "transparent",
                border: pathname === "/adn" ? "1px solid rgba(121,80,242,0.25)" : "1px solid transparent",
                cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s",
              }}>
              <span style={{ fontSize: 17, color: pathname === "/adn" ? "#A78BFA" : "rgba(255,255,255,0.35)" }}>◉</span>
              <span style={{ flex: 1 }}>{en ? "Brand DNA" : "ADN de marca"}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", transition: "transform 0.2s", transform: dnaSectionOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>

            {dnaSectionOpen && (
              <div style={{ paddingLeft: 18, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                {brands.map(b => {
                  const isActive = b.id === activeBrand?.id;
                  return (
                    <button key={b.id} onClick={() => { switchBrand(b); router.push("/adn?brand=" + b.id); setSidebarOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 8, cursor: "pointer", textAlign: "left",
                        background: isActive ? "rgba(121,80,242,0.1)" : "transparent",
                        border: "none", transition: "all 0.2s",
                      }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: isActive ? "linear-gradient(135deg,#7950F2,#A78BFA)" : "rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, color: "#fff",
                      }}>
                        {(b.nombre || "M").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {b.nombre || (en ? "Unnamed" : "Sin nombre")}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
                          {en ? "View & edit" : "Ver y editar"}
                        </div>
                      </div>
                      {isActive && <span style={{ fontSize: 8, color: "#A78BFA" }}>●</span>}
                    </button>
                  );
                })}
                <button onClick={() => { router.push("/adn?new=true"); setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                    borderRadius: 8, cursor: "pointer", textAlign: "left",
                    background: "transparent", border: "none", transition: "all 0.2s",
                  }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, border: "1px dashed rgba(121,80,242,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#A78BFA" }}>+</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#A78BFA" }}>{en ? "New brand" : "Nueva marca"}</span>
                </button>
              </div>
            )}
          </div>

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
                    cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s",
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
