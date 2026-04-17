"use client";
import { useRouter } from "next/navigation";

export default function Privacidad() {
  const router = useRouter();
  const D = {
    bg:"#0D0D1F", bg2:"#111122", bg3:"#16162d", border:"rgba(255,255,255,0.1)",
    text:"#fff", text2:"rgba(255,255,255,0.7)", text3:"rgba(255,255,255,0.4)",
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
        <h1 style={{ fontSize:32, fontWeight:500, color:D.text, marginBottom:8, letterSpacing:"-0.03em" }}>Política de Privacidad</h1>
        <p style={{ fontSize:13, color:D.text3, marginBottom:40 }}>Última actualización: marzo 2026</p>

        {[
          { title:"1. Información que recopilamos", body:"Recopilamos: email y contraseña al registrarte, contenido que generas (prompts e imágenes), información de pago procesada por Stripe (no almacenamos datos de tarjetas), y datos de uso del servicio." },
          { title:"2. Cómo usamos tu información", body:"Usamos tu información para: operar y mejorar el servicio, procesar pagos, enviarte actualizaciones importantes del servicio, y personalizar tu experiencia con el Brand Profile." },
          { title:"3. Almacenamiento de datos", body:"Tus datos se almacenan de forma segura en Supabase. Las imágenes generadas se guardan en Supabase Storage. No vendemos ni compartimos tus datos personales con terceros." },
          { title:"4. Servicios de terceros", body:"Usamos: Supabase (base de datos y autenticación), Stripe (pagos), Anthropic Claude (generación de texto), Google Gemini (generación de imágenes). Cada uno tiene sus propias políticas de privacidad." },
          { title:"5. Cookies", body:"Usamos cookies esenciales para mantener tu sesión activa. No usamos cookies de seguimiento publicitario." },
          { title:"6. Tus derechos", body:"Tienes derecho a: acceder a tus datos, corregirlos, eliminarlos, y exportarlos. Para ejercer estos derechos contáctanos en privacy@aistudiobrand.com" },
          { title:"7. Retención de datos", body:"Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos se eliminan en un plazo de 30 días." },
          { title:"8. Seguridad", body:"Implementamos medidas de seguridad estándar de la industria. Sin embargo, ningún sistema es 100% seguro. Te notificaremos en caso de cualquier brecha de seguridad." },
          { title:"9. Contacto", body:"Para preguntas sobre privacidad: privacy@aistudiobrand.com" },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:17, fontWeight:500, color:D.text, marginBottom:10 }}>{s.title}</h2>
            <p style={{ fontSize:14, color:D.text2, lineHeight:1.75 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", padding:"24px 28px", display:"flex", justifyContent:"center", gap:24 }}>
        <button onClick={() => router.push("/terminos")} style={{ fontSize:13, color:D.text3, background:"none", border:"none", cursor:"pointer" }}>Términos de Uso</button>
        <button onClick={() => router.push("/")} style={{ fontSize:13, color:D.text3, background:"none", border:"none", cursor:"pointer" }}>AiStudioBrand</button>
      </div>
    </div>
  );
}