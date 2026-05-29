import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { C } from "../../theme";

export default function ProdutoHistorico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    apiFetch(`/produtos/${id}/historico`)
      .then(setDados)
      .catch(() => navigate("/dashboard/produtos"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: C.muted, textAlign: "center" }}>Carregando...</div>;
  if (!dados) return null;

  const { produto, movimentacoes, totalEntradas, totalSaidas } = dados;

  const filtradas = movimentacoes.filter(m => filtro === "todos" || m.tipo === filtro);

  const statusInfo = () => {
    if (produto.quantidade === 0) return { label: "Zerado", color: "#f09595", bg: "rgba(226,75,74,0.15)" };
    if (produto.quantidade <= produto.minimo) return { label: "Crítico", color: "#f09595", bg: "rgba(226,75,74,0.15)" };
    if (produto.quantidade <= produto.minimo * 1.5) return { label: "Baixo", color: "#fac775", bg: "rgba(186,117,23,0.15)" };
    return { label: "Ok", color: "#97c459", bg: "rgba(99,153,34,0.15)" };
  };

  const s = statusInfo();
  const td = { padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13 };
  const th = { textAlign: "left", padding: "10px 16px", color: C.muted, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, background: C.surface2, whiteSpace: "nowrap" };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/dashboard/produtos")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>←</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Histórico do produto</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{produto.nome} · {produto.sku}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Estoque atual", value: produto.quantidade, color: "#f97316", sub: `Mínimo: ${produto.minimo}` },
          { label: "Total de entradas", value: `+${totalEntradas}`, color: "#97c459", sub: "unidades recebidas" },
          { label: "Total de saídas", value: `-${totalSaidas}`, color: "#f09595", sub: "unidades saídas" },
          { label: "Valor unitário", value: `R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}`, color: "#378add", sub: `Total: R$ ${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}` },
        ].map(k => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20, padding: 18, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Categoria</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{produto.categoria}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Fornecedor</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{produto.fornecedor?.nome || "Sem fornecedor"}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Status</div>
          <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 500, background: s.bg, color: s.color }}>{s.label}</span>
        </div>
        <div>
          <button onClick={() => navigate(`/dashboard/produtos/${id}/editar`)} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            ✏️ Editar produto
          </button>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Movimentações ({filtradas.length})</span>
          <div style={{ display: "flex", gap: 8 }}>
            {[["todos", "Todos", C.orange, C.orangeBorder, C.orangeDim], ["entrada", "Entradas", "#97c459", "rgba(99,153,34,0.3)", "rgba(99,153,34,0.15)"], ["saida", "Saídas", "#f09595", "rgba(226,75,74,0.3)", "rgba(226,75,74,0.15)"]].map(([val, label, activeColor, activeBorder, activeBg]) => (
              <button key={val} onClick={() => setFiltro(val)} style={{ background: filtro === val ? activeBg : "none", border: `1px solid ${filtro === val ? activeBorder : C.border}`, color: filtro === val ? activeColor : C.muted, borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: filtro === val ? 600 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma movimentação encontrada.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Data", "Tipo", "Quantidade", "Observação"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(m => (
                  <tr key={m.id}>
                    <td style={td}>{new Date(m.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={td}>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: m.tipo === "entrada" ? "rgba(99,153,34,0.15)" : "rgba(226,75,74,0.15)", color: m.tipo === "entrada" ? "#97c459" : "#f09595" }}>
                        {m.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td style={{ ...td, fontWeight: 600, color: m.tipo === "entrada" ? "#97c459" : "#f09595" }}>
                      {m.tipo === "entrada" ? "+" : "-"}{m.quantidade} un.
                    </td>
                    <td style={{ ...td, color: C.muted }}>{m.obs || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
