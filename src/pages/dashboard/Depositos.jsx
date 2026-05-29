import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { C } from "../../theme";
import ModalConfirm from "../../components/ModalConfirm";

export default function Depositos() {
  const [depositos, setDepositos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("lista");
  const [depositoSelecionado, setDepositoSelecionado] = useState(null);
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  const [formDeposito, setFormDeposito] = useState({ nome: "", descricao: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicao, setFormEdicao] = useState({});
  const [formMov, setFormMov] = useState({ produtoId: "", quantidade: "", tipo: "entrada", obs: "" });
  const [formTransf, setFormTransf] = useState({ produtoId: "", origemId: "", destinoId: "", quantidade: "", obs: "" });

  function notif(text, tipo = "ok") {
    if (tipo === "ok") { setMsg(text); setTimeout(() => setMsg(""), 3000); }
    else { setErro(text); setTimeout(() => setErro(""), 3000); }
  }

  async function carregar() {
    setLoading(true);
    try {
      const [d, p, t] = await Promise.all([
        apiFetch("/depositos"),
        apiFetch("/produtos"),
        apiFetch("/transferencias"),
      ]);
      setDepositos(d);
      setProdutos(p);
      setTransferencias(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function criarDeposito() {
    if (!formDeposito.nome) return notif("Nome é obrigatório.", "err");
    try {
      await apiFetch("/depositos", { method: "POST", body: JSON.stringify(formDeposito) });
      notif("Depósito criado!");
      setFormDeposito({ nome: "", descricao: "" });
      carregar();
    } catch (e) { notif(e.message, "err"); }
  }

  async function salvarEdicao(id) {
    try {
      await apiFetch(`/depositos/${id}`, { method: "PUT", body: JSON.stringify(formEdicao) });
      notif("Atualizado!");
      setEditandoId(null);
      carregar();
    } catch (e) { notif(e.message, "err"); }
  }

  async function excluirDeposito(id, nome) {
    setModal({
      mensagem: `Deseja excluir o depósito "${nome}"?`,
      aviso: "O depósito não pode ter estoque para ser excluído.",
      onConfirm: async () => {
        setModal(null);
        try {
          await apiFetch(`/depositos/${id}`, { method: "DELETE" });
          notif("Depósito removido.");
          carregar();
        } catch (e) { notif(e.message, "err"); }
      },
    });
  }

  async function registrarMovimentacao() {
    if (!depositoSelecionado || !formMov.produtoId || !formMov.quantidade)
      return notif("Preencha todos os campos.", "err");
    try {
      await apiFetch(`/depositos/${depositoSelecionado.id}/estoque`, {
        method: "POST",
        body: JSON.stringify(formMov),
      });
      notif("Movimentação registrada!");
      setFormMov({ produtoId: "", quantidade: "", tipo: "entrada", obs: "" });
      carregar();
    } catch (e) { notif(e.message, "err"); }
  }

  async function realizarTransferencia() {
    if (!formTransf.produtoId || !formTransf.origemId || !formTransf.destinoId || !formTransf.quantidade)
      return notif("Preencha todos os campos.", "err");
    try {
      await apiFetch("/transferencias", { method: "POST", body: JSON.stringify(formTransf) });
      notif("Transferência realizada com sucesso!");
      setFormTransf({ produtoId: "", origemId: "", destinoId: "", quantidade: "", obs: "" });
      carregar();
    } catch (e) { notif(e.message, "err"); }
  }

  const inp = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none", width: "100%" };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Depósitos</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Gerencie múltiplos depósitos e filiais</p>
        </div>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(99,153,34,0.1)", border: "1px solid rgba(99,153,34,0.3)", borderRadius: 8, color: "#97c459", fontSize: 13, marginBottom: 16 }}>{msg}</div>}
      {erro && <div style={{ padding: "10px 16px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 8, color: "#f09595", fontSize: 13, marginBottom: 16 }}>{erro}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["lista", "Depósitos"], ["movimentacao", "Movimentar estoque"], ["transferencia", "Transferências"]].map(([aba, label]) => (
          <button key={aba} onClick={() => setAbaAtiva(aba)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${abaAtiva === aba ? C.orange : C.border}`, background: abaAtiva === aba ? C.orangeDim : "none", color: abaAtiva === aba ? C.orange : C.muted, fontSize: 13, fontWeight: abaAtiva === aba ? 600 : 400, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {abaAtiva === "lista" && (
        <>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Novo depósito</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Nome *</div>
                <input placeholder="Ex: Depósito Central, Filial SP" value={formDeposito.nome} onChange={e => setFormDeposito(f => ({ ...f, nome: e.target.value }))} style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Descrição</div>
                <input placeholder="Ex: Rua X, nº 123" value={formDeposito.descricao} onChange={e => setFormDeposito(f => ({ ...f, descricao: e.target.value }))} style={inp} />
              </div>
              <button onClick={criarDeposito} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>+ Criar</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Carregando...</div>
          ) : depositos.length === 0 ? (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum depósito cadastrado.</div>
          ) : depositos.map(d => {
            const editando = editandoId === d.id;
            const totalItens = d.estoques.reduce((acc, e) => acc + e.quantidade, 0);
            const totalProdutos = d.estoques.filter(e => e.quantidade > 0).length;
            return (
              <div key={d.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
                {editando ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, alignItems: "center" }}>
                    <input value={formEdicao.nome} onChange={e => setFormEdicao(f => ({ ...f, nome: e.target.value }))} style={inp} />
                    <input value={formEdicao.descricao || ""} onChange={e => setFormEdicao(f => ({ ...f, descricao: e.target.value }))} style={inp} />
                    <button onClick={() => salvarEdicao(d.id)} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setEditandoId(null)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: d.estoques.length > 0 ? 14 : 0 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{d.nome}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{d.descricao || "Sem descrição"} · {totalProdutos} produto(s) · {totalItens} unidades no total</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setDepositoSelecionado(d); setAbaAtiva("movimentacao"); }} style={{ background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, color: C.orange, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Movimentar</button>
                        <button onClick={() => { setEditandoId(d.id); setFormEdicao({ nome: d.nome, descricao: d.descricao || "" }); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Editar</button>
                        <button onClick={() => excluirDeposito(d.id, d.nome)} style={{ background: "none", border: "1px solid rgba(226,75,74,0.3)", color: "#f09595", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>Excluir</button>
                      </div>
                    </div>
                    {d.estoques.filter(e => e.quantidade > 0).length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {d.estoques.filter(e => e.quantidade > 0).map(e => (
                          <div key={e.id} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>
                            <span style={{ fontWeight: 500 }}>{e.produto.nome}</span>
                            <span style={{ color: C.muted }}> · {e.quantidade} un.</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </>
      )}

      {abaAtiva === "movimentacao" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 600 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Registrar movimentação em depósito</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Depósito</div>
            <select value={depositoSelecionado?.id || ""} onChange={e => setDepositoSelecionado(depositos.find(d => d.id === Number(e.target.value)) || null)} style={{ ...inp, cursor: "pointer" }}>
              <option value="">Selecione o depósito...</option>
              {depositos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Produto</div>
              <select value={formMov.produtoId} onChange={e => setFormMov(f => ({ ...f, produtoId: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Selecione...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.sku})</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Tipo</div>
              <select value={formMov.tipo} onChange={e => setFormMov(f => ({ ...f, tipo: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Quantidade</div>
              <input type="number" min="1" value={formMov.quantidade} onChange={e => setFormMov(f => ({ ...f, quantidade: e.target.value }))} placeholder="0" style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Observação</div>
              <input value={formMov.obs} onChange={e => setFormMov(f => ({ ...f, obs: e.target.value }))} placeholder="Opcional" style={inp} />
            </div>
          </div>
          <button onClick={registrarMovimentacao} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Registrar</button>
        </div>
      )}

      {abaAtiva === "transferencia" && (
        <>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 600, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Nova transferência</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Produto</div>
                <select value={formTransf.produtoId} onChange={e => setFormTransf(f => ({ ...f, produtoId: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Selecione...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Quantidade</div>
                <input type="number" min="1" value={formTransf.quantidade} onChange={e => setFormTransf(f => ({ ...f, quantidade: e.target.value }))} placeholder="0" style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Depósito de origem</div>
                <select value={formTransf.origemId} onChange={e => setFormTransf(f => ({ ...f, origemId: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Selecione...</option>
                  {depositos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Depósito de destino</div>
                <select value={formTransf.destinoId} onChange={e => setFormTransf(f => ({ ...f, destinoId: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Selecione...</option>
                  {depositos.filter(d => d.id !== Number(formTransf.origemId)).map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Observação</div>
                <input value={formTransf.obs} onChange={e => setFormTransf(f => ({ ...f, obs: e.target.value }))} placeholder="Opcional" style={inp} />
              </div>
            </div>
            <button onClick={realizarTransferencia} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Transferir</button>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 500 }}>Histórico de transferências</div>
            {transferencias.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma transferência realizada.</div>
            ) : transferencias.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.produto.nome}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{new Date(t.criadoEm).toLocaleDateString("pt-BR")}{t.obs ? ` · ${t.obs}` : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{t.origem.nome}</span>
                  <span style={{ color: C.orange }}>→</span>
                  <span style={{ color: C.muted }}>{t.destino.nome}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#85b7eb" }}>{t.quantidade} un.</span>
              </div>
            ))}
          </div>
        </>
      )}

      {modal && <ModalConfirm mensagem={modal.mensagem} aviso={modal.aviso} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
    </div>
  );
}
