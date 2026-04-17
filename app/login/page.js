"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setSuccess("Cuenta creada exitosamente.");
    }
    setLoading(false);
  };

  const inp = { width:"100%", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 13px", fontSize:14, background:"#0A0A18", color:"#fff", outline:"none" };
  const inpClass = "input-focus";

  return (
    <div style={{ minHeight:"100vh", background:"#0D0D1F" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid rgba(255,255,255,0.1)", background:"#111122" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:"#fff" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
      </nav>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 60px)", padding:20 }}>
        <div style={{ background:"#16162d", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"36px 32px", width:"100%", maxWidth:380, boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ width:44, height:44, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:18, margin:"0 auto 10px" }}>Ai</div>
            <div style={{ fontSize:20, fontWeight:500, color:"#fff", marginBottom:4 }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</div>
            <div style={{ fontSize:13.5, color:"rgba(255,255,255,0.7)" }}>Contenido que suena como tú</div>
          </div>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.06)", borderRadius:10, padding:3, marginBottom:20, gap:3 }}>
            <button onClick={() => setMode("login")} style={{ flex:1, padding:8, borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", background: mode==="login" ? "#fff" : "transparent", border:"none", color: mode==="login" ? "#0A0A0A" : "#666", boxShadow: mode==="login" ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>Iniciar sesión</button>
            <button onClick={() => setMode("register")} style={{ flex:1, padding:8, borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer", background: mode==="register" ? "#fff" : "transparent", border:"none", color: mode==="register" ? "#0A0A0A" : "#666", boxShadow: mode==="register" ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>Crear cuenta</button>
          </div>
          {error && <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:8, padding:"10px 13px", color:"#FCA5A5", fontSize:13, marginBottom:12 }}>{error}</div>}
          {success && <div style={{ background:"rgba(64,192,87,0.08)", border:"1px solid rgba(64,192,87,0.2)", borderRadius:8, padding:"10px 13px", color:"#86EFAC", fontSize:13, marginBottom:12 }}>{success}</div>}
          {mode === "register" && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", display:"block", marginBottom:5 }}>Tu nombre</label>
              <input className={inpClass} style={inp} type="text" placeholder="Maria Garcia" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", display:"block", marginBottom:5 }}>Email</label>
            <input className={inpClass} style={inp} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom:4 }}>
            <label style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", display:"block", marginBottom:5 }}>Contrasena</label>
            <input className={inpClass} style={inp} type="password" placeholder="Minimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button
            className="btn-primary"
            style={{ width:"100%", padding:13, background: loading ? "#C5B8FB" : "linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:14.5, fontWeight:500, cursor: loading ? "not-allowed" : "pointer", marginTop:6, marginBottom:14, boxShadow:"0 4px 14px rgba(121,80,242,0.4)" }}
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? "Cargando..." : mode === "login" ? "Iniciar sesion" : "Crear cuenta gratis"}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"#F0F0F0" }} />
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>o continua con</div>
            <div style={{ flex:1, height:1, background:"#F0F0F0" }} />
          </div>
          <button
            onClick={async () => { await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); }}
            style={{ width:"100%", padding:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:13.5, fontWeight:500, cursor:"pointer", color:"rgba(255,255,255,0.8)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          >
            Continuar con Google
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
