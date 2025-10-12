"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Failed to sign out", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.45)] transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500"
        aria-hidden="true"
      >
        ⎋
      </span>
      <span>{isLoading ? "Saindo..." : "Sair"}</span>
    </button>
  );
}

export default LogoutButton;
