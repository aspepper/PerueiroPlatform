"use client";

import { signOut } from "next-auth/react";

type LogoutButtonVariant = "glass" | "solid";

type LogoutButtonProps = {
  variant?: LogoutButtonVariant;
  className?: string;
};

function getVariantClasses(variant: LogoutButtonVariant) {
  if (variant === "solid") {
    return "inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-3 text-[14px] font-semibold text-[#0F1730] shadow-sm transition hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1730]/30";
  }

  return "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60";
}

export default function LogoutButton({ variant = "glass", className }: LogoutButtonProps) {
  const handleLogout = () => {
    void signOut({ callbackUrl: "/" });
  };

  const variantClasses = getVariantClasses(variant);
  const composedClassName = [variantClasses, className].filter(Boolean).join(" ");

  return (
    <button type="button" onClick={handleLogout} className={composedClassName}>
      <span
        className={`flex items-center justify-center rounded-full ${
          variant === "solid" ? "h-9 w-9 bg-[#0F1730] text-[15px] text-white" : "h-8 w-8 border border-white/20 bg-white/10 text-base"
        }`}
        aria-hidden
      >
        ⎋
      </span>
      Logout
    </button>
  );
}
