import "./globals.css";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Perueiros Admin",
  description: "Painel administrativo para Perueiros",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await auth();
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
