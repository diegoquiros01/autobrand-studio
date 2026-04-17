"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);

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
  }, []);

  const navItems = [
    { icon:"◉", label:"ADN de marca", path:"/adn" },
    { icon:"✦", label:"Nueva pieza", path:"/crear" },
    { icon:"◈", label:"Biblioteca", path:"/biblioteca" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0D1F", display:"flex", flexDirection:"column" }}>
      {/* Background glow */}
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:600, height:600, background:"radial-gradient(circle, rgba(121,80,242,0.06) 0%, rgba(13,13,31,0) 70%)", filter:"blur(80px)", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-20%", left:"-10%", width:400, height:400, background:"radial-gradient(circle, rgba(167,139,250,0.04) 0%, rgba(13,13,31,0) 70%)", filter:"blur(60px)", zIndex:0, pointerEvents:"none" }} />

      <nav style={{ display:"flex", alignItems:"center", padding:"0 24px", height:56, borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(9,9,22,0.8)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:100, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12, boxShadow:"0 2px 10px rgba(121,80,242,0.35)" }}>Ai</div>
          <span style={{ fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-0.03em" }}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:400 }}>{user?.email}</div>
          <div className="link-hover" style={{ width:34, height:34, borderRadius:"50%", background:"rgba(121,80,242,0.15)", border:"1px solid rgba(121,80,242,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#A78BFA", fontWeight:700, cursor:"pointer", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)" }} onClick={() => router.push("/cuenta")}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <div style={{ display:"flex", flex:1, position:"relative", zIndex:1 }}>
        <aside style={{ width:240, background:"#090916", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"24px 14px", display:"flex", flexDirection:"column", position:"sticky", top:56, height:"calc(100vh - 56px)", overflowY:"auto", flexShrink:0 }}>
          {brandProfile && (
            <div className="card-hover" style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:24, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)" }} onClick={() => router.push("/adn")}>
              <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#7950F2,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 }}>
                {(brandProfile.nombre || "M").charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{brandProfile.nombre || "Tu marca"}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>
                  {[brandProfile.tono, brandProfile.idioma].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {navItems.map(item => (
              <button key={item.path} onClick={() => router.push(item.path)}
                className="link-hover"
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderRadius:8, fontSize:13, fontWeight: pathname === item.path ? 600 : 400, color: pathname === item.path ? "#A78BFA" : "rgba(255,255,255,0.5)", background: pathname === item.path ? "rgba(121,80,242,0.1)" : "transparent", border:"none", cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
                <span style={{ fontSize:15, opacity: pathname === item.path ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:2 }}>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"12px 0" }} />
            <button onClick={() => router.push("/cuenta")} className="link-hover"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderRadius:8, fontSize:12, color:"rgba(255,255,255,0.35)", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s" }}>
              <span style={{ fontSize:14 }}>◎</span> Mi cuenta
            </button>
            <button onClick={handleLogout} className="link-hover"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderRadius:8, fontSize:12, color:"rgba(255,100,100,0.45)", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s" }}>
              <span style={{ fontSize:14 }}>→</span> Salir
            </button>
          </div>
        </aside>

        <main style={{ flex:1, overflowY:"auto", minHeight:"calc(100vh - 56px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
