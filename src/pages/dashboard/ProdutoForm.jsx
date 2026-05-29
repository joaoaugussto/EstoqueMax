import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api";

const C = {
  orange: "#f97316", red: "#e24b4a",
  surface: "#181818", surface2: "#202020", border: "rgba(255,255,255,0.07)", muted: "#888780", text: "#f1f0eb",
};
const CATEGORIAS = ["Eletrônicos", "Vestuário", "Ferramentas", "Saúde", "Casa", "Outros"];
const inp = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none" };

export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", sku: "", categoria: "", quantidade: "", minimo: "", preco: "", fornecedorId: "" });
  const [fornecedores, setFornecedores] = useState([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/fornecedores").then(setFornecedores).catch(console.error);
    if (id) {
      apiFetch("/produtos").then(produtos => {
        const p = produtos.find(x => x.id === Number(id));
        if (p) setForm({ nome: p.nome, sku: p.sku, categoria: p.categoria, quantidade: p.quantidade, minimo: p.minimo, preco: p.preco, fornecedorId: p.fornecedorId ?? "" });
      }).catch(console.error);
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      if (id) {
        await apiFetch(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/produtos", { method: "POST", body: JSON.stringify(form) });
      }
      navigate("/dashboard/produtos");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  const field = key => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: -0.5 }}>{id ? "Editar produto" : "Novo produto"}</h1>
      <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 32, maxWidth: 620 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Nome *</label>
            <input {...field("nome")} placeholder="Nome do produto" style={inp} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>SKU *</label>
            <input {...field("sku")} placeholder="Código único" style={inp} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Categoria *</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={inp}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Fornecedor</label>
            <select value={form.fornecedorId} onChange={e => setForm({ ...form, fornecedorId: e.target.value })} style={inp}>
              <option value="">Sem fornecedor</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Quantidade</label>
            <input value={form.quantidade === 0 || form.quantidade === "" ? "" : form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} type="number" min="0" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Estoque mínimo</label>
            <input value={form.minimo === 0 || form.minimo === "" ? "" : form.minimo} onChange={e => setForm({ ...form, minimo: e.target.value })} type="number" min="0" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Preço (R$)</label>
            <input value={form.preco === 0 || form.preco === "" ? "" : form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} type="number" min="0" step="0.01" style={inp} />
          </div>
        </div>
        {erro && <p style={{ fontSize: 13, color: C.red, marginTop: 16 }}>{erro}</p>}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="submit" disabled={loading} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard/produtos")} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
