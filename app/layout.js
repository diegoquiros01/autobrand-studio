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
          .btn-primary:hover { background-color: #6741d8 !important; transform: translateY(-1px); }
          .btn-primary:active { transform: translateY(0); }
          .btn-secondary:hover { border-color: rgba(121,80,242,0.4) !important; background: rgba(255,255,255,0.06) !important; }
          .card-hover:hover { transform: translateY(-4px); border-color: #7950F2 !important; }
          .input-focus:focus { border-color: #7950F2 !important; box-shadow: 0 0 0 4px rgba(121,80,242,0.15) !important; }
          .link-hover:hover { color: #A78BFA !important; }
        ` }} />
        {children}
      </body>
    </html>
  );
}
