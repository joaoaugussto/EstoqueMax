import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { C } from "../../theme";
import { apiFetch } from "../../api";

export default function Configuracoes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [notificacoes, setNotificacoes] = useState(() => {
    return localStorage.getItem("notificacoes_ativas") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("notificacoes_ativas", notificacoes);
  }, [notificacoes]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  function Toggle({ on, set }) {
    return (
      <div onClick={() => set(!on)} style={{ width: 42, height: 24, borderRadius: 20, background: on ? C.orange : C.surface2, border: `1px solid ${on ? C.orange : C.border}`, cursor: "pointer", position: "relative", transition: "background 0.2s, border-color 0.2s", flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: on ? 20 : 2, transition: "left 0.2s" }} />
      </div>
    );
  }

  const section = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" };
  const sectionHeader = { padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 };
  const row = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px" };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text, maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Configurações</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Gerencie sua conta e preferências.</p>
      </div>

      <div style={section}>
        <div style={sectionHeader}>
          <span>👤</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Minha conta</span>
        </div>
        {[["Nome", user?.nome, true], ["E-mail", user?.email, false], ["Empresa", user?.empresa, true]].map(([label, value, bold]) => (
          <div key={label} style={{ ...row, borderBottom: label !== "Empresa" ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: bold ? 500 : 400 }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={section}>
        <div style={sectionHeader}>
          <span>🎨</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Aparência</span>
        </div>
        <div style={{ ...row, borderBottom: "none" }}>
          <div>
            <div style={{ fontSize: 13 }}>Modo escuro</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Alterna entre tema escuro e claro</div>
          </div>
          <Toggle on={darkMode} set={setDarkMode} />
        </div>
      </div>

      <div style={section}>
        <div style={sectionHeader}>
          <span>🔔</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Notificações</span>
        </div>
        <div style={{ ...row, borderBottom: "none" }}>
          <div>
            <div style={{ fontSize: 13 }}>Alertas de estoque crítico</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Receba alertas quando produtos atingirem o mínimo</div>
          </div>
          <Toggle on={notificacoes} set={setNotificacoes} />
        </div>
      </div>

      <button onClick={handleLogout} style={{ width: "100%", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", color: "#f09595", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
        Sair do sistema
      </button>
    </div>
  );
}
