"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);

  const D = {
    bg:"#0D0D1F", bg2:"#0A0A18", bg3:"rgba(255,255,255,0.04)",
    border:"rgba(255,255,255,0.06)", text:"#fff", text2:"rgba(255,255,255,0.5)",
    text3:"rgba(255,255,255,0.25)", purple:"#7950F2", purpleLight:"#A78BFA",
  };

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
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif", display:"flex", flexDirection:"column" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 20px", height:54, borderBottom:"1px solid " + D.border, background:"#111122", position:"sticky", top:0, zIndex:100, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:30, height:30, background:D.purple, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:600, fontSize:12 }}>Ai</div>
          <span style={{ fontSize:15, fontWeight:500, color:D.text }}>Ai<span style={{ color:D.purpleLight }}>Studio</span>Brand</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontSize:12, color:D.text3 }}>{user?.email}</div>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(121,80,242,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:D.purpleLight, fontWeight:600, cursor:"pointer" }} onClick={() => router.push("/cuenta")}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <div style={{ display:"flex", flex:1 }}>
        <aside style={{ width:200, background:D.bg2, borderRight:"1px solid " + D.border, padding:"16px 10px", display:"flex", flexDirection:"column", position:"sticky", top:54, height:"calc(100vh - 54px)", overflowY:"auto", flexShrink:0 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {navItems.map(item => (
              <button key={item.path} onClick={() => router.push(item.path)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, fontSize:13, fontWeight: pathname === item.path ? 500 : 400, color: pathname === item.path ? D.purpleLight : D.text2, background: pathname === item.path ? "rgba(121,80,242,0.12)" : "transparent", border: pathname === item.path ? "1px solid rgba(121,80,242,0.2)" : "1px solid transparent", cursor:"pointer", textAlign:"left", width:"100%" }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {brandProfile && (
            <div style={{ margin:"16px 0", background:"rgba(121,80,242,0.08)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:9, padding:"10px 12px", cursor:"pointer" }} onClick={() => router.push("/adn")}>
              <div style={{ fontSize:11, fontWeight:500, color:D.purpleLight, marginBottom:3 }}>{brandProfile.nombre || "Tu marca"}</div>
              <div style={{ fontSize:10, color:D.text3, lineHeight:1.5 }}>
                {[brandProfile.tono, brandProfile.idioma].filter(Boolean).join(" · ")}
              </div>
            </div>
          )}

          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:3 }}>
            <div style={{ height:"1px", background:D.border, margin:"8px 0" }} />
            <button onClick={() => router.push("/cuenta")}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:9, fontSize:12, color:D.text3, background:"transparent", border:"1px solid transparent", cursor:"pointer", textAlign:"left", width:"100%" }}>
              <span>◎</span> Mi cuenta
            </button>
            <button onClick={handleLogout}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:9, fontSize:12, color:"rgba(255,100,100,0.5)", background:"transparent", border:"1px solid transparent", cursor:"pointer", textAlign:"left", width:"100%" }}>
              <span>→</span> Salir
            </button>
          </div>
        </aside>

        <main style={{ flex:1, overflowY:"auto", minHeight:"calc(100vh - 54px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}