import { C } from "../theme";

export default function ModalConfirm({ mensagem, aviso, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 16 }}>
          {aviso ? "⚠️" : "❓"}
        </div>
        <p style={{ fontSize: 15, color: "#f1f0eb", textAlign: "center", marginBottom: aviso ? 12 : 28, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
          {mensagem}
        </p>
        {aviso && (
          <div style={{ background: "rgba(186,117,23,0.12)", border: "1px solid rgba(186,117,23,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 24, fontSize: 13, color: "#fac775", textAlign: "center", lineHeight: 1.5 }}>
            {aviso}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onCancel} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888780", borderRadius: 10, padding: "10px 0", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ flex: 1, background: aviso ? "#e24b4a" : "#f97316", color: "white", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
