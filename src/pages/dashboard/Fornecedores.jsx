import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import ModalConfirm from "../../components/ModalConfirm";

const C = {
  orange: "#f97316", red: "#e24b4a",
  surface: "#181818", surface2: "#202020", border: "rgba(255,255,255,0.07)", muted: "#888780", text: "#f1f0eb",
};
const inp = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.text, outline: "none" };
const EMPTY = { nome: "", contato: "", email: "", telefone: "" };

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  function load() {
    apiFetch("/fornecedores").then(setFornecedores).catch(console.error);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await apiFetch("/fornecedores", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY);
      load();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(id) {
    try {
      await apiFetch(`/fornecedores/${id}`, { method: "PUT", body: JSON.stringify(editForm) });
      setEditId(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(id, nome) {
    setModal({
      mensagem: `Deseja remover o fornecedor "${nome}"?`,
      aviso: "Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        setModal(null);
        try {
          await apiFetch(`/fornecedores/${id}`, { method: "DELETE" });
          load();
        } catch (e) {
          setErro(e.message);
        }
      },
    });
  }

  function startEdit(f) {
    setEditId(f.id);
    setEditForm({ nome: f.nome, contato: f.contato || "", email: f.email || "", telefone: f.telefone || "" });
  }

  const FIELDS = [["Nome *", "nome", "Nome da empresa"], ["Contato", "contato", "Nome do contato"], ["E-mail", "email", "email@empresa.com"], ["Telefone", "telefone", "(00) 00000-0000"]];

  function mascaraTelefone(valor) {
    const nums = valor.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return `(${nums}`;
    if (nums.length <= 6) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6)}`;
    return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: -0.5 }}>Fornecedores</h1>

      <form onSubmit={handleAdd} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: C.muted }}>Novo fornecedor</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          {FIELDS.map(([label, key, placeholder]) => (
            <div key={key} style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>{label}</label>
              <input value={form[key]} onChange={e => setForm({ ...form, [key]: key === "telefone" ? mascaraTelefone(e.target.value) : e.target.value })} placeholder={placeholder} style={{ ...inp, width: "100%" }} required={key === "nome"} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
        {erro && <p style={{ fontSize: 12, color: C.red, marginTop: 10 }}>{erro}</p>}
      </form>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface2, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>
              {["Nome", "Contato", "E-mail", "Telefone", "Ações"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fornecedores.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: C.muted }}>Nenhum fornecedor cadastrado.</td></tr>
            ) : fornecedores.map(f => (
              <tr key={f.id} style={{ borderTop: `1px solid ${C.border}` }}>
                {editId === f.id ? (
                  <>
                    {["nome", "contato", "email", "telefone"].map(key => (
                      <td key={key} style={{ padding: "8px 16px" }}>
                        <input value={editForm[key]} onChange={e => setEditForm({ ...editForm, [key]: key === "telefone" ? mascaraTelefone(e.target.value) : e.target.value })} style={{ ...inp, width: "100%" }} />
                      </td>
                    ))}
                    <td style={{ padding: "8px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleSaveEdit(f.id)} style={{ background: C.orange, color: "white", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Salvar</button>
                        <button onClick={() => setEditId(null)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>Cancelar</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{f.nome}</td>
                    <td style={{ padding: "12px 16px", color: C.muted }}>{f.contato || "—"}</td>
                    <td style={{ padding: "12px 16px", color: C.muted }}>{f.email || "—"}</td>
                    <td style={{ padding: "12px 16px", color: C.muted }}>{f.telefone || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(f)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Editar</button>
                        <button onClick={() => excluir(f.id, f.nome)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.red, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Excluir</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <ModalConfirm mensagem={modal.mensagem} aviso={modal.aviso} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
    </div>
  );
}
