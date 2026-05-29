import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { apiFetch } from "../../api";
import { C } from "../../theme";

const COLUNAS = ["nome", "sku", "categoria", "quantidade", "minimo", "preco"];
const EXEMPLO = [
  { nome: "Cabo USB-C 2m", sku: "SKU-0001", categoria: "Eletrônicos", quantidade: 50, minimo: 10, preco: 29.90 },
  { nome: "Mouse Sem Fio", sku: "SKU-0002", categoria: "Eletrônicos", quantidade: 30, minimo: 5, preco: 89.90 },
  { nome: "Camiseta Básica P", sku: "SKU-0003", categoria: "Vestuário", quantidade: 100, minimo: 20, preco: 49.90 },
];

export default function ImportarProdutos() {
  const navigate = useNavigate();
  const inputRef = useRef();
  const [preview, setPreview] = useState([]);
  const [errosPreview, setErrosPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function processarDados(dados) {
    const validos = [];
    const erros = [];
    dados.forEach((row, i) => {
      const normalizado = {};
      Object.keys(row).forEach(k => { normalizado[k.toLowerCase().trim()] = row[k]; });
      if (!normalizado.nome && !normalizado.sku) return;
      const faltando = COLUNAS.filter(c => !normalizado[c] && c !== "quantidade" && c !== "minimo" && c !== "preco");
      if (faltando.length > 0) { erros.push(`Linha ${i + 2}: faltando ${faltando.join(", ")}`); return; }
      validos.push(normalizado);
    });
    setPreview(validos);
    setErrosPreview(erros);
  }

  function lerCSV(arquivo) {
    Papa.parse(arquivo, {
      header: true, skipEmptyLines: true,
      complete: (result) => processarDados(result.data),
      error: () => setErrosPreview(["Erro ao ler o arquivo CSV."]),
    });
  }

  function lerExcel(arquivo) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      processarDados(XLSX.utils.sheet_to_json(ws));
    };
    reader.readAsBinaryString(arquivo);
  }

  function handleArquivo(arquivo) {
    if (!arquivo) return;
    setNomeArquivo(arquivo.name);
    setPreview([]); setErrosPreview([]); setResultado(null);
    const ext = arquivo.name.split(".").pop().toLowerCase();
    if (ext === "csv") lerCSV(arquivo);
    else if (["xlsx", "xls"].includes(ext)) lerExcel(arquivo);
    else setErrosPreview(["Formato não suportado. Use .csv, .xlsx ou .xls"]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleArquivo(e.dataTransfer.files[0]);
  }

  async function importar() {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      const data = await apiFetch("/produtos/importar", { method: "POST", body: JSON.stringify({ produtos: preview }) });
      setResultado(data);
      setPreview([]); setNomeArquivo("");
    } catch (e) {
      setErrosPreview([e.message]);
    } finally {
      setLoading(false);
    }
  }

  function baixarModelo() {
    const ws = XLSX.utils.json_to_sheet(EXEMPLO);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    XLSX.writeFile(wb, "modelo_importacao_estoquemax.xlsx");
  }

  const th = { textAlign: "left", padding: "8px 16px", color: C.muted, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`, background: C.surface2, whiteSpace: "nowrap" };
  const td = { padding: "9px 16px", borderBottom: `1px solid ${C.border}` };

  return (
    <div style={{ padding: 28, fontFamily: "'DM Sans', sans-serif", color: C.text, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate("/dashboard/produtos")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>←</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Importar produtos</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Importe vários produtos de uma vez via planilha CSV ou Excel.</p>
        </div>
        <button onClick={baixarModelo} style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ⬇️ Baixar modelo
        </button>
      </div>

      {!resultado ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current.click()}
            style={{ background: dragOver ? C.orangeDim : C.surface, border: `2px dashed ${dragOver ? C.orange : C.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center", cursor: "pointer", marginBottom: 20, transition: "all 0.15s" }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{nomeArquivo || "Clique ou arraste o arquivo aqui"}</div>
            <div style={{ fontSize: 12, color: C.muted }}>Suporta .csv, .xlsx e .xls · Máximo 1.000 produtos por importação</div>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => handleArquivo(e.target.files[0])} />
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Colunas esperadas na planilha:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLUNAS.map(c => (
                <span key={c} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.orangeDim, color: C.orange, border: `1px solid ${C.orangeBorder}`, fontFamily: "monospace" }}>{c}</span>
              ))}
            </div>
          </div>

          {errosPreview.length > 0 && (
            <div style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#f09595", fontWeight: 500, marginBottom: 6 }}>⚠️ {errosPreview.length} problema(s) encontrado(s):</div>
              {errosPreview.map((e, i) => <div key={i} style={{ fontSize: 12, color: "#f09595", marginBottom: 3 }}>{e}</div>)}
            </div>
          )}

          {preview.length > 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Preview — {preview.length} produto(s) válido(s)</span>
                <span style={{ fontSize: 12, color: "#97c459" }}>✓ Pronto para importar</span>
              </div>
              <div style={{ overflowX: "auto", maxHeight: 320, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>{["Nome", "SKU", "Categoria", "Qtd", "Mín.", "Preço"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((p, i) => (
                      <tr key={i}>
                        <td style={{ ...td, fontWeight: 500 }}>{p.nome}</td>
                        <td style={{ ...td, color: C.muted, fontFamily: "monospace" }}>{p.sku}</td>
                        <td style={{ ...td, color: C.muted }}>{p.categoria}</td>
                        <td style={td}>{p.quantidade || 0}</td>
                        <td style={{ ...td, color: C.muted }}>{p.minimo || 0}</td>
                        <td style={td}>R$ {Number(String(p.preco || 0).replace(",", ".")).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 50 && <div style={{ padding: "10px 16px", fontSize: 12, color: C.muted, textAlign: "center" }}>Mostrando 50 de {preview.length} produtos</div>}
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={importar} disabled={loading} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {loading ? "Importando..." : `Importar ${preview.length} produto(s)`}
              </button>
              <button onClick={() => { setPreview([]); setNomeArquivo(""); setErrosPreview([]); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Importação concluída!</h2>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#97c459" }}>{resultado.importados}</div>
              <div style={{ fontSize: 12, color: C.muted }}>importados</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#fac775" }}>{resultado.ignorados}</div>
              <div style={{ fontSize: 12, color: C.muted }}>ignorados</div>
            </div>
          </div>
          {resultado.erros.length > 0 && (
            <div style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, textAlign: "left" }}>
              {resultado.erros.map((e, i) => <div key={i} style={{ fontSize: 12, color: "#f09595", marginBottom: 3 }}>{e}</div>)}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => navigate("/dashboard/produtos")} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ver produtos</button>
            <button onClick={() => setResultado(null)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Importar mais</button>
          </div>
        </div>
      )}
    </div>
  );
}
