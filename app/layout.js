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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
