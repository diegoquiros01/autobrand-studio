"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { theme } from './adn/adn-theme';

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

/* ── Inline SVG icons for nav ── */
const IconDna = ({ color, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2.5 2">
    <circle cx="8" cy="8" r="6" />
  </svg>
);
const IconSparkle = ({ color, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1v14M1 8h14M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </svg>
);
const IconGrid = ({ color, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [lang, setLang] = useState("es");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dnaSectionOpen, setDnaSectionOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      await loadBrandsFromAny(session.user.id);
    };
    init();

    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.push("/login");
      else setUser(session?.user);
    });

    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);

    const handleBrandChanged = () => loadBrandsFromAny();
    window.addEventListener("brandChanged", handleBrandChanged);
    return () => window.removeEventListener("brandChanged", handleBrandChanged);
  }, []);

  const loadBrandsFromAny = async (userId) => {
    try {
      const bid = localStorage.getItem("activeBrandId");
      let activeBrandData = null;
      if (bid) {
        const res = await fetch("/api/brands?brandId=" + bid);
        const json = await res.json();
        if (json.brand) {
          activeBrandData = json.brand;
          userId = userId || json.brand.user_id;
        }
      }

      let allBrands = [];
      if (userId) {
        const res = await fetch("/api/brands?userId=" + userId);
        const json = await res.json();
        allBrands = json.data || [];
      }

      if (allBrands.length > 0) {
        setBrands(allBrands);
        const active = activeBrandData
          ? allBrands.find(b => b.id === activeBrandData.id) || allBrands[0]
          : allBrands[0];
        setActiveBrand(active);
        localStorage.setItem("activeBrandId", active.id);
      } else if (activeBrandData) {
        const item = { id: activeBrandData.id, nombre: activeBrandData.nombre, tono: activeBrandData.tono, idioma: activeBrandData.idioma };
        setBrands([item]);
        setActiveBrand(item);
      }

      if (activeBrandData) {
        localStorage.setItem("brandProfile", JSON.stringify(fullToCache(activeBrandData)));
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
  };

  const setLanguage = (l) => { setLang(l); localStorage.setItem("lang", l); };
  const en = lang === "en";

  const tonoDisplay = (tono) => Array.isArray(tono) ? tono.join(", ") : tono || "";

  const navItems = [
    { icon: "sparkle", label: en ? "New piece" : "Nueva pieza", path: "/crear" },
    { icon: "grid", label: en ? "Library" : "Biblioteca", path: "/biblioteca" },
  ];

  const deleteBrand = async (brand) => {
    if (!confirm(en ? `Delete "${brand.nombre}"? This cannot be undone.` : `¿Eliminar "${brand.nombre}"? No se puede deshacer.`)) return;
    try {
      const res = await fetch("/api/brands?brandId=" + brand.id, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setBrands(prev => prev.filter(b => b.id !== brand.id));
        if (activeBrand?.id === brand.id) {
          const remaining = brands.filter(b => b.id !== brand.id);
          if (remaining.length > 0) {
            setActiveBrand(remaining[0]);
            localStorage.setItem("activeBrandId", remaining[0].id);
          } else {
            setActiveBrand(null);
            localStorage.removeItem("activeBrandId");
            localStorage.removeItem("brandProfile");
          }
        }
      }
    } catch(e) { console.warn("Delete error:", e); }
  };

  const handleLogout = async () => {
    localStorage.removeItem("brandProfile");
    localStorage.removeItem("activeBrandId");
    await supabase.auth.signOut();
    router.push("/");
  };

  // Breadcrumb helper
  const pageName = (() => {
    if (pathname === "/adn") return en ? "Brand DNA" : "ADN de marca";
    if (pathname === "/crear") return en ? "New piece" : "Nueva pieza";
    if (pathname === "/biblioteca") return en ? "Library" : "Biblioteca";
    if (pathname === "/cuenta") return en ? "Account" : "Mi cuenta";
    if (pathname === "/pricing") return en ? "Pricing" : "Precios";
    if (pathname === "/contacto") return en ? "Contact" : "Contacto";
    return "";
  })();

  const renderNavIcon = (iconName, color) => {
    if (iconName === "sparkle") return <IconSparkle color={color} size={theme.sidebar.navItem.iconSize} />;
    if (iconName === "grid") return <IconGrid color={color} size={theme.sidebar.navItem.iconSize} />;
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg.canvas, display: "flex", flexDirection: "column" }}>

      {/* --- TOPBAR --- */}
      <nav style={{
        display: "flex", alignItems: "center", padding: theme.topbar.padding, height: 64,
        borderBottom: theme.topbar.borderBottom,
        background: theme.bg.sidebar, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: 4 }}>
            ☰
          </button>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...theme.topbar.crumb, cursor: "pointer" }} onClick={() => router.push("/")}>AiStudioBrand</span>
            {pageName && (
              <>
                <span style={{ ...theme.topbar.crumbSep, fontSize: 10 }}>/</span>
                <span style={{ ...theme.topbar.crumb, ...theme.topbar.crumbActive }}>{pageName}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => router.push("/pricing")} style={{ padding: "8px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8, transition: "color 0.2s" }}>
            {en ? "Pricing" : "Precios"}
          </button>
          <button onClick={() => router.push("/contacto")} style={{ padding: "8px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8, transition: "color 0.2s" }}>
            {en ? "Contact" : "Contacto"}
          </button>
          {/* Language toggle - smaller, theme tokens */}
          <div style={{ display: "flex", background: theme.topbar.langToggle.bg, border: theme.topbar.langToggle.border, borderRadius: theme.topbar.langToggle.radius, padding: theme.topbar.langToggle.padding, gap: 1, marginLeft: 4 }}>
            <button onClick={() => setLanguage("es")} style={{ padding: theme.topbar.langOpt.padding, borderRadius: theme.topbar.langOpt.radius, fontSize: theme.topbar.langOpt.fontSize, fontWeight: 600, cursor: "pointer", background: lang === "es" ? theme.topbar.langOptOn.bg : "transparent", border: "none", color: lang === "es" ? theme.topbar.langOptOn.color : theme.topbar.langOpt.color, transition: "all 0.2s" }}>ES</button>
            <button onClick={() => setLanguage("en")} style={{ padding: theme.topbar.langOpt.padding, borderRadius: theme.topbar.langOpt.radius, fontSize: theme.topbar.langOpt.fontSize, fontWeight: 600, cursor: "pointer", background: lang === "en" ? theme.topbar.langOptOn.bg : "transparent", border: "none", color: lang === "en" ? theme.topbar.langOptOn.color : theme.topbar.langOpt.color, transition: "all 0.2s" }}>EN</button>
          </div>
        </div>
      </nav>

      {/* --- BODY --- */}
      <div style={{ display: "flex", flex: 1, marginTop: 64, position: "relative", zIndex: 1 }}>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 39, display: "none" }} />}

        {/* --- SIDEBAR --- */}
        <aside className={sidebarOpen ? "sidebar-open" : ""} style={{
          width: theme.sidebar.width, background: theme.bg.sidebar,
          borderRight: `0.5px solid ${theme.border.subtle}`,
          padding: theme.sidebar.padding, display: "flex", flexDirection: "column",
          position: "fixed", top: 64, bottom: 0, left: 0, zIndex: 40,
          overflowY: "auto", transition: "transform 0.3s ease",
        }}>
          {/* Logo */}
          <div style={{ padding: "0 8px", marginBottom: 20, cursor: "pointer" }} onClick={() => router.push("/")}>
            <img src="/logo.svg" alt="AiStudioBrand" style={{ height: 28 }} />
          </div>

          {/* Section label: MARCA */}
          <div style={{ ...theme.sidebar.sectionLabel, marginTop: 4 }}>{en ? "BRAND" : "MARCA"}</div>

          {/* Brand DNA section */}
          <div style={{ marginBottom: 4 }}>
            <button onClick={() => setDnaSectionOpen(!dnaSectionOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: pathname === "/adn" ? `${theme.sidebar.navItem.padding.split(' ')[0]} ${theme.sidebar.navItem.padding.split(' ')[1]}` : theme.sidebar.navItem.padding,
                borderRadius: pathname === "/adn" ? theme.sidebar.navItemActive.borderRadius : theme.sidebar.navItem.radius,
                fontSize: theme.sidebar.navItem.fontSize,
                fontWeight: pathname === "/adn" ? theme.sidebar.navItemActive.fontWeight : 400,
                color: pathname === "/adn" ? theme.sidebar.navItemActive.color : theme.sidebar.navItem.color,
                background: pathname === "/adn" ? theme.sidebar.navItemActive.background : "transparent",
                boxShadow: pathname === "/adn" ? theme.sidebar.navItemActive.boxShadow : "none",
                paddingLeft: pathname === "/adn" ? theme.sidebar.navItemActive.paddingLeft : undefined,
                marginLeft: pathname === "/adn" ? theme.sidebar.navItemActive.marginLeft : 0,
                border: "none",
                cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s",
              }}>
              <IconDna color={pathname === "/adn" ? theme.accent.light : theme.text.dim} size={theme.sidebar.navItem.iconSize} />
              <span style={{ flex: 1 }}>{en ? "Brand DNA" : "ADN de marca"}</span>
              <span style={{ fontSize: 9, color: theme.text.dim, transition: "transform 0.2s", transform: dnaSectionOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>

            {dnaSectionOpen && (
              <div style={{ paddingLeft: 12, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                {brands.map(b => {
                  const isActive = b.id === activeBrand?.id;
                  return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      <button onClick={() => { switchBrand(b); router.push("/adn?brand=" + b.id); setSidebarOpen(false); }}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", gap: 8, padding: theme.sidebar.subItem.padding,
                          borderRadius: theme.sidebar.subItem.radius, cursor: "pointer", textAlign: "left",
                          background: isActive ? theme.sidebar.subItemActive.background : "transparent",
                          border: "none", transition: "all 0.2s",
                        }}>
                        <div style={{
                          width: theme.sidebar.subAvatar.size, height: theme.sidebar.subAvatar.size,
                          borderRadius: theme.sidebar.subAvatar.radius, flexShrink: 0,
                          background: isActive ? "linear-gradient(135deg,#7950F2,#A78BFA)" : "rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: theme.sidebar.subAvatar.fontSize, fontWeight: theme.sidebar.subAvatar.fontWeight, color: "#fff",
                        }}>
                          {(b.nombre || "M").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: theme.sidebar.subItem.fontSize, fontWeight: isActive ? 500 : 400, color: isActive ? theme.sidebar.subItemActive.color : theme.sidebar.subItem.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {b.nombre || (en ? "Unnamed" : "Sin nombre")}
                            </span>
                            {isActive && <span style={{ width: theme.sidebar.statusDot.size, height: theme.sidebar.statusDot.size, borderRadius: "50%", background: theme.sidebar.statusDot.bg, flexShrink: 0, display: "inline-block" }} />}
                          </div>
                          <div style={{ fontSize: theme.sidebar.subMeta.fontSize, color: theme.sidebar.subMeta.color, marginTop: 1 }}>
                            {isActive ? (en ? "60% DNA · active" : "60% ADN · activa") : (en ? "View & edit" : "Ver y editar")}
                          </div>
                        </div>
                      </button>
                      {brands.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); deleteBrand(b); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", color: "rgba(255,255,255,0.15)", fontSize: 14, borderRadius: 6, flexShrink: 0 }}
                          title={en ? "Delete" : "Eliminar"}>×</button>
                      )}
                    </div>
                  );
                })}
                <button onClick={() => { router.push("/adn?new=true"); setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: theme.sidebar.newBrandButton.justifyContent,
                    gap: 8, padding: theme.sidebar.newBrandButton.padding,
                    borderRadius: theme.sidebar.newBrandButton.radius, cursor: "pointer", textAlign: "left",
                    background: "transparent", border: theme.sidebar.newBrandButton.border, transition: "all 0.2s",
                  }}>
                  <span style={{ fontSize: 12, color: theme.sidebar.newBrandButton.color }}>+</span>
                  <span style={{ fontSize: theme.sidebar.newBrandButton.fontSize, color: theme.sidebar.newBrandButton.color }}>{en ? "New brand" : "Nueva marca"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section label: TRABAJO */}
          <div style={{ ...theme.sidebar.sectionLabel, marginTop: 12 }}>{en ? "WORK" : "TRABAJO"}</div>

          {/* Nav items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(item => {
              const active = pathname === item.path;
              const iconColor = active ? theme.accent.light : theme.text.dim;
              return (
                <button key={item.path} onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: active ? `${theme.sidebar.navItem.padding.split(' ')[0]} ${theme.sidebar.navItem.padding.split(' ')[1]}` : theme.sidebar.navItem.padding,
                    borderRadius: active ? theme.sidebar.navItemActive.borderRadius : theme.sidebar.navItem.radius,
                    fontSize: theme.sidebar.navItem.fontSize,
                    fontWeight: active ? theme.sidebar.navItemActive.fontWeight : 400,
                    color: active ? theme.sidebar.navItemActive.color : theme.sidebar.navItem.color,
                    background: active ? theme.sidebar.navItemActive.background : "transparent",
                    boxShadow: active ? theme.sidebar.navItemActive.boxShadow : "none",
                    paddingLeft: active ? theme.sidebar.navItemActive.paddingLeft : undefined,
                    marginLeft: active ? theme.sidebar.navItemActive.marginLeft : 0,
                    marginBottom: theme.sidebar.navItem.marginBottom,
                    border: "none",
                    cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s",
                  }}>
                  {renderNavIcon(item.icon, iconColor)}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Bottom - user row */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ height: 1, background: theme.border.divider, margin: "16px 0" }} />
            <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: theme.sidebar.userRow.padding,
                  borderRadius: theme.sidebar.navItem.radius, cursor: "pointer", textAlign: "left",
                  width: "100%", background: "transparent", border: "none", transition: "all 0.2s",
                }}>
                <div style={{
                  width: theme.sidebar.userRow.avatarSize, height: theme.sidebar.userRow.avatarSize,
                  borderRadius: "50%", background: theme.sidebar.userRow.avatarBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0,
                }}>
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ fontSize: theme.sidebar.userRow.emailFontSize, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.email}
                  </div>
                  <div style={{ fontSize: theme.sidebar.userRow.planFontSize, color: theme.sidebar.userRow.planColor }}>
                    Free plan
                  </div>
                </div>
                <span style={{ fontSize: 9, color: theme.text.dim, transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▲</span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute", bottom: "100%", left: 0, right: 0,
                  background: theme.bg.card, border: `0.5px solid ${theme.border.default}`,
                  borderRadius: theme.radius.sm, padding: 4, marginBottom: 4,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}>
                  <button onClick={() => { setUserMenuOpen(false); router.push("/cuenta"); }}
                    style={{ display: "block", width: "100%", padding: "7px 10px", borderRadius: 4, fontSize: 12, color: theme.text.secondary, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    {en ? "Account" : "Mi cuenta"}
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); router.push("/pricing"); }}
                    style={{ display: "block", width: "100%", padding: "7px 10px", borderRadius: 4, fontSize: 12, color: theme.text.secondary, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    {en ? "Settings" : "Configuracion"}
                  </button>
                  <div style={{ height: 1, background: theme.border.divider, margin: "3px 0" }} />
                  <button onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    style={{ display: "block", width: "100%", padding: "7px 10px", borderRadius: 4, fontSize: 12, color: theme.danger.solid, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    {en ? "Log out" : "Salir"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* --- MAIN --- */}
        <main className="app-main" style={{ flex: 1, marginLeft: theme.sidebar.width, minHeight: "calc(100vh - 64px)", position: "relative", background: theme.bg.canvas }}>
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
