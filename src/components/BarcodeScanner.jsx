import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { C } from "../theme";

export default function BarcodeScanner({ onResult, onClose }) {
  const videoRef = useRef();
  const [erro, setErro] = useState("");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (result) {
        onResult(result.getText());
      }
    }).catch(() => {
      setErro("Não foi possível acessar a câmera. Verifique as permissões.");
    });

    return () => {
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch {}
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, maxWidth: 440, width: "90%", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Escanear código de barras
        </h3>
        {erro ? (
          <div style={{ padding: 20, color: "#f09595", fontSize: 13, marginBottom: 16 }}>{erro}</div>
        ) : (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <video ref={videoRef} style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 280 }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: 220, height: 100, border: "2px solid #f97316", borderRadius: 8, boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)" }} />
            </div>
          </div>
        )}
        {!erro && <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Aponte a câmera para o código de barras do produto</p>}
        <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888780", borderRadius: 10, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
