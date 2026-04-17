"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Cuenta() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const D = {
    bg:"#0D0D1F", bg2:"#111122", bg3:"#16162d",
    border:"rgba(255,255,255,0.1)", text:"#fff", text2:"rgba(255,255,255,0.7)",
    text3:"rgba(255,255,255,0.4)", purple:"#7950F2", purpleLight:"#A78BFA",
  };

  const PLANS = {
    free: { name:"Free", color:"rgba(255,255,255,0.2)", limit:20 },
    professional: { name:"Professional", color:"#7950F2", limit:200 },
    enterprise: { name:"Enterprise", color:"#E64980", limit:1000 },
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:D.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:14, color:D.text2 }}>Cargando...</div>
    </div>
  );

  const plan = profile?.plan || "free";
  const planInfo = PLANS[plan];
  const genCount = profile?.generaciones_mes || 0;
  const mesActual = new Date().toISOString().slice(0, 7);
  const genUsed = profile?.mes_actual === mesActual ? genCount : 0;
  const genPct = Math.min((genUsed / planInfo.limit) * 100, 100);

  return (
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid " + D.border, background:D.bg2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:D.purple, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:D.text }}>Ai<span style={{ color:D.purpleLight }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:8, marginLeft:"auto", alignItems:"center" }}>
          <button onClick={() => router.push("/crear")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Generador</button>
          <button onClick={() => router.push("/biblioteca")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:D.text2, cursor:"pointer", background:"none", border:"none" }}>Biblioteca</button>
          <button onClick={handleLogout} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, color:"rgba(255,255,255,0.3)", cursor:"pointer", background:"none", border:"1px solid rgba(255,255,255,0.08)" }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:26, fontWeight:500, color:D.text, marginBottom:6, letterSpacing:"-0.02em" }}>Mi cuenta</h1>
        <p style={{ fontSize:14, color:D.text2, marginBottom:32 }}>Gestiona tu suscripción y uso</p>

        <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:24, marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Perfil</div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, background:"rgba(121,80,242,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:D.purpleLight, fontWeight:500 }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:500, color:D.text }}>{user?.email}</div>
              <div style={{ fontSize:12, color:D.text3, marginTop:2 }}>Miembro desde {new Date(user?.created_at).toLocaleDateString("es-ES", { month:"long", year:"numeric" })}</div>
            </div>
          </div>
        </div>

        <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:24, marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Plan actual</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(121,80,242,0.15)", borderRadius:20, padding:"5px 14px", marginBottom:6 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:planInfo.color, display:"inline-block" }}></span>
                <span style={{ fontSize:13, fontWeight:500, color:D.purpleLight }}>{planInfo.name}</span>
              </div>
              <div style={{ fontSize:13, color:D.text2 }}>{planInfo.limit} generaciones / mes</div>
            </div>
            {plan === "free" && (
              <button onClick={() => router.push("/pricing")} style={{ padding:"9px 18px", background:D.purple, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                Actualizar plan →
              </button>
            )}
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:D.text3 }}>Generaciones este mes</span>
              <span style={{ fontSize:12, color:D.text2 }}>{genUsed} / {planInfo.limit}</span>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden" }}>
              <div style={{ height:"100%", width: genPct + "%", background: genPct > 90 ? "#E64980" : D.purple, borderRadius:6, transition:"width 0.3s" }} />
            </div>
          </div>
          {profile?.plan_expires_at && (
            <div style={{ fontSize:12, color:D.text3, marginTop:10 }}>
              Próxima renovación: {new Date(profile.plan_expires_at).toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" })}
            </div>
          )}
        </div>

        <div style={{ background:D.bg3, border:"1px solid " + D.border, borderRadius:14, padding:24, marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:500, color:D.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Acciones rápidas</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => router.push("/crear")} style={{ padding:"11px 16px", background:"rgba(121,80,242,0.1)", border:"1px solid rgba(121,80,242,0.2)", borderRadius:9, fontSize:13, fontWeight:500, color:D.purpleLight, cursor:"pointer", textAlign:"left" }}>
              ✦ Ir al generador
            </button>
            <button onClick={() => router.push("/adn")} style={{ padding:"11px 16px", background:D.bg3, border:"1px solid " + D.border, borderRadius:9, fontSize:13, color:D.text2, cursor:"pointer", textAlign:"left" }}>
              ◉ Editar Brand Profile
            </button>
            <button onClick={() => router.push("/biblioteca")} style={{ padding:"11px 16px", background:D.bg3, border:"1px solid " + D.border, borderRadius:9, fontSize:13, color:D.text2, cursor:"pointer", textAlign:"left" }}>
              ◈ Ver mi biblioteca
            </button>
          </div>
        </div>

        <button onClick={handleLogout} style={{ width:"100%", padding:12, background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:10, fontSize:13, color:"#FCA5A5", cursor:"pointer", fontFamily:"Inter, sans-serif" }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}