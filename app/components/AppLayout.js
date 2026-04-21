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
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

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
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, boxShadow: "0 2px 12px rgba(121,80,242,0.4)" }}>Ai</div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>Ai<span style={{ color: "#A78BFA" }}>Studio</span>Brand</span>
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
          {/* Brand Switcher */}
          <div style={{ marginBottom: 16, position: "relative" }}>
            {brands.length > 0 && activeBrand ? (
              <button
                onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: 16, width: "100%",
                  background: "rgba(121,80,242,0.06)",
                  border: "1px solid rgba(121,80,242,0.15)",
                  borderRadius: 14, cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg,#7950F2,#A78BFA)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "#fff",
                  boxShadow: "0 2px 10px rgba(121,80,242,0.3)",
                }}>
                  {(activeBrand.nombre || "M").charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {activeBrand.nombre || (en ? "Unnamed" : "Sin nombre")}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {[tonoDisplay(activeBrand.tono), activeBrand.idioma].filter(Boolean).join(" · ") || (en ? "No details" : "Sin detalles")}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0,
                  transition: "transform 0.2s", transform: brandDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>▼</span>
              </button>
            ) : (
              <button
                onClick={() => { router.push("/adn?new=true"); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: 20, width: "100%",
                  background: "transparent",
                  border: "2px dashed rgba(121,80,242,0.3)",
                  borderRadius: 14, cursor: "pointer", textAlign: "center",
                  transition: "all 0.2s",
                }}>
                <span style={{ fontSize: 18, color: "#A78BFA" }}>+</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#A78BFA" }}>
                  {en ? "Create your first brand" : "Crea tu primera marca"}
                </span>
              </button>
            )}

            {/* Brand Dropdown */}
            {brandDropdownOpen && (
              <>
                <div onClick={() => setBrandDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
                  background: "rgba(22,22,45,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  padding: "8px 0",
                  animation: "brandDropdownFadeIn 0.15s ease-out",
                }}>
                  <div style={{ maxHeight: 200, overflowY: "auto", padding: "0 6px" }}>
                    {brands.map(b => {
                      const isActive = b.id === activeBrand?.id;
                      return (
                        <button key={b.id} onClick={() => { switchBrand(b); setBrandDropdownOpen(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", width: "100%",
                            borderRadius: 10, cursor: "pointer", textAlign: "left",
                            background: isActive ? "rgba(121,80,242,0.12)" : "transparent",
                            border: "none", transition: "all 0.15s",
                          }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                            background: isActive ? "linear-gradient(135deg,#7950F2,#A78BFA)" : "rgba(255,255,255,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 800, color: "#fff",
                          }}>
                            {(b.nombre || "M").charAt(0).toUpperCase()}
                          </div>
                          <span style={{
                            flex: 1, fontSize: 13, fontWeight: isActive ? 600 : 400,
                            color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {b.nombre || (en ? "Unnamed" : "Sin nombre")}
                          </span>
                          {isActive && <span style={{ fontSize: 14, color: "#A78BFA", flexShrink: 0 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 12px" }} />
                  <div style={{ padding: "0 6px" }}>
                    <button onClick={() => { router.push("/adn"); setBrandDropdownOpen(false); setSidebarOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", width: "100%",
                        borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: "transparent", border: "none", transition: "all 0.15s",
                      }}>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>✎</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{en ? "Manage brands" : "Gestionar marcas"}</span>
                    </button>
                    <button onClick={() => { router.push("/adn?new=true"); setBrandDropdownOpen(false); setSidebarOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", width: "100%",
                        borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: "transparent", border: "none", transition: "all 0.15s",
                      }}>
                      <span style={{ fontSize: 14, color: "#A78BFA" }}>+</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#A78BFA" }}>{en ? "New brand" : "Nueva marca"}</span>
                    </button>
                  </div>
                </div>
              </>
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
        @keyframes brandDropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
