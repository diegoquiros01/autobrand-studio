"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("tab") === "register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState("es");
  useEffect(() => { const saved = localStorage.getItem("lang"); if (saved) setLang(saved); }, []);
  const en = lang === "en";

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const redirect = searchParams.get("redirect");
      const plan = searchParams.get("plan");
      if (redirect === "pricing") router.push("/pricing");
      else router.push("/");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !nombre) return;
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, email, nombre });
      }
      const redirect = searchParams.get("redirect");
      if (redirect === "pricing") {
        setTimeout(() => router.push("/pricing"), 800);
      } else {
        setTimeout(() => router.push("/adn?onboarding=true"), 800);
      }
      setSuccess(en ? "Account created successfully." : "Cuenta creada exitosamente.");
    }
    setLoading(false);
  };

  const inp = { width:"100%", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 13px", fontSize:14, background:"#0A0A18", color:"#fff", outline:"none" };
  const inpClass = "input-focus";

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A1A", position:"relative", overflow:"hidden" }}>
      {/* Gradient mesh background (same as home) */}
      <div style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, #1a0a2e 0%, #0A0A1A 100%)" }} />
        <div className="login-orb-1" style={{ position:"absolute", top:"-10%", left:"30%", width:"60%", height:"60%", borderRadius:"50%", background:"radial-gradient(circle, rgba(121,80,242,0.7) 0%, rgba(121,80,242,0) 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div className="login-orb-2" style={{ position:"absolute", top:"20%", right:"-5%", width:"50%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(230,73,128,0.5) 0%, rgba(230,73,128,0) 70%)", filter:"blur(80px)", pointerEvents:"none" }} />
        <div className="login-orb-3" style={{ position:"absolute", top:"30%", left:"-10%", width:"45%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,0.45) 0%, rgba(167,139,250,0) 70%)", filter:"blur(70px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-5%", left:"20%", width:"60%", height:"40%", borderRadius:"50%", background:"radial-gradient(circle, rgba(88,40,200,0.5) 0%, rgba(88,40,200,0) 70%)", filter:"blur(80px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"5%", right:"10%", width:"35%", height:"35%", borderRadius:"50%", background:"radial-gradient(circle, rgba(245,101,101,0.25) 0%, rgba(245,101,101,0) 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"15%", left:"25%", width:"50%", height:"30%", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", filter:"blur(40px)", pointerEvents:"none" }} />
      </div>
      <style>{`
        @keyframes loginOrbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes loginOrbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,15px)} }
        @keyframes loginOrbFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,25px)} }
        .login-orb-1 { animation: loginOrbFloat1 8s ease-in-out infinite; }
        .login-orb-2 { animation: loginOrbFloat2 10s ease-in-out infinite; }
        .login-orb-3 { animation: loginOrbFloat3 12s ease-in-out infinite; }
      `}</style>
      <nav style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid rgba(255,255,255,0.1)", background:"rgba(17,17,34,0.5)", backdropFilter:"blur(10px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <img src="/logo.svg" alt="AiStudioBrand" style={{ height: 34 }} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 3, gap: 2 }}>
          <button onClick={() => { setLang("es"); localStorage.setItem("lang", "es"); }} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: lang === "es" ? "#fff" : "transparent", border: "none", color: lang === "es" ? "#0A0A0A" : "rgba(255,255,255,0.4)" }}>ES</button>
          <button onClick={() => { setLang("en"); localStorage.setItem("lang", "en"); }} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: lang === "en" ? "#fff" : "transparent", border: "none", color: lang === "en" ? "#0A0A0A" : "rgba(255,255,255,0.4)" }}>EN</button>
        </div>
      </nav>
      <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 60px)", padding:20 }}>
        <div style={{ background:"rgba(22,22,45,0.85)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"36px 32px", width:"100%", maxWidth:380, boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <img src="/logo.svg" alt="AiStudioBrand" style={{ height: 52, margin: "0 auto 10px", display: "block" }} />
            <div style={{ fontSize:13.5, color:"rgba(255,255,255,0.7)" }}>{en ? "Content that sounds like you" : "Contenido que suena como tú"}</div>
          </div>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:10, padding:3, marginBottom:20, gap:3 }}>
            <button onClick={() => setMode("login")} style={{ flex:1, padding:8, borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", background: mode==="login" ? "#fff" : "transparent", border:"none", color: mode==="login" ? "#0A0A0A" : "#666", boxShadow: mode==="login" ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>{en ? "Sign in" : "Iniciar sesión"}</button>
            <button onClick={() => setMode("register")} style={{ flex:1, padding:8, borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", background: mode==="register" ? "#fff" : "transparent", border:"none", color: mode==="register" ? "#0A0A0A" : "#666", boxShadow: mode==="register" ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>{en ? "Create account" : "Crear cuenta"}</button>
          </div>
          {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:8, padding:"10px 13px", color:"#FCA5A5", fontSize:13, marginBottom:12 }}>{error}</div>}
          {success && <div style={{ background:"rgba(64,192,87,0.08)", border:"1px solid rgba(64,192,87,0.2)", borderRadius:8, padding:"10px 13px", color:"#86EFAC", fontSize:13, marginBottom:12 }}>{success}</div>}
          {mode === "register" && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", display:"block", marginBottom:5 }}>{en ? "Your name" : "Tu nombre"}</label>
              <input className={inpClass} style={inp} type="text" placeholder="Maria Garcia" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", display:"block", marginBottom:5 }}>Email</label>
            <input className={inpClass} style={inp} type="email" placeholder={en ? "your@email.com" : "tu@email.com"} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom:4 }}>
            <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", display:"block", marginBottom:5 }}>{en ? "Password" : "Contraseña"}</label>
            <input className={inpClass} style={inp} type="password" placeholder={en ? "Minimum 6 characters" : "Mínimo 6 caracteres"} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button
            className="btn-primary"
            style={{ width:"100%", padding:13, background: loading ? "#C5B8FB" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:14.5, fontWeight:500, cursor: loading ? "not-allowed" : "pointer", marginTop:6, marginBottom:14, boxShadow:"0 4px 14px rgba(121,80,242,0.4)" }}
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (en ? "Loading..." : "Cargando...") : mode === "login" ? (en ? "Sign in" : "Iniciar sesión") : (en ? "Create free account" : "Crear cuenta gratis")}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"#F0F0F0" }} />
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>{en ? "or continue with" : "o continúa con"}</div>
            <div style={{ flex:1, height:1, background:"#F0F0F0" }} />
          </div>
          <button
            onClick={async () => { await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); }}
            style={{ width:"100%", padding:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:13.5, fontWeight:500, cursor:"pointer", color:"rgba(255,255,255,0.8)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          >
            {en ? "Continue with Google" : "Continuar con Google"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
