import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { C } from "../../theme";
import ModalConfirm from "../../components/ModalConfirm";

const STATUS = {
  pendente:  { label: "Pendente",  bg: "rgba(186,117,23,0.15)",  color: "#fac775" },
  enviado:   { label: "Enviado",   bg: "rgba(55,138,221,0.15)",  color: "#85b7eb" },
  recebido:  { label: "Recebido",  bg: "rgba(99,153,34,0.15)",   color: "#97c459" },
  cancelado: { label: "Cancelado", bg: "rgba(226,75,74,0.15)",   color: "#f09595" },
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [criticos, setCriticos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("lista");
  const [form, setForm] = useState({ fornecedorId: "", obs: "", itens: [] });
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState(null);

  function notif(text, tipo = "ok") {
    if (tipo === "ok") { setMsg(text); setTimeout(() => setMsg(""), 3000); }
    else { setErro(text); setTimeout(() => setErro(""), 3000); }
  }

  async function carregar() {
    setLoading(true);
    try {
      const [p, c, f] = await Promise.all([
        apiFetch("/pedidos"),
        apiFetch("/pedidos/criticos"),
        apiFetch("/fornecedores"),
      ]);
      setPedidos(p);
      setCriticos(c);
      setFornecedores(f);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function adicionarCritico(produto) {
    if (form.itens.find(i => i.produtoId === produto.id)) return;
    const sugestao = Math.max(produto.minimo * 2 - produto.quantidade, 1);
    setForm(f => ({
      ...f,
      fornecedorId: produto.fornecedor?.id ? String(produto.fornecedor.id) : f.fornecedorId,
      itens: [...f.itens, { produtoId: produto.id, nome: produto.nome, sku: produto.sku, quantidade: sugestao }],
    }));
    setAbaAtiva("novo");
  }

  function removerItem(produtoId) {
    setForm(f => ({ ...f, itens: f.itens.filter(i => i.produtoId !== produtoId) }));
  }

  function atualizarQtd(produtoId, qtd) {
    setForm(f => ({ ...f, itens: f.itens.map(i => i.produtoId === produtoId ? { ...i, quantidade: qtd } : i) }));
  }

  async function criarPedido() {
    if (form.itens.length === 0) return notif("Adicione ao menos um produto.", "err");
    try {
      await apiFetch("/pedidos", { method: "POST", body: JSON.stringify(form) });
      notif("Pedido criado com sucesso!");
      setForm({ fornecedorId: "", obs: "", itens: [] });
      setAbaAtiva("lista");
      carregar();
    } catch (e) {
      notif(e.message, "err");
    }
  }

  async function atualizarStatus(id, status) {
    const mensagens = {
      enviado:   "Confirma que este pedido foi enviado ao fornecedor?",
      recebido:  "Confirma o recebimento dos itens?",
      cancelado: "Tem certeza que deseja cancelar este pedido?",
      pendente:  "Deseja voltar este pedido para Pendente?",
    };
    const avisos = {
      recebido:  "O estoque será atualizado automaticamente para todos os itens do pedido.",
      cancelado: "Esta ação não pode ser desfeita. O estoque não será alterado.",
    };

    setModal({
      mensagem: mensagens[status],
      aviso: avisos[status] || null,
      onConfirm: async () => {
        setModal(null);
        try {
          await apiFetch(`/pedidos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
          notif(status === "recebido" ? "Recebido! Estoque atualizado automaticamente." : "Status atualizado.");
          carregar();
        } catch (e) {
          notif(e.message, "err");
        }
      },
    });
  }

  async function excluir(id) {
    setModal({
      mensagem: "Deseja excluir este pedido permanentemente?",
      aviso: "Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        setModal(null);
        try {
          await apiFetch(`/pedidos/${id}`, { method: "DELETE" });
          notif("Pedido removido.");
          carregar();
        } catch (e) {
          notif(e.message, "err");
        }
      },
    });
  }

  const inp = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none" };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Pedidos de Compra</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Gerencie reposições de estoque</p>
        </div>
        <button onClick={() => setAbaAtiva("novo")} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Novo pedido
        </button>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(99,153,34,0.1)", border: "1px solid rgba(99,153,34,0.3)", borderRadius: 8, color: "#97c459", fontSize: 13, marginBottom: 16 }}>{msg}</div>}
      {erro && <div style={{ padding: "10px 16px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 8, color: "#f09595", fontSize: 13, marginBottom: 16 }}>{erro}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["lista", `Pedidos (${pedidos.length})`], ["criticos", `Estoque crítico (${criticos.length})`], ["novo", "Novo pedido"]].map(([aba, label]) => (
          <button key={aba} onClick={() => setAbaAtiva(aba)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${abaAtiva === aba ? C.orange : C.border}`, background: abaAtiva === aba ? C.orangeDim : "none", color: abaAtiva === aba ? C.orange : C.muted, fontSize: 13, fontWeight: abaAtiva === aba ? 600 : 400, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {abaAtiva === "lista" && (
        loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Carregando...</div>
        ) : pedidos.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum pedido criado ainda.</div>
        ) : pedidos.map(p => {
          const s = STATUS[p.status] || STATUS.pendente;
          return (
            <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Pedido #{p.id}</span>
                    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {p.fornecedor?.nome || "Sem fornecedor"} · {new Date(p.criadoEm).toLocaleDateString("pt-BR")} · {p.itens.length} item(ns)
                  </div>
                  {p.obs && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Obs: {p.obs}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {p.status === "pendente" && <button onClick={() => atualizarStatus(p.id, "enviado")} style={{ background: "none", border: `1px solid ${C.border}`, color: "#85b7eb", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Marcar enviado</button>}
                  {p.status === "enviado" && <button onClick={() => atualizarStatus(p.id, "recebido")} style={{ background: "none", border: "1px solid rgba(99,153,34,0.3)", color: "#97c459", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Marcar recebido</button>}
                  {p.status === "enviado" && <button onClick={() => atualizarStatus(p.id, "pendente")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>← Voltar para pendente</button>}
                  {p.status === "recebido" && <button onClick={() => atualizarStatus(p.id, "enviado")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>← Voltar para enviado</button>}
                  {p.status === "cancelado" && <button onClick={() => atualizarStatus(p.id, "pendente")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>↺ Reabrir pedido</button>}
                  {["pendente", "enviado"].includes(p.status) && <button onClick={() => atualizarStatus(p.id, "cancelado")} style={{ background: "none", border: "1px solid rgba(226,75,74,0.3)", color: "#f09595", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Cancelar</button>}
                  {["recebido", "cancelado"].includes(p.status) && <button onClick={() => excluir(p.id)} style={{ background: "none", border: "1px solid rgba(226,75,74,0.3)", color: "#f09595", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>🗑️</button>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.itens.map(item => (
                  <div key={item.id} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{item.produto.nome}</span>
                    <span style={{ color: C.muted }}> · {item.quantidade} un.</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {abaAtiva === "criticos" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {criticos.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#97c459", fontSize: 13 }}>Nenhum produto em estoque crítico.</div>
          ) : criticos.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.sku} · Estoque: {p.quantidade} · Mínimo: {p.minimo}</div>
              </div>
              <span style={{ fontSize: 11, color: "#fac775" }}>{p.fornecedor?.nome || "Sem fornecedor"}</span>
              <button onClick={() => adicionarCritico(p)} style={{ background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, color: C.orange, borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                + Adicionar ao pedido
              </button>
            </div>
          ))}
        </div>
      )}

      {abaAtiva === "novo" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Fornecedor</label>
              <select value={form.fornecedorId} onChange={e => setForm(f => ({ ...f, fornecedorId: e.target.value }))} style={{ ...inp, width: "100%", cursor: "pointer" }}>
                <option value="">Sem fornecedor</option>
                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Observação</label>
              <input value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))} placeholder="Ex: Urgente, prazo de entrega..." style={{ ...inp, width: "100%" }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Itens do pedido ({form.itens.length})</span>
              <span style={{ fontSize: 12, color: C.muted }}>Use "Estoque crítico" para adicionar produtos automaticamente</span>
            </div>
            {form.itens.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13, background: C.surface2, borderRadius: 8, border: `1px dashed ${C.border}` }}>
                Nenhum item adicionado. Use a aba "Estoque crítico" para sugestões automáticas.
              </div>
            ) : form.itens.map(item => (
              <div key={item.produtoId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.nome}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{item.sku}</div>
                </div>
                <input type="number" min="1" value={item.quantidade} onChange={e => atualizarQtd(item.produtoId, Number(e.target.value))} style={{ ...inp, width: 80, textAlign: "center" }} />
                <span style={{ fontSize: 12, color: C.muted }}>un.</span>
                <button onClick={() => removerItem(item.produtoId)} style={{ background: "none", border: "none", color: "#f09595", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={criarPedido} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Criar pedido
            </button>
            <button onClick={() => { setForm({ fornecedorId: "", obs: "", itens: [] }); setAbaAtiva("lista"); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modal && (
        <ModalConfirm
          mensagem={modal.mensagem}
          aviso={modal.aviso}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
