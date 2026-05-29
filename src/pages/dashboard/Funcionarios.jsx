import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { C } from "../../theme";
import ModalConfirm from "../../components/ModalConfirm";

const CARGOS = ["funcionario", "gerente", "admin"];
const cargoLabel = { funcionario: "Funcionário", gerente: "Gerente", admin: "Admin" };
const cargoCor = {
  funcionario: { bg: "rgba(113,113,122,0.15)", color: "#a1a1aa" },
  gerente: { bg: "rgba(249,115,22,0.15)", color: "#fac775" },
  admin: { bg: "rgba(99,153,34,0.15)", color: "#97c459" },
};

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", cargo: "funcionario" });
  const [formEdit, setFormEdit] = useState({});
  const [criando, setCriando] = useState(false);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState(null);

  function notif(text, tipo = "ok") {
    if (tipo === "ok") setMsg(text); else setErro(text);
    setTimeout(() => { setMsg(""); setErro(""); }, 3000);
  }

  async function carregar() {
    setLoading(true);
    try {
      const data = await apiFetch("/funcionarios");
      setFuncionarios(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function criar() {
    if (!form.nome || !form.email) return notif("Nome e e-mail são obrigatórios.", "err");
    setCriando(true);
    try {
      await apiFetch("/funcionarios", { method: "POST", body: JSON.stringify(form) });
      notif("Funcionário cadastrado!");
      setForm({ nome: "", email: "", cargo: "funcionario" });
      carregar();
    } catch (e) {
      notif(e.message, "err");
    } finally {
      setCriando(false);
    }
  }

  async function salvarEdicao(id) {
    try {
      await apiFetch(`/funcionarios/${id}`, { method: "PUT", body: JSON.stringify(formEdit) });
      notif("Atualizado!");
      setEditandoId(null);
      carregar();
    } catch (e) {
      notif(e.message, "err");
    }
  }

  async function excluir(id, nome) {
    setModal({
      mensagem: `Deseja remover "${nome}"?`,
      aviso: "Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        setModal(null);
        try {
          await apiFetch(`/funcionarios/${id}`, { method: "DELETE" });
          notif("Funcionário removido.");
          carregar();
        } catch (e) {
          notif(e.message, "err");
        }
      },
    });
  }

  const inp = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none" };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Funcionários</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{funcionarios.length} funcionário(s) cadastrado(s)</p>
        </div>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(99,153,34,0.1)", border: "1px solid rgba(99,153,34,0.3)", borderRadius: 8, color: "#97c459", fontSize: 13, marginBottom: 16 }}>{msg}</div>}
      {erro && <div style={{ padding: "10px 16px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 8, color: "#f09595", fontSize: 13, marginBottom: 16 }}>{erro}</div>}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Novo funcionário</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px auto", gap: 10, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Nome</div>
            <input placeholder="Nome completo" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} style={{ ...inp, width: "100%" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>E-mail</div>
            <input placeholder="email@empresa.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ ...inp, width: "100%" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Cargo</div>
            <select value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} style={{ ...inp, width: "100%", cursor: "pointer" }}>
              {CARGOS.map(c => <option key={c} value={c}>{cargoLabel[c]}</option>)}
            </select>
          </div>
          <button onClick={criar} disabled={criando} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {criando ? "..." : "+ Adicionar"}
          </button>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: C.muted }}>Carregando...</div>
        ) : funcionarios.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum funcionário cadastrado.</div>
        ) : funcionarios.map(f => {
          const editando = editandoId === f.id;
          const cor = cargoCor[f.cargo] || cargoCor.funcionario;
          return (
            <div key={f.id} style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
              {editando ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px auto auto", gap: 10, alignItems: "center" }}>
                  <input value={formEdit.nome} onChange={e => setFormEdit(x => ({ ...x, nome: e.target.value }))} style={{ ...inp, width: "100%" }} />
                  <input value={formEdit.email} onChange={e => setFormEdit(x => ({ ...x, email: e.target.value }))} style={{ ...inp, width: "100%" }} />
                  <select value={formEdit.cargo} onChange={e => setFormEdit(x => ({ ...x, cargo: e.target.value }))} style={{ ...inp, width: "100%", cursor: "pointer" }}>
                    {CARGOS.map(c => <option key={c} value={c}>{cargoLabel[c]}</option>)}
                  </select>
                  <button onClick={() => salvarEdicao(f.id)} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                  <button onClick={() => setEditandoId(null)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.orange, flexShrink: 0 }}>
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{f.nome}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{f.email}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: cor.bg, color: cor.color }}>{cargoLabel[f.cargo]}</span>
                  <button onClick={() => { setEditandoId(f.id); setFormEdit({ nome: f.nome, email: f.email, cargo: f.cargo }); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>✏️ Editar</button>
                  <button onClick={() => excluir(f.id, f.nome)} style={{ background: "none", border: "1px solid rgba(226,75,74,0.3)", color: "#f09595", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && <ModalConfirm mensagem={modal.mensagem} aviso={modal.aviso} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
    </div>
  );
}
