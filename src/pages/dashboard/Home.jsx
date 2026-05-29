import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { C } from "../../theme";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const CORES_PIE = ["#f97316", "#639922", "#378add", "#e24b4a", "#a855f7", "#ec4899"];

function KPICard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, borderTop: `3px solid ${color}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#f1f0eb" },
  itemStyle: { color: "#888780" },
};

export default function Home() {
  const [resumo, setResumo] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/relatorios/resumo"),
      apiFetch("/relatorios/graficos"),
    ]).then(([r, g]) => {
      setResumo(r);
      setGraficos(g);
    }).finally(() => setLoading(false));
  }, []);

  function fmt(v) {
    return `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  }

  if (loading) return <div style={{ padding: 40, color: C.muted, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Carregando...</div>;

  const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 };
  const cardHeader = { padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 500 };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Visão geral do seu estoque</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KPICard label="Total de produtos" value={resumo.totalProdutos} sub="cadastrados" color="#f97316" icon="📦" />
        <KPICard label="Valor em estoque" value={fmt(resumo.valorEstoque)} sub="produtos × preço" color="#639922" icon="💰" />
        <KPICard label="Estoque crítico" value={resumo.criticos} sub="requer atenção" color="#e24b4a" icon="⚠️" />
        <KPICard label="Fornecedores" value={resumo.totalFornecedores} sub="cadastrados" color="#378add" icon="🚚" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={cardHeader}>Movimentações — últimos 30 dias</div>
          <div style={{ padding: "20px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={graficos.movPorDia} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="gradEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#639922" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#639922" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSaida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e24b4a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e24b4a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dia" tick={{ fill: "#888780", fontSize: 10 }} tickLine={false} interval={4} />
                <YAxis tick={{ fill: "#888780", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#639922" fill="url(#gradEntrada)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#e24b4a" fill="url(#gradSaida)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "#97c459", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 2, background: "#639922", display: "inline-block", borderRadius: 2 }} />Entradas
              </span>
              <span style={{ fontSize: 11, color: "#f09595", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 2, background: "#e24b4a", display: "inline-block", borderRadius: 2 }} />Saídas
              </span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Top 5 produtos mais movimentados</div>
          <div style={{ padding: "20px 8px 8px" }}>
            {graficos.topProdutos.length === 0 ? (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>Nenhuma movimentação registrada.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={graficos.topProdutos} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#888780", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fill: "#888780", fontSize: 10 }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="total" name="Unidades" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={cardHeader}>Estoque por categoria</div>
          <div style={{ padding: "16px 8px" }}>
            {graficos.porCategoria.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>Nenhum produto cadastrado.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={graficos.porCategoria} dataKey="qty" nameKey="cat" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                    {graficos.porCategoria.map((_, i) => (
                      <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v, n) => [v + " un.", n]} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Últimas movimentações</div>
          <div>
            {resumo.movimentacoes.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma movimentação registrada.</div>
            ) : (
              resumo.movimentacoes.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: m.tipo === "entrada" ? "#97c459" : "#f09595", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.produto.nome}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{new Date(m.criadoEm).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <span style={{ fontSize: 12, color: m.tipo === "entrada" ? "#97c459" : "#f09595", fontWeight: 600 }}>
                    {m.tipo === "entrada" ? "+" : "-"}{m.quantidade} un.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
