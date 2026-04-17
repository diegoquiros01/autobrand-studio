// AiStudioBrand — Shared Theme
// Used across all dark-themed pages

export const D = {
  bg: "#0D0D1F",
  surface: "#16162d",
  bg3: "#16162d",
  border: "rgba(255,255,255,0.1)",
  text: "#fff",
  text2: "rgba(255,255,255,0.7)",
  text3: "rgba(255,255,255,0.4)",
  purple: "#7950F2",
  purpleLight: "#A78BFA",
  purpleDark: "#6741d8",
  success: "#40C057",
  error: "#DC2626",
};

export const glass = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
};

export const inp = {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "12px 16px",
  color: "#fff",
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  transition: "all 0.2s ease",
};

export const btnPrimary = {
  backgroundColor: "#7950F2",
  color: "#fff",
  padding: "14px 28px",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(121,80,242,0.4)",
  transition: "background-color 0.2s ease, transform 0.1s ease",
  fontFamily: "Inter, sans-serif",
};

export const btnSecondary = {
  padding: "14px 28px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 500,
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "Inter, sans-serif",
};

export const card = {
  backgroundColor: "#16162d",
  border: "1px solid rgba(121,80,242,0.15)",
  borderRadius: 16,
  padding: "32px 24px",
  transition: "transform 0.2s ease, border-color 0.2s ease",
};

export const backgroundGlow = {
  position: "fixed",
  top: "-10%",
  right: "-5%",
  width: 500,
  height: 500,
  background: "radial-gradient(circle, rgba(121,80,242,0.08) 0%, rgba(13,13,31,0) 70%)",
  filter: "blur(80px)",
  zIndex: -1,
  pointerEvents: "none",
};

export const gradientText = {
  background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

// Global CSS string to inject via <style> tag for hover/focus states
export const globalStyles = `
  .btn-primary:hover { background-color: #6741d8 !important; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary:hover { border-color: rgba(121,80,242,0.4) !important; background: rgba(255,255,255,0.06) !important; }
  .card-hover:hover { transform: translateY(-4px); border-color: #7950F2 !important; }
  .input-focus:focus { border-color: #7950F2 !important; box-shadow: 0 0 0 4px rgba(121,80,242,0.15) !important; }
  .link-hover:hover { color: #A78BFA !important; }
`;
