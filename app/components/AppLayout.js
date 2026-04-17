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
    <div style={{ minHeight:"100vh", background:"#0D0D1F", fontFamily:"Inter, sans-serif", display:"flex", flexDirection:"column" }}>
      {/* Background glow */}
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:500, height:500, background:"radial-gradient(circle, rgba(121,80,242,0.08) 0%, rgba(13,13,31,0) 70%)", filter:"blur(80px)", zIndex:0, pointerEvents:"none" }} />

      <nav style={{ display:"flex", alignItems:"center", padding:"0 20px", height:56, borderBottom:"1px solid rgba(255,255,255,0.08)", background:"rgba(22,22,45,0.8)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#7950F2,#A78BFA)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12, boxShadow:"0 2px 8px rgba(121,80,242,0.3)" }}>Ai</div>
          <span style={{ fontSize:15, fontWeight:600, color:"#fff", letterSpacing:"-0.02em" }}>Ai<span style={{ color:"#A78BFA" }}>Studio</span>Brand</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{user?.email}</div>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(121,80,242,0.2)", border:"1px solid rgba(121,80,242,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#A78BFA", fontWeight:600, cursor:"pointer", transition:"all 0.2s ease" }} onClick={() => router.push("/cuenta")}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <div style={{ display:"flex", flex:1, position:"relative", zIndex:1 }}>
        <aside style={{ width:210, background:"#0A0A18", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"16px 10px", display:"flex", flexDirection:"column", position:"sticky", top:56, height:"calc(100vh - 56px)", overflowY:"auto", flexShrink:0 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {navItems.map(item => (
              <button key={item.path} onClick={() => router.push(item.path)}
                className="link-hover"
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight: pathname === item.path ? 500 : 400, color: pathname === item.path ? "#A78BFA" : "rgba(255,255,255,0.5)", background: pathname === item.path ? "rgba(121,80,242,0.12)" : "transparent", border: pathname === item.path ? "1px solid rgba(121,80,242,0.2)" : "1px solid transparent", cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s ease" }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {brandProfile && (
            <div className="card-hover" style={{ margin:"16px 0", background:"#16162d", border:"1px solid rgba(121,80,242,0.2)", borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all 0.2s ease" }} onClick={() => router.push("/adn")}>
              <div style={{ fontSize:11, fontWeight:600, color:"#A78BFA", marginBottom:4, letterSpacing:"0.02em" }}>{brandProfile.nombre || "Tu marca"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>
                {[brandProfile.tono, brandProfile.idioma].filter(Boolean).join(" · ")}
              </div>
            </div>
          )}

          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:3 }}>
            <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"8px 0" }} />
            <button onClick={() => router.push("/cuenta")} className="link-hover"
              style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderRadius:9, fontSize:12, color:"rgba(255,255,255,0.4)", background:"transparent", border:"1px solid transparent", cursor:"pointer", textAlign:"left", width:"100%", transition:"color 0.15s" }}>
              <span>◎</span> Mi cuenta
            </button>
            <button onClick={handleLogout} className="link-hover"
              style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderRadius:9, fontSize:12, color:"rgba(255,100,100,0.5)", background:"transparent", border:"1px solid transparent", cursor:"pointer", textAlign:"left", width:"100%", transition:"color 0.15s" }}>
              <span>→</span> Salir
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
