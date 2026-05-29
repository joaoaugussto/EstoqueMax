import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { C } from "../../theme";

export default function Financeiro() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/financeiro/resumo").then(setDados).finally(() => setLoading(false));
  }, []);

  function fmt(v) {
    return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  }

  const kpis = dados ? [
    { label: "VALOR EM ESTOQUE", value: fmt(dados.valorEstoque), sub: "Produtos × preço unitário", color: "#f97316", icon: "📦" },
    { label: "TOTAL DE ENTRADAS", value: fmt(dados.valorEntradas), sub: "Valor acumulado de entradas", color: "#639922", icon: "📈" },
    { label: "TOTAL DE SAÍDAS", value: fmt(dados.valorSaidas), sub: "Valor acumulado de saídas", color: "#e24b4a", icon: "📉" },
    { label: "MOVIMENTAÇÕES", value: dados.totalMovimentacoes, sub: "Total de registros", color: "#378add", icon: "🔄" },
  ] : [];

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Financeiro</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Acompanhe o valor do estoque e movimentações financeiras.</p>
      </div>

      {loading ? (
        <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Carregando...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 28 }}>
            {kpis.map(k => (
              <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, borderLeft: `4px solid ${k.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>{k.label}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: k.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{k.icon}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Últimas movimentações</span>
            </div>
            {dados.ultimasMovimentacoes.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma movimentação registrada.</div>
            ) : (
              dados.ultimasMovimentacoes.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.tipo === "entrada" ? "#97c459" : "#f09595", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.produto.nome}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{new Date(m.criadoEm).toLocaleDateString("pt-BR")}{m.obs ? ` · ${m.obs}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 12, color: m.tipo === "entrada" ? "#97c459" : "#f09595", minWidth: 60, textAlign: "right" }}>
                    {m.tipo === "entrada" ? "+" : "-"}{m.quantidade} un.
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 90, textAlign: "right" }}>
                    {`R$ ${(m.quantidade * m.produto.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
