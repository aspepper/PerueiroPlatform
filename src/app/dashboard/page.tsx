import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [students, drivers, vans, pendingPayments] = await Promise.all([
    prisma.student.count(),
    prisma.driver.count(),
    prisma.van.count(),
    prisma.payment.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="container">
      <h1>Painel</h1>
      <div className="grid" style={{marginTop:"1rem"}}>
        <div className="card"><h3>Alunos</h3><div style={{fontSize:32}}>{students}</div></div>
        <div className="card"><h3>Motoristas</h3><div style={{fontSize:32}}>{drivers}</div></div>
        <div className="card"><h3>Vans</h3><div style={{fontSize:32}}>{vans}</div></div>
        <div className="card"><h3>Boletos pendentes</h3><div style={{fontSize:32}}>{pendingPayments}</div></div>
      </div>

      <div className="card" style={{marginTop:"1rem"}}>
        <h3>Ações rápidas</h3>
        <ul>
          <li><Link href="/students">Gerenciar alunos</Link></li>
          <li><Link href="/drivers">Gerenciar motoristas</Link></li>
          <li><Link href="/vans">Gerenciar vans</Link></li>
          <li><Link href="/payments">Ver boletos</Link></li>
        </ul>
      </div>
    </div>
  );
}
