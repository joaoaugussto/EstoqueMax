import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { C } from "../theme";

export default function BarcodeDisplay({ value, onClose }) {
  const svgRef = useRef();

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 16,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (e) {
        console.error("Erro ao gerar barcode:", e);
      }
    }
  }, [value]);

  function imprimir() {
    const svg = svgRef.current?.outerHTML;
    if (!svg) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Etiqueta - ${value}</title>
      <style>
        body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: white; }
        svg { max-width: 400px; }
      </style></head>
      <body>${svg}<script>window.onload=()=>{window.print();window.close();}<\/script></body></html>
    `);
    win.document.close();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 20 }}>Código de barras · {value}</h3>
        <div style={{ background: "white", borderRadius: 10, padding: 8, marginBottom: 20, display: "inline-block" }}>
          <svg ref={svgRef} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={imprimir} style={{ background: "#f97316", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}>
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir etiqueta
          </button>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888780", borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
