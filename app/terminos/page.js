"use client";
import { useRouter } from "next/navigation";

export default function Terminos() {
  const router = useRouter();
  const D = {
    bg:"#0D0D1F", bg2:"#111122", border:"rgba(255,255,255,0.08)",
    text:"#fff", text2:"rgba(255,255,255,0.55)", text3:"rgba(255,255,255,0.3)",
    purple:"#7950F2", purpleLight:"#A78BFA",
  };

  return (
    <div style={{ minHeight:"100vh", background:D.bg, fontFamily:"Inter, sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid " + D.border, background:D.bg2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:D.purple, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:D.text }}>Ai<span style={{ color:D.purpleLight }}>Studio</span>Brand</span>
        </div>
        <button onClick={() => router.push("/")} style={{ marginLeft:"auto", fontSize:13, color:D.text2, background:"none", border:"none", cursor:"pointer" }}>← Volver</button>
      </nav>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:500, color:D.text, marginBottom:8, letterSpacing:"-0.03em" }}>Términos de Uso</h1>
        <p style={{ fontSize:13, color:D.text3, marginBottom:40 }}>Última actualización: marzo 2026</p>

        {[
          { title:"1. Aceptación de los términos", body:"Al acceder y usar AiStudioBrand, aceptas estos términos de uso. Si no estás de acuerdo, no uses el servicio." },
          { title:"2. Descripción del servicio", body:"AiStudioBrand es una plataforma de inteligencia artificial que genera contenido para redes sociales. Usamos modelos de IA de terceros (Anthropic Claude y Google Gemini) para generar copy e imágenes." },
          { title:"3. Cuentas de usuario", body:"Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Notifica inmediatamente cualquier uso no autorizado de tu cuenta." },
          { title:"4. Suscripciones y pagos", body:"Los planes de pago se cobran mensualmente. Puedes cancelar en cualquier momento. No se realizan reembolsos por períodos parciales. Los precios pueden cambiar con 30 días de aviso previo." },
          { title:"5. Contenido generado", body:"El contenido generado por AiStudioBrand es tuyo. Puedes usarlo comercialmente en tus redes sociales y otros canales digitales. No nos atribuimos derechos sobre el contenido que generas." },
          { title:"6. Uso aceptable", body:"No puedes usar AiStudioBrand para generar contenido ilegal, engañoso, difamatorio, o que viole derechos de terceros. Nos reservamos el derecho de suspender cuentas que violen estas políticas." },
          { title:"7. Limitación de responsabilidad", body:"AiStudioBrand no garantiza que el contenido generado sea preciso, completo o adecuado para tu propósito específico. Usas el servicio bajo tu propio riesgo." },
          { title:"8. Cambios al servicio", body:"Podemos modificar o discontinuar el servicio en cualquier momento. Te notificaremos cambios importantes por email." },
          { title:"9. Contacto", body:"Para preguntas sobre estos términos, contáctanos en legal@aistudiobrand.com" },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:17, fontWeight:500, color:D.text, marginBottom:10 }}>{s.title}</h2>
            <p style={{ fontSize:14, color:D.text2, lineHeight:1.75 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", padding:"24px 28px", display:"flex", justifyContent:"center", gap:24 }}>
        <button onClick={() => router.push("/privacidad")} style={{ fontSize:13, color:D.text3, background:"none", border:"none", cursor:"pointer" }}>Política de Privacidad</button>
        <button onClick={() => router.push("/")} style={{ fontSize:13, color:D.text3, background:"none", border:"none", cursor:"pointer" }}>AiStudioBrand</button>
      </div>
    </div>
  );
}