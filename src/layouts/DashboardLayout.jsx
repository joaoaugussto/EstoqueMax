import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notificacoes from "../components/Notificacoes";
import logo from "../assets/logo.png";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "📊", end: true },
  { to: "/dashboard/produtos", label: "Produtos", icon: "📦" },
  { to: "/dashboard/movimentacoes", label: "Movimentações", icon: "🔄" },
  { to: "/dashboard/pedidos", label: "Pedidos", icon: "🛒" },
  { to: "/dashboard/depositos", label: "Depósitos", icon: "🏭" },
  { to: "/dashboard/fornecedores", label: "Fornecedores", icon: "🏢" },
  { to: "/dashboard/relatorios", label: "Relatórios", icon: "📈" },
  { to: "/dashboard/financeiro", label: "Financeiro", icon: "💰" },
  { to: "/dashboard/funcionarios", label: "Funcionários", icon: "👥" },
  { to: "/dashboard/configuracoes", label: "Configurações", icon: "⚙️" },
];

const C = {
  bg: "#0f0f0f", surface: "#181818", border: "rgba(255,255,255,0.07)",
  orange: "#f97316", orangeDim: "rgba(249,115,22,0.1)", muted: "#888780", text: "#f1f0eb",
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; }`}</style>

      <aside style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <img src={logo} alt="EstoqueMax" style={{ width: 80, height: 80, objectFit: "contain" }} />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.4 }}>Estoque<span style={{ color: "#f97316" }}>Max</span></span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 2,
              background: isActive ? C.orangeDim : "transparent",
              color: isActive ? C.orange : C.muted,
              borderLeft: `2px solid ${isActive ? C.orange : "transparent"}`,
            })}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.nome}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{user?.empresa}</div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 12 }}>
            Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface, gap: 12, flexShrink: 0 }}>
          <Notificacoes />
          <div style={{ fontSize: 13, color: C.muted }}>{user?.nome}</div>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
