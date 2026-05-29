import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import BarcodeScanner from "../../components/BarcodeScanner";

const C = {
  orange: "#f97316", green: "#639922", red: "#e24b4a",
  surface: "#181818", surface2: "#202020", border: "rgba(255,255,255,0.07)", muted: "#888780", text: "#f1f0eb",
};
const inp = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.text, outline: "none" };

export default function Movimentacoes() {
  const [movs, setMovs] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ produtoId: "", tipo: "entrada", quantidade: 1, obs: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerAberto, setScannerAberto] = useState(false);

  function load() {
    Promise.all([apiFetch("/movimentacoes"), apiFetch("/produtos")]).then(([m, p]) => {
      setMovs(m);
      setProdutos(p);
      if (p.length > 0) setForm(f => ({ ...f, produtoId: f.produtoId || String(p[0].id) }));
    }).catch(console.error);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await apiFetch("/movimentacoes", { method: "POST", body: JSON.stringify(form) });
      load();
      setForm(f => ({ ...f, quantidade: 1, obs: "" }));
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: -0.5 }}>Movimentações</h1>

      <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: C.muted }}>Registrar movimentação</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Produto</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={form.produtoId} onChange={e => setForm({ ...form, produtoId: e.target.value })} style={{ ...inp, minWidth: 200 }}>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <button type="button" onClick={() => setScannerAberto(true)} title="Escanear" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 10px", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Tipo</label>
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={inp}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Quantidade</label>
            <input type="number" min="1" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} style={{ ...inp, width: 100 }} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 6 }}>Observação</label>
            <input value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })} placeholder="Opcional" style={{ ...inp, width: "100%" }} />
          </div>
          <button type="submit" disabled={loading || produtos.length === 0} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>
        {erro && <p style={{ fontSize: 12, color: C.red, marginTop: 10 }}>{erro}</p>}
      </form>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface2, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>
              {["Produto", "Tipo", "Quantidade", "Observação", "Data"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: C.muted }}>Nenhuma movimentação registrada.</td></tr>
            ) : movs.map(m => (
              <tr key={m.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>{m.produto.nome}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: m.tipo === "entrada" ? C.green : C.red, fontWeight: 500 }}>
                    {m.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>{m.quantidade}</td>
                <td style={{ padding: "12px 16px", color: C.muted }}>{m.obs || "—"}</td>
                <td style={{ padding: "12px 16px", color: C.muted }}>{new Date(m.criadoEm).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {scannerAberto && (
        <BarcodeScanner
          onResult={(sku) => {
            setScannerAberto(false);
            const produto = produtos.find(p =>
              p.sku.toLowerCase() === sku.toLowerCase() ||
              p.sku.toLowerCase().includes(sku.toLowerCase())
            );
            if (produto) {
              setForm(f => ({ ...f, produtoId: String(produto.id) }));
            } else {
              alert(`Produto com SKU "${sku}" não encontrado.`);
            }
          }}
          onClose={() => setScannerAberto(false)}
        />
      )}
    </div>
  );
}
