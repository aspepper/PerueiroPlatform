import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/auth-session-provider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Perueiros Admin",
  description: "Painel administrativo para Perueiros",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },                // compat
      { url: "/favicon.svg", type: "image/svg+xml" },       // moderno
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#000000",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
