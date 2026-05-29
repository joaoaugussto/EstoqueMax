import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./theme";
import { BtnOrange } from "./components";
import { useAuth } from "./context/AuthContext";
import logo from "./assets/logo.png";

const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const EyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [verSenha, setVerSenha] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro); return; }
      login(data.token, data.user);
      navigate("/dashboard");
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, marginBottom: 16, outline: "none" };
  const eyeBtnStyle = { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src={logo} alt="EstoqueMax" style={{ width: 80, height: 80, objectFit: "contain" }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>Estoque<span style={{ color: "#f97316" }}>Max</span></span>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 420, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, position: "relative" }}>
        <button onClick={() => navigate("/admin")} style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", color: "#444441", fontSize: 14, cursor: "pointer", padding: 4, lineHeight: 1 }} title="Painel admin">🛡️</button>
        <form onSubmit={handleLogin}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 6, letterSpacing: -0.3 }}>Boas-vindas de volta</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Entre na sua conta para acessar o painel</p>
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>E-mail</label>
          <input
            placeholder="seu@email.com"
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            style={inputStyle}
          />
          <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Senha</label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              type={verSenha ? "text" : "password"}
              placeholder="••••••••"
              value={loginForm.senha}
              onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
              style={{ ...inputStyle, marginBottom: 0, paddingRight: 40 }}
            />
            <button type="button" onClick={() => setVerSenha(!verSenha)} style={eyeBtnStyle}>
              {verSenha ? <EyeOff /> : <EyeOn />}
            </button>
          </div>
          {erro && <p style={{ fontSize: 12, color: "#e24b4a", marginBottom: 12, marginTop: -8 }}>{erro}</p>}
          <BtnOrange full size="lg" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no painel →"}
          </BtnOrange>
        </form>
      </div>
      <button onClick={() => navigate("/")} style={{ marginTop: 20, background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer" }}>← Voltar ao site</button>
    </div>
  );
}
