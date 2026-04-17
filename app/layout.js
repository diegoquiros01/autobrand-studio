import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "AiStudioBrand - Contenido que suena como tú",
  description: "IA que aprende el ADN de tu marca y genera contenido para Instagram en segundos",
};
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in { animation: fade-in 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
          .btn-primary:hover { background-color: #6741d8 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(121,80,242,0.5) !important; }
          .btn-primary:active { transform: scale(0.97) !important; }
          .btn-secondary:hover { border-color: rgba(121,80,242,0.4) !important; background: rgba(255,255,255,0.06) !important; }
          .card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); border-color: #7950F2 !important; }
          .input-focus:focus { border-color: #7950F2 !important; box-shadow: 0 0 0 4px rgba(121,80,242,0.2) !important; }
          .link-hover:hover { color: #A78BFA !important; }
          .pulse-glow { animation: pulse-glow 2s infinite; }
        ` }} />
        {children}
      </body>
    </html>
  );
}
