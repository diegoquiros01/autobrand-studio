"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.push("/generar"), 5000);
  }, []);

  const D = {
    bg:"#0D0D1F", bg2:"#111122", border:"rgba(255,255,255,0.08)",
    text:"#fff", text2:"rgba(255,255,255,0.55)", purple:"#7950F2", purpleLight:"#A78BFA",
  };

  return (
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:D.bg2, border:"1px solid rgba(64,192,87,0.3)", borderRadius:20, padding:"48px 40px", maxWidth:480, width:"100%", textAlign:"center" }}>
        <div style={{ width:64, height:64, background:"rgba(64,192,87,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28 }}>✓</div>
        <h1 style={{ fontSize:26, fontWeight:500, color:D.text, marginBottom:10, letterSpacing:"-0.02em" }}>Pago exitoso!</h1>
        <p style={{ fontSize:15, color:D.text2, lineHeight:1.65, marginBottom:28 }}>
          Tu suscripción está activa. Ahora tienes acceso completo a AiStudioBrand.
        </p>
        <button onClick={() => router.push("/generar")}
          style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginBottom:10 }}>
          Empezar a generar →
        </button>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Serás redirigido automáticamente en 5 segundos</div>
      </div>
    </div>
  );
}