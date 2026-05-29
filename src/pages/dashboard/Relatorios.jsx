import { useEffect, useState } from "react";
import { apiFetch } from "../../api";

const C = {
  orange: "#f97316", green: "#639922", red: "#e24b4a", blue: "#378add",
  surface: "#181818", surface2: "#202020", border: "rgba(255,255,255,0.07)", muted: "#888780", text: "#f1f0eb",
};

function KPI({ label, value, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function exportCSV(produtos) {
  const header = ["Nome", "SKU", "Categoria", "Quantidade", "Mínimo", "Preço Unit.", "Valor Total"];
  const rows = produtos.map(p => [p.nome, p.sku, p.categoria, p.quantidade, p.minimo, p.preco.toFixed(2), (p.preco * p.quantidade).toFixed(2)]);
  const csv = [header, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "produtos-estoquemax.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Relatorios() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/relatorios/resumo").then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32, color: C.muted }}>Carregando...</div>;
  if (!data) return <div style={{ padding: 32, color: C.red }}>Erro ao carregar dados.</div>;

  const criticos = data.produtos.filter(p => p.quantidade <= p.minimo);
  const totalItens = data.produtos.reduce((acc, p) => acc + p.quantidade, 0);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Relatórios</h1>
        <button onClick={() => exportCSV(data.produtos)} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          ⬇ Exportar CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <KPI label="Total de produtos" value={data.totalProdutos} color={C.orange} />
        <KPI label="Valor em estoque" value={`R$ ${data.valorEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} color={C.green} />
        <KPI label="Estoque crítico" value={data.criticos} color={C.red} />
        <KPI label="Fornecedores" value={data.totalFornecedores} color={C.blue} />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface2, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>
              {[["Nome", "left"], ["SKU", "left"], ["Categoria", "left"], ["Qtd", "right"], ["Mínimo", "right"], ["Preço Unit.", "right"], ["Valor Total", "right"]].map(([h, align]) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: align, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.produtos.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: C.muted }}>Nenhum produto cadastrado.</td></tr>
            ) : data.produtos.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.nome}</td>
                <td style={{ padding: "12px 16px", color: C.muted }}>{p.sku}</td>
                <td style={{ padding: "12px 16px" }}>{p.categoria}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", color: p.quantidade <= p.minimo ? C.red : C.text, fontWeight: p.quantidade <= p.minimo ? 600 : 400 }}>{p.quantidade}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", color: C.muted }}>{p.minimo}</td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>R$ {p.preco.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 500 }}>R$ {(p.preco * p.quantidade).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {data.produtos.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: C.surface2 }}>
                <td colSpan={3} style={{ padding: "12px 16px", fontWeight: 600, color: C.muted, fontSize: 12 }}>TOTAL</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{totalItens}</td>
                <td /><td />
                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: C.orange }}>
                  R$ {data.valorEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {criticos.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid rgba(226,75,74,0.3)`, borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: C.red }}>⚠ Produtos em estoque crítico</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: C.muted, fontSize: 11, textTransform: "uppercase" }}>
                {["Produto", "SKU", "Categoria", "Atual", "Mínimo", "Diferença"].map(h => (
                  <th key={h} style={{ textAlign: "left", paddingBottom: 10, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criticos.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 0", fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ padding: "10px 0", color: C.muted }}>{p.sku}</td>
                  <td style={{ padding: "10px 0" }}>{p.categoria}</td>
                  <td style={{ padding: "10px 0", color: C.red, fontWeight: 700 }}>{p.quantidade}</td>
                  <td style={{ padding: "10px 0", color: C.muted }}>{p.minimo}</td>
                  <td style={{ padding: "10px 0", color: C.red }}>{p.quantidade - p.minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
