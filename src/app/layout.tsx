import "./globals.css";
import { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/auth-session-provider";

export const metadata = {
  title: "Perueiros Admin",
  description: "Painel administrativo para Perueiros",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
