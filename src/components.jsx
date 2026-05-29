import { C } from "./theme";

export function Badge({ children }) {
  return (
    <span style={{ display: "inline-block", background: C.orangeDim, color: C.orange, border: `1px solid ${C.orangeBorder}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 500, marginBottom: 20 }}>
      {children}
    </span>
  );
}

export function BtnOrange({ children, onClick, full, size = "md" }) {
  const pad = size === "lg" ? "14px 28px" : "10px 20px";
  const fs = size === "lg" ? 15 : 14;
  return (
    <button onClick={onClick} style={{ background: C.orange, color: "white", border: "none", borderRadius: 10, padding: pad, fontSize: fs, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, width: full ? "100%" : "auto", justifyContent: "center", letterSpacing: -0.2 }}>
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick, full }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, width: full ? "100%" : "auto", justifyContent: "center" }}>
      {children}
    </button>
  );
}
