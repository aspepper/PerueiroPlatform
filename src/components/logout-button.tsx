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
      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)] transition hover:border-rose-200 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-base" aria-hidden>
        ⎋
      </span>
      Logout
    </button>
  );
}
