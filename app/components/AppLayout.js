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
  const [expandedBrandId, setExpandedBrandId] = useState(null);
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
          {/* Logo + Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.svg" alt="AiStudioBrand" style={{ height: 36, cursor: "pointer" }} onClick={() => router.push("/")} />
            {pageName && (
              <>
                <span style={{ ...theme.topbar.crumbSep, fontSize: 10 }}>/</span>
                <span style={{ ...theme.topbar.crumb, ...theme.topbar.crumbActive }}>{pageName}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => router.push("/pricing")} style={{ padding: "8px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8, transition: "color 0.2s" }}>
            {en ? "Pricing" : "Precios"}
          </button>
          <button onClick={() => router.push("/contacto")} style={{ padding: "8px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8, transition: "color 0.2s" }}>
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
          {/* ═══ FLOW STEPS ═══ */}
          {(() => {
            // Calculate DNA progress for active brand
            const ab = activeBrand || {};
            const dnaFields = [
              !!ab.nombre, !!ab.descripcion, !!ab.audiencia,
              !!(Array.isArray(ab.tono) ? ab.tono.filter(Boolean).length : ab.tono),
              !!ab.idioma, !!ab.propuesta_valor, !!ab.instagram_url,
              !!ab.personalidad,
              !!(ab.colores_marca && ab.colores_marca.length > 0),
              !!(ab.ejemplos_copy && ab.ejemplos_copy.some(e => e && e.trim())),
            ];
            const dnaPct = brands.length > 0 ? Math.round((dnaFields.filter(Boolean).length / dnaFields.length) * 100) : 0;
            const dnaComplete = dnaPct >= 90;
            const hasBrands = brands.length > 0;

            // Flow steps definition
            const flowSteps = [
              { num: 1, label: en ? "Brand DNA" : "ADN de marca", path: "/adn", done: dnaComplete, current: pathname === "/adn", meta: hasBrands ? (dnaComplete ? (en ? "Complete" : "Completo") : dnaPct + "%") : (en ? "Start here" : "Empieza aquí") },
              { num: 2, label: en ? "Create" : "Crear pieza", path: "/crear", done: false, current: pathname === "/crear", meta: dnaComplete ? (en ? "Ready" : "Listo") : (en ? "Needs DNA" : "Necesita ADN"), disabled: !dnaComplete },
              { num: 3, label: en ? "Library" : "Biblioteca", path: "/biblioteca", done: false, current: pathname === "/biblioteca", meta: en ? "Your pieces" : "Tus piezas" },
            ];

            return (
              <div style={{ marginTop: 4, marginBottom: 8 }}>
                {flowSteps.map((s, i) => (
                  <div key={s.num}>
                    {/* Step row */}
                    <button onClick={() => { if (s.num === 1) { setDnaSectionOpen(!dnaSectionOpen); } if (!s.disabled) { router.push(s.path); setSidebarOpen(false); } }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                        padding: "8px 10px", borderRadius: 8, border: "none", cursor: s.disabled ? "default" : "pointer",
                        background: s.current ? theme.sidebar.navItemActive.background : "transparent",
                        opacity: s.disabled ? 0.4 : 1,
                        transition: "all 0.2s",
                      }}>
                      {/* Step number circle */}
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        background: s.current ? "#7950F2" : s.done ? "#40C057" : "rgba(255,255,255,0.06)",
                        border: s.current ? "none" : s.done ? "none" : "1px solid rgba(255,255,255,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 600, color: (s.current || s.done) ? "#fff" : "rgba(255,255,255,0.35)",
                        transition: "all 0.3s",
                      }}>
                        {s.done ? "✓" : s.num}
                      </div>
                      {/* Label + meta */}
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 12.5, fontWeight: s.current ? 600 : 400, color: s.current ? "#fff" : s.disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", letterSpacing: "-0.02em" }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: 10, color: s.done ? "rgba(64,192,87,0.7)" : s.current ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.25)", marginTop: 1 }}>
                          {s.meta}
                        </div>
                      </div>
                      {/* Expand arrow for step 1 */}
                      {s.num === 1 && hasBrands && (
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: dnaSectionOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                      )}
                    </button>

                    {/* Connector line between steps */}
                    {i < flowSteps.length - 1 && (
                      <div style={{ display: "flex", paddingLeft: 21, height: 16 }}>
                        <div style={{
                          width: 1.5,
                          height: "100%",
                          background: flowSteps[i].done ? "rgba(64,192,87,0.3)" : "rgba(255,255,255,0.06)",
                          transition: "background 0.3s",
                        }} />
                      </div>
                    )}

                    {/* Brand sub-items under step 1 (ADN) */}
                    {s.num === 1 && dnaSectionOpen && (
                      <div style={{ paddingLeft: 20, paddingTop: 2, paddingBottom: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                        {/* Connector into sub-items */}
                        <div style={{ display: "flex", paddingLeft: 1, height: 4 }}>
                          <div style={{ width: 1.5, height: "100%", background: "rgba(255,255,255,0.06)" }} />
                        </div>
                        {brands.map(b => {
                          const isCreatingNew = pathname === "/adn" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "true";
                          const isActiveBrand = !isCreatingNew && b.id === activeBrand?.id;
                          const isExpanded = expandedBrandId === b.id;
                          const bFields = [
                            !!b.nombre, !!b.descripcion, !!b.audiencia,
                            !!(Array.isArray(b.tono) ? b.tono.filter(Boolean).length : b.tono),
                            !!b.idioma, !!b.propuesta_valor, !!b.instagram_url,
                            !!b.personalidad,
                            !!(b.colores_marca && b.colores_marca.length > 0),
                            !!(b.ejemplos_copy && b.ejemplos_copy.some(e => e && e.trim())),
                          ];
                          const bPct = Math.round((bFields.filter(Boolean).length / bFields.length) * 100);
                          const bComplete = bPct >= 90;
                          return (
                            <div key={b.id}>
                              <button onClick={() => {
                                switchBrand(b);
                                // If incomplete, go straight to editor. If complete, toggle action menu.
                                if (!bComplete) {
                                  router.push("/adn?brand=" + b.id); setSidebarOpen(false);
                                } else {
                                  setExpandedBrandId(isExpanded ? null : b.id);
                                }
                              }}
                                style={{
                                  width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                                  borderRadius: isExpanded ? "6px 6px 0 0" : 6, cursor: "pointer", textAlign: "left",
                                  background: isExpanded ? "rgba(121,80,242,0.08)" : isActiveBrand ? "rgba(121,80,242,0.1)" : "transparent",
                                  border: "none", transition: "all 0.2s",
                                }}>
                                <div style={{
                                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                  background: isActiveBrand ? "linear-gradient(135deg,#7950F2,#A78BFA)" : "rgba(255,255,255,0.06)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 10, fontWeight: 600, color: "#fff", position: "relative",
                                }}>
                                  {(b.nombre || "M").charAt(0).toUpperCase()}
                                  {bComplete && (
                                    <div style={{ position:"absolute", bottom:-1, right:-1, width:9, height:9, borderRadius:"50%", background:"#40C057", border:"1.5px solid #0A0A14", display:"flex", alignItems:"center", justifyContent:"center", fontSize:5, color:"#fff" }}>✓</div>
                                  )}
                                </div>
                                <div style={{ overflow: "hidden", flex: 1 }}>
                                  <div style={{ fontSize: 11.5, fontWeight: isActiveBrand ? 500 : 400, color: isActiveBrand ? "#fff" : "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {b.nombre || (en ? "Unnamed" : "Sin nombre")}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: bComplete ? "rgba(64,192,87,0.6)" : "rgba(255,255,255,0.25)", marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}>
                                    <span>{bPct}%</span>
                                    {!bComplete && (
                                      <div style={{ flex:1, maxWidth:32, height:2, background:"rgba(255,255,255,0.06)", borderRadius:1, overflow:"hidden" }}>
                                        <div style={{ height:"100%", width:bPct+"%", background: bPct > 50 ? "#A78BFA" : "rgba(255,255,255,0.15)", borderRadius:1, transition:"width 0.3s" }} />
                                      </div>
                                    )}
                                    {isActiveBrand && <span style={{ color: "rgba(167,139,250,0.6)" }}>{en ? "· active" : "· activa"}</span>}
                                  </div>
                                </div>
                                {bComplete && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>}
                              </button>
                              {/* Action menu for completed brands */}
                              {isExpanded && (
                                <div style={{ background: "rgba(121,80,242,0.04)", borderRadius: "0 0 6px 6px", padding: "4px 6px", display: "flex", flexDirection: "column", gap: 2, borderTop: "0.5px solid rgba(121,80,242,0.1)" }}>
                                  <button onClick={() => { router.push("/adn?brand=" + b.id); setSidebarOpen(false); setExpandedBrandId(null); }}
                                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 4, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.6)" }}
                                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                                    onMouseLeave={e => e.currentTarget.style.background="none"}>
                                    <span style={{ fontSize: 11, width: 16, textAlign: "center" }}>✎</span>
                                    {en ? "Edit DNA" : "Editar ADN"}
                                  </button>
                                  <button onClick={() => { router.push("/crear"); setSidebarOpen(false); setExpandedBrandId(null); }}
                                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 4, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 11, color: "#A78BFA" }}
                                    onMouseEnter={e => e.currentTarget.style.background="rgba(121,80,242,0.08)"}
                                    onMouseLeave={e => e.currentTarget.style.background="none"}>
                                    <span style={{ fontSize: 11, width: 16, textAlign: "center" }}>✦</span>
                                    {en ? "Create piece" : "Crear pieza"}
                                  </button>
                                  {brands.length > 1 && (
                                    <button onClick={() => { deleteBrand(b); setExpandedBrandId(null); }}
                                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 4, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 11, color: "rgba(252,165,165,0.6)" }}
                                      onMouseEnter={e => e.currentTarget.style.background="rgba(220,38,38,0.06)"}
                                      onMouseLeave={e => e.currentTarget.style.background="none"}>
                                      <span style={{ fontSize: 11, width: 16, textAlign: "center" }}>×</span>
                                      {en ? "Delete" : "Eliminar"}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(() => {
                          const isCreatingNew = pathname === "/adn" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "true";
                          return (
                            <button onClick={() => { router.push("/adn?new=true"); setSidebarOpen(false); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
                                borderRadius: 6, cursor: "pointer", textAlign: "left",
                                background: isCreatingNew ? "rgba(121,80,242,0.1)" : "transparent",
                                border: "none", transition: "all 0.2s",
                              }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>+</div>
                              <span style={{ fontSize: 11, color: isCreatingNew ? "#A78BFA" : "rgba(255,255,255,0.3)", fontWeight: isCreatingNew ? 500 : 400 }}>
                                {isCreatingNew ? (en ? "Creating..." : "Creando...") : (en ? "New brand" : "Nueva marca")}
                              </span>
                            </button>
                          );
                        })()}
                        {/* Connector out of sub-items */}
                        <div style={{ display: "flex", paddingLeft: 1, height: 6 }}>
                          <div style={{ width: 1.5, height: "100%", background: "rgba(255,255,255,0.06)" }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

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
                <span style={{ fontSize: 11, color: theme.text.muted, transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▲</span>
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
