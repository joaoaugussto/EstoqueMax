import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "#f1f0eb", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Olá, {user?.nome}</h1>
        <p style={{ color: "#888780", marginBottom: 8 }}>Empresa: {user?.empresa}</p>
        <p style={{ color: "#444441", fontSize: 13, marginBottom: 32 }}>Dashboard em construção</p>
        <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#888780", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>
          Sair
        </button>
      </div>
    </div>
  );
}
