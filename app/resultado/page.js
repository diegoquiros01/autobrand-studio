"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppLayout from "../components/AppLayout";

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

  return (
    <AppLayout>
      <div style={{ padding: "32px 28px", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 6, letterSpacing: "-0.02em" }}>Resultado generado</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
          {brandProfile ? brandProfile.nombre + " · " + brandProfile.tono : "AiStudioBrand"}
        </p>

        <div className="resultado-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
          <div>
            {imagen ? (
              <div>
                <img
                  src={"data:" + imagen.mimeType + ";base64," + imagen.image}
                  alt="Imagen generada"
                  style={{ width: "100%", borderRadius: 16, display: "block", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = "data:" + imagen.mimeType + ";base64," + imagen.image;
                    a.download = "aistudiobrand.png";
                    a.click();
                  }}
                  style={{ display: "block", width: "100%", marginTop: 10, padding: 12, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Descargar imagen
                </button>
              </div>
            ) : (
              <div>
                <div style={{ background: "linear-gradient(135deg,rgba(121,80,242,0.12),rgba(230,73,128,0.08))", borderRadius: 16, aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.2, color: "#A78BFA" }}>◉</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                    {loadingImg ? "Generando con Gemini..." : "La imagen aparecerá aquí"}
                  </div>
                </div>
                <button
                  onClick={generarImagen}
                  disabled={loadingImg}
                  style={{ width: "100%", marginTop: 10, padding: 14, background: loadingImg ? "rgba(121,80,242,0.4)" : "linear-gradient(135deg,#7950F2,#A78BFA)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loadingImg ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(121,80,242,0.3)" }}
                >
                  {loadingImg ? "Generando con Gemini..." : "Generar imagen con IA"}
                </button>
              </div>
            )}
            {error && (
              <div style={{ marginTop: 10, padding: 12, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, color: "#FCA5A5", fontSize: 13 }}>
                {error}
              </div>
            )}
          </div>

          <div>
            {propuesta ? (
              <div style={{ background: "#16162D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Hook</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>{propuesta.hook}</div>
                </div>
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Copy</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{propuesta.copy}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>CTA</div>
                  <div style={{ fontSize: 14, color: "#7950F2", fontWeight: 600 }}>{propuesta.cta}</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button onClick={() => router.push("/crear")} style={{ flex: 1, padding: 11, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)" }}>
                    Nueva propuesta
                  </button>
                  <button style={{ flex: 1, padding: 11, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#7950F2", color: "#fff" }}>
                    Publicar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: "#16162D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, textAlign: "center" }}>
                <p style={{ marginBottom: 12, color: "rgba(255,255,255,0.4)" }}>No hay propuesta seleccionada.</p>
                <button onClick={() => router.push("/crear")} style={{ padding: "11px 24px", background: "#7950F2", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  Ir al generador
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .resultado-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
}
