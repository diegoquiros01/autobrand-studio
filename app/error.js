"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A1A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#16162D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "48px 40px", maxWidth: 480, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(220,38,38,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>⚠</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>Algo salió mal</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, lineHeight: 1.6 }}>
          {error?.message || "Ocurrió un error inesperado. Por favor intenta de nuevo."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={reset}
            style={{ padding: "12px 28px", background: "#7950F2", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Reintentar
          </button>
          <button onClick={() => window.location.href = "/"}
            style={{ padding: "12px 28px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
