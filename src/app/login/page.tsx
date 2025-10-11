"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const error = params?.get("error");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    setLoading(false);
  };

  return (
    <div className="container" style={{maxWidth:480, marginTop: "10vh"}}>
      <h1>Perueiros – Login</h1>
      <form onSubmit={onSubmit} className="card" style={{display:"grid", gap:".75rem"}}>
        <label>Email</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Senha</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        {error && <p style={{color:"crimson"}}>Erro: {error}</p>}
      </form>
    </div>
  );
}
