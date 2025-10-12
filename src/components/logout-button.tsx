"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = () => {
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base" aria-hidden>
        ⎋
      </span>
      Logout
    </button>
  );
}
