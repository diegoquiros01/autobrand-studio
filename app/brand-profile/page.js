"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BrandProfile() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    nombre: "",
    descripcion: "",
    audiencia: "",
    tono: "",
    idioma: "Español",
    categorias: [],
    competencia: "",
    propuestaValor: "",
  });

  const tonos = ["Empoderador", "Cercano", "Profesional", "Divertido", "Inspiracional", "Educativo"];
  const idiomas = ["Español", "Inglés", "Spanglish"];
  const cats = ["Coaching", "Lifestyle", "Moda", "Belleza", "Negocio", "Motivación", "Educación", "Fitness"];

  const toggleCat = (cat) => {
    setProfile(p => ({
      ...p,
      categorias: p.categorias.includes(cat)
        ? p.categorias.filter(c => c !== cat)
        : [...p.categorias, cat]
    }));
  };

  const guardar = () => {
    localStorage.setItem("brandProfile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => router.push("/"), 1500);
  };

  const inp = {
    width: "100%",
    border: "1.5px solid #e5e7eb",
    borderRadius: 9,
    padding: "11px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    background: "#F8F8FC",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F8FC", fontFamily: "Inter, sans-serif" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14 }}>A</div>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#0A0A1A" }}>AutoBrand Studio</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#7C3AED", fontWeight: 600, cursor: "pointer" }} onClick={() => router.push("/")}>← Volver</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Configuración</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0A0A1A", letterSpacing: "-0.03em", marginBottom: 8 }}>Brand Profile</h1>
          <p style={{ color: "#666", fontSize: 15 }}>Cuéntanos sobre tu marca. AutoBrand usará esta información para generar contenido que suena exactamente como tú.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Tu marca</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 6 }}>Nombre de tu marca o cuenta</label>
                <input style={inp} placeholder="Ej: @soyluciana.co" value={profile.nombre} onChange={e => setProfile(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 6 }}>¿Qué haces? Descríbelo en 2-3 oraciones</label>
                <textarea style={{ ...inp, minHeight: 80, resize: "none" }} placeholder="Ej: Soy coach de negocios para mujeres latinas en EE.UU. Ayudo a mis clientas a monetizar su expertise y construir un negocio digital consistente." value={profile.descripcion} onChange={e => setProfile(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 6 }}>¿A quién le hablas? (tu audiencia ideal)</label>
                <input style={inp} placeholder="Ej: Mujeres latinas de 28-42 años viviendo en EE.UU., emprendedoras o con ganas de serlo" value={profile.audiencia} onChange={e => setProfile(p => ({ ...p, audiencia: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 6 }}>¿Cuál es tu propuesta de valor única?</label>
                <input style={inp} placeholder="Ej: Combino estrategia de negocios con identidad cultural latina" value={profile.propuestaValor} onChange={e => setProfile(p => ({ ...p, propuestaValor: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Comunicación</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 10 }}>Idioma principal</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {idiomas.map(i => (
                    <button key={i} onClick={() => setProfile(p => ({ ...p, idioma: i }))}
                      style={{ padding: "8px 16px", borderRadius: 8, border: profile.idioma === i ? "2px solid #7C3AED" : "1.5px solid #e5e7eb", background: profile.idioma === i ? "#F0EDFF" : "transparent", color: profile.idioma === i ? "#7C3AED" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 10 }}>Tono de voz (selecciona los que aplican)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tonos.map(t => (
                    <button key={t} onClick={() => setProfile(p => ({ ...p, tono: t }))}
                      style={{ padding: "7px 14px", borderRadius: 8, border: profile.tono === t ? "2px solid #7C3AED" : "1.5px solid #e5e7eb", background: profile.tono === t ? "#F0EDFF" : "transparent", color: profile.tono === t ? "#7C3AED" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#0A0A1A", display: "block", marginBottom: 10 }}>Categorías de contenido</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {cats.map(c => (
                    <button key={c} onClick={() => toggleCat(c)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: profile.categorias.includes(c) ? "2px solid #7C3AED" : "1.5px solid #e5e7eb", background: profile.categorias.includes(c) ? "#F0EDFF" : "transparent", color: profile.categorias.includes(c) ? "#7C3AED" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={guardar}
            style={{ padding: "15px", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" }}>
            {saved ? "✓ Guardado — redirigiendo..." : "Guardar Brand Profile →"}
          </button>

        </div>
      </div>
    </div>
  );
}
