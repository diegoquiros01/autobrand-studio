"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Resultado() {
  const router = useRouter();
  const [brandProfile, setBrandProfile] = useState(null);
  const [propuesta, setPropuesta] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
    });
    const bp = localStorage.getItem("brandProfile");
    const prop = localStorage.getItem("selectedPropuesta");
    if (bp) setBrandProfile(JSON.parse(bp));
    if (prop) setPropuesta(JSON.parse(prop));
  }, []);

  const generarImagen = async () => {
    if (!propuesta) return;
    setLoadingImg(true);
    setError("");
    setImagen(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: propuesta.hook + ". " + propuesta.copy, brandProfile }),
      });
      const data = await res.json();
      if (data.image) setImagen(data);
      else setError("No se pudo generar la imagen.");
    } catch (e) {
      setError("Error generando imagen.");
    }
    setLoadingImg(false);
  };

  const navStyle = { display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid #F0F0F0", background:"#fff", gap:8, position:"sticky", top:0, zIndex:100 };
  const logoIcon = { width:32, height:32, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <nav style={navStyle}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={logoIcon}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:"#0A0A0A" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <button onClick={() => router.push("/")} style={{ marginLeft:"auto", padding:"7px 16px", background:"#fff", color:"#0A0A0A", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13.5, fontWeight:500, cursor:"pointer" }}>
          Volver
        </button>
      </nav>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"40px 28px" }}>
        <h1 style={{ fontSize:26, fontWeight:500, color:"#0A0A0A", marginBottom:6, letterSpacing:"-0.02em" }}>Resultado generado</h1>
        <p style={{ fontSize:14, color:"#888", marginBottom:32 }}>
          {brandProfile ? brandProfile.nombre + " · " + brandProfile.tono : "AiStudioBrand"}
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"start" }}>
          <div>
            {imagen ? (
              <div>
                <img
                  src={"data:" + imagen.mimeType + ";base64," + imagen.image}
                  alt="Imagen generada"
                  style={{ width:"100%", borderRadius:16, display:"block", border:"1.5px solid #EAEAEA" }}
                />
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = "data:" + imagen.mimeType + ";base64," + imagen.image;
                    a.download = "aistudiobrand.png";
                    a.click();
                  }}
                  style={{ display:"block", width:"100%", marginTop:10, padding:"11px", background:"#F5F5F5", color:"#333", border:"1.5px solid #E0E0E0", borderRadius:9, textAlign:"center", fontSize:13.5, fontWeight:500, cursor:"pointer" }}
                >
                  Descargar imagen
                </button>
              </div>
            ) : (
              <div>
                <div style={{ background:"linear-gradient(135deg,#F3F0FF,#EBF4FF)", borderRadius:16, aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:"1.5px solid #E8E8E8" }}>
                  <div style={{ fontSize:40, marginBottom:10, opacity:0.3 }}>◉</div>
                  <div style={{ fontSize:14, color:"#888" }}>
                    {loadingImg ? "Generando con Gemini..." : "La imagen aparecerá aquí"}
                  </div>
                </div>
                <button
                  onClick={generarImagen}
                  disabled={loadingImg}
                  style={{ width:"100%", marginTop:10, padding:14, background:loadingImg ? "#C5B8FB" : "linear-gradient(135deg,#E64980,#7950F2)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:500, cursor:loadingImg ? "not-allowed" : "pointer" }}
                >
                  {loadingImg ? "Generando con Gemini..." : "Generar imagen con IA"}
                </button>
              </div>
            )}
            {error && (
              <div style={{ marginTop:10, padding:12, background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:9, color:"#DC2626", fontSize:13 }}>
                {error}
              </div>
            )}
          </div>

          <div>
            {propuesta ? (
              <div style={{ background:"#fff", border:"1.5px solid #EAEAEA", borderRadius:14, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ marginBottom:18, paddingBottom:18, borderBottom:"1px solid #F0F0F0" }}>
                  <div style={{ fontSize:11, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7 }}>Hook</div>
                  <div style={{ fontSize:16, fontWeight:500, color:"#0A0A0A", lineHeight:1.5 }}>{propuesta.hook}</div>
                </div>
                <div style={{ marginBottom:18, paddingBottom:18, borderBottom:"1px solid #F0F0F0" }}>
                  <div style={{ fontSize:11, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7 }}>Copy</div>
                  <div style={{ fontSize:13.5, color:"#555", lineHeight:1.7 }}>{propuesta.copy}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7 }}>CTA</div>
                  <div style={{ fontSize:14, color:"#7950F2", fontWeight:500 }}>{propuesta.cta}</div>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:20 }}>
                  <button onClick={() => router.push("/")} style={{ flex:1, padding:10, border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background:"#fff", color:"#333" }}>
                    Nueva propuesta
                  </button>
                  <button style={{ flex:1, padding:10, border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", background:"#7950F2", color:"#fff" }}>
                    Publicar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background:"#F9F9F9", border:"1.5px solid #EAEAEA", borderRadius:14, padding:24, textAlign:"center", color:"#888" }}>
                <p style={{ marginBottom:12 }}>No hay propuesta seleccionada.</p>
                <button onClick={() => router.push("/")} style={{ padding:"10px 20px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500 }}>
                  Ir al generador
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
