import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../theme";
import ModalConfirm from "../components/ModalConfirm";
import logo from "../assets/logo.png";

const BASE = import.meta.env.VITE_API_URL;

function adminHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function notify(setMsg, setMsgType, text, type = "ok") {
  setMsg(text);
  setMsgType(type);
  setTimeout(() => setMsg(""), 3500);
}

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

export default function Admin() {
  const navigate = useNavigate();
  const [adminReady, setAdminReady] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [senha, setSenha] = useState("");
  const [authErro, setAuthErro] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("ok");

  const [novoNome, setNovoNome] = useState("");
  const [novaEmpresa, setNovaEmpresa] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [criando, setCriando] = useState(false);

  const [resetId, setResetId] = useState(null);
  const [resetSenha, setResetSenha] = useState("");

  const [modal, setModal] = useState(null);
  const [verSenhaAdmin, setVerSenhaAdmin] = useState(false);
  const [verSenhaNova, setVerSenhaNova] = useState(false);
  const [verSenhaReset, setVerSenhaReset] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErro("");
    try {
      const res = await fetch(`${BASE}/admin/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthErro("Senha incorreta."); return; }
      setAdminToken(data.token);
      setAdminReady(true);
    } catch {
      setAuthErro("Erro ao verificar senha.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function carregarClientes() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/admin/clientes`, { headers: adminHeaders(adminToken) });
      const data = await res.json();
      setClientes(data);
    } catch {
      notify(setMsg, setMsgType, "Falha ao carregar clientes.", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (adminReady) carregarClientes(); }, [adminReady]);

  async function criarCliente() {
    if (!novoNome || !novaEmpresa || !novoEmail || !novaSenha)
      return notify(setMsg, setMsgType, "Preencha todos os campos.", "err");
    setCriando(true);
    try {
      const res = await fetch(`${BASE}/admin/cadastrar`, {
        method: "POST",
        headers: adminHeaders(adminToken),
        body: JSON.stringify({ nome: novoNome, empresa: novaEmpresa, email: novoEmail, senha: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) { notify(setMsg, setMsgType, data.erro, "err"); return; }
      notify(setMsg, setMsgType, `Cliente "${novoNome}" cadastrado com sucesso!`);
      setNovoNome(""); setNovaEmpresa(""); setNovoEmail(""); setNovaSenha("");
      carregarClientes();
    } catch {
      notify(setMsg, setMsgType, "Falha ao criar cliente.", "err");
    } finally {
      setCriando(false);
    }
  }

  async function toggleStatus(id, isActive) {
    try {
      await fetch(`${BASE}/admin/clientes/${id}/status`, {
        method: "PATCH",
        headers: adminHeaders(adminToken),
        body: JSON.stringify({ isActive: !isActive }),
      });
      notify(setMsg, setMsgType, `Conta ${!isActive ? "ativada" : "desativada"}.`);
      carregarClientes();
    } catch {
      notify(setMsg, setMsgType, "Falha ao alterar status.", "err");
    }
  }

  async function resetarSenha(id) {
    if (!resetSenha || resetSenha.length < 6)
      return notify(setMsg, setMsgType, "Senha deve ter pelo menos 6 caracteres.", "err");
    try {
      await fetch(`${BASE}/admin/clientes/${id}/resetar-senha`, {
        method: "POST",
        headers: adminHeaders(adminToken),
        body: JSON.stringify({ novaSenha: resetSenha }),
      });
      notify(setMsg, setMsgType, "Senha resetada com sucesso!");
      setResetId(null);
      setResetSenha("");
      setVerSenhaReset(false);
    } catch {
      notify(setMsg, setMsgType, "Falha ao resetar senha.", "err");
    }
  }

  async function deletarCliente(id, nome) {
    setModal({
      mensagem: `Remover o cliente "${nome}"?`,
      aviso: "Todos os dados serão perdidos permanentemente.",
      onConfirm: async () => {
        setModal(null);
        try {
          await fetch(`${BASE}/admin/clientes/${id}`, { method: "DELETE", headers: adminHeaders(adminToken) });
          notify(setMsg, setMsgType, "Cliente removido.");
          carregarClientes();
        } catch {
          notify(setMsg, setMsgType, "Falha ao remover.", "err");
        }
      },
    });
  }

  const inp = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none" };
  const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 12 };
  const eyeBtn = { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 };

  if (!adminReady) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ width: "100%", maxWidth: 380, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>🛡️</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6, textAlign: "center" }}>Painel Administrativo</h1>
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 24 }}>Acesso restrito. Informe a senha de administrador.</p>
          <form onSubmit={handleAuth}>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                type={verSenhaAdmin ? "text" : "password"}
                placeholder="Senha de administrador"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                style={{ ...inp, width: "100%", paddingRight: 36 }}
                autoFocus
              />
              <button type="button" onClick={() => setVerSenhaAdmin(!verSenhaAdmin)} style={eyeBtn}>
                {verSenhaAdmin ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {authErro && <p style={{ fontSize: 12, color: "#f09595", marginBottom: 12 }}>{authErro}</p>}
            <button type="submit" disabled={authLoading || !senha} style={{ width: "100%", background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {authLoading ? "Verificando..." : "Entrar"}
            </button>
          </form>
          <button onClick={() => navigate("/login")} style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", marginTop: 16 }}>← Voltar ao login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 24px", fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Painel Administrativo</h1>
            <p style={{ fontSize: 13, color: C.muted }}>Gerencie clientes e acessos do EstoqueMax.</p>
          </div>
          <button onClick={() => { setAdminReady(false); setAdminToken(""); setSenha(""); }} style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>
            Sair do admin
          </button>
        </div>

        {msg && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, fontSize: 13, background: msgType === "ok" ? "rgba(99,153,34,0.1)" : "rgba(226,75,74,0.1)", border: `1px solid ${msgType === "ok" ? "rgba(99,153,34,0.3)" : "rgba(226,75,74,0.3)"}`, color: msgType === "ok" ? "#97c459" : "#f09595" }}>
            {msg}
          </div>
        )}

        <div style={card}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Cadastrar novo cliente</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} style={{ ...inp, width: "100%" }} />
            <input placeholder="Empresa" value={novaEmpresa} onChange={e => setNovaEmpresa(e.target.value)} style={{ ...inp, width: "100%" }} />
            <input placeholder="E-mail" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={{ ...inp, width: "100%" }} />
            <div style={{ position: "relative" }}>
              <input
                type={verSenhaNova ? "text" : "password"}
                placeholder="Senha inicial"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                style={{ ...inp, width: "100%", paddingRight: 36 }}
              />
              <button type="button" onClick={() => setVerSenhaNova(!verSenhaNova)} style={eyeBtn}>
                {verSenhaNova ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
          </div>
          <button onClick={criarCliente} disabled={criando} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {criando ? "Cadastrando..." : "+ Cadastrar cliente"}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>Clientes cadastrados ({clientes.length})</h2>
          <button onClick={carregarClientes} disabled={loading} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
            {loading ? "..." : "↻ Atualizar"}
          </button>
        </div>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} style={{ height: 80, background: C.surface, borderRadius: 12, marginBottom: 12, opacity: 0.5 }} />)
        ) : clientes.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>Nenhum cliente cadastrado.</div>
        ) : (
          clientes.map(c => (
            <div key={c.id} style={card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{c.nome}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: c.isActive ? "rgba(99,153,34,0.15)" : "rgba(226,75,74,0.15)", color: c.isActive ? "#97c459" : "#f09595" }}>
                      {c.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{c.empresa} · {c.email}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>
                    {c._count.produtos} produto(s) · {c._count.fornecedores} fornecedor(es) · {c._count.movimentacoes} movimentação(ões)
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setResetId(resetId === c.id ? null : c.id); setResetSenha(""); setVerSenhaReset(false); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>🔑 Senha</button>
                  <button onClick={() => toggleStatus(c.id, c.isActive)} style={{ background: "none", border: `1px solid ${C.border}`, color: c.isActive ? "#f09595" : "#97c459", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>
                    {c.isActive ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => deletarCliente(c.id, c.nome)} style={{ background: "none", border: "1px solid rgba(226,75,74,0.3)", color: "#f09595", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                </div>
              </div>
              {resetId === c.id && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type={verSenhaReset ? "text" : "password"}
                      placeholder="Nova senha (mín. 6 caracteres)"
                      value={resetSenha}
                      onChange={e => setResetSenha(e.target.value)}
                      style={{ ...inp, width: "100%", paddingRight: 36 }}
                    />
                    <button type="button" onClick={() => setVerSenhaReset(!verSenhaReset)} style={eyeBtn}>
                      {verSenhaReset ? <EyeOff /> : <EyeOn />}
                    </button>
                  </div>
                  <button onClick={() => resetarSenha(c.id)} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Resetar</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {modal && <ModalConfirm mensagem={modal.mensagem} aviso={modal.aviso} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
    </div>
  );
}
