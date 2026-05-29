import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { apiFetch } from "../../api";
import ModalConfirm from "../../components/ModalConfirm";
import BarcodeDisplay from "../../components/BarcodeDisplay";
import BarcodeScanner from "../../components/BarcodeScanner";

const C = {
  orange: "#f97316", red: "#e24b4a",
  surface: "#181818", surface2: "#202020", border: "rgba(255,255,255,0.07)", muted: "#888780", text: "#f1f0eb",
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(null);
  const [barcodeSkuExibir, setBarcodeSkuExibir] = useState(null);
  const [scannerAberto, setScannerAberto] = useState(false);
  const navigate = useNavigate();

  function load() {
    apiFetch("/produtos").then(setProdutos).catch(console.error);
  }

  useEffect(() => { load(); }, []);

  async function excluir(id, nome) {
    setModal({
      mensagem: `Deseja excluir "${nome}"?`,
      aviso: "Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        setModal(null);
        try {
          await apiFetch(`/produtos/${id}`, { method: "DELETE" });
          load();
        } catch (e) {
          alert(e.message);
        }
      },
    });
  }

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.sku.toLowerCase().includes(busca.toLowerCase())
  );

  function exportarPlanilha() {
    const dados = filtrados.map(p => ({
      "Nome": p.nome,
      "SKU": p.sku,
      "Categoria": p.categoria,
      "Quantidade": p.quantidade,
      "Estoque Mínimo": p.minimo,
      "Preço Unitário (R$)": Number(p.preco).toFixed(2),
      "Valor Total (R$)": (p.preco * p.quantidade).toFixed(2),
      "Fornecedor": p.fornecedor?.nome || "—",
      "Status": p.quantidade === 0 ? "Zerado" : p.quantidade <= p.minimo ? "Crítico" : p.quantidade <= p.minimo * 1.5 ? "Baixo" : "Ok",
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    ws["!cols"] = [
      { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 12 },
      { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    const data = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    XLSX.writeFile(wb, `estoquemax_produtos_${data}.xlsx`);
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Produtos</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportarPlanilha} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            ⬇️ Exportar planilha
          </button>
          <button onClick={() => navigate("/dashboard/produtos/importar")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            ⬆️ Importar planilha
          </button>
          <button onClick={() => navigate("/dashboard/produtos/novo")} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Novo produto
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Buscar por nome ou SKU..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ width: "100%", maxWidth: 360, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.text, outline: "none" }}
        />
        <button onClick={() => setScannerAberto(true)} title="Escanear código de barras" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "0 4px", display: "flex", alignItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.surface2, color: C.muted, fontSize: 11, textTransform: "uppercase" }}>
              {["Nome", "SKU", "Categoria", "Qtd", "Mínimo", "Preço", "Fornecedor", "Ações"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: C.muted }}>Nenhum produto encontrado.</td></tr>
            ) : filtrados.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.nome}</td>
                <td style={{ padding: "12px 16px", color: C.muted }}>{p.sku}</td>
                <td style={{ padding: "12px 16px" }}>{p.categoria}</td>
                <td style={{ padding: "12px 16px", color: p.quantidade <= p.minimo ? C.red : C.text, fontWeight: p.quantidade <= p.minimo ? 600 : 400 }}>
                  {p.quantidade}
                </td>
                <td style={{ padding: "12px 16px", color: C.muted }}>{p.minimo}</td>
                <td style={{ padding: "12px 16px" }}>R$ {p.preco.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: C.muted }}>{p.fornecedor?.nome || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setBarcodeSkuExibir(p.sku)} title="Ver código de barras" style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>▦ Barcode</button>
                    <button onClick={() => navigate(`/dashboard/produtos/${p.id}/historico`)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>📋 Histórico</button>
                    <button onClick={() => navigate(`/dashboard/produtos/${p.id}/editar`)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Editar</button>
                    <button onClick={() => excluir(p.id, p.nome)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.red, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <ModalConfirm mensagem={modal.mensagem} aviso={modal.aviso} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
      {barcodeSkuExibir && <BarcodeDisplay value={barcodeSkuExibir} onClose={() => setBarcodeSkuExibir(null)} />}
      {scannerAberto && (
        <BarcodeScanner
          onResult={(sku) => { setScannerAberto(false); setBusca(sku); }}
          onClose={() => setScannerAberto(false)}
        />
      )}
    </div>
  );
}
