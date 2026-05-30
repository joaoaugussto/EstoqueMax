import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { C } from "../theme";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  async function carregar() {
    try {
      await apiFetch("/notificacoes/verificar-estoque", { method: "POST" });
      const data = await apiFetch("/notificacoes");
      setNotificacoes(data);
    } catch {}
  }

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function marcarLida(id) {
    await apiFetch(`/notificacoes/${id}/lida`, { method: "PATCH" });
    setNotificacoes(n => n.map(x => x.id === id ? { ...x, lida: true } : x));
  }

  async function marcarTodasLidas() {
    await apiFetch("/notificacoes/lidas/todas", { method: "PATCH" });
    setNotificacoes(n => n.map(x => ({ ...x, lida: true })));
  }

  async function deletar(id) {
    await apiFetch(`/notificacoes/${id}`, { method: "DELETE" });
    setNotificacoes(n => n.filter(x => x.id !== id));
  }

  const corTipo = {
    alerta: { bg: "rgba(226,75,74,0.12)", border: "rgba(226,75,74,0.25)", icon: "⚠️", color: "#f09595" },
    info:   { bg: "rgba(55,138,221,0.12)", border: "rgba(55,138,221,0.25)", icon: "ℹ️", color: "#85b7eb" },
    sucesso:{ bg: "rgba(99,153,34,0.12)",  border: "rgba(99,153,34,0.25)",  icon: "✓",  color: "#97c459" },
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setAberto(!aberto)}
        style={{ position: "relative", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {naoLidas > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, background: "#e24b4a", color: "white", fontSize: 10, fontWeight: 700, width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 360, background: "#1c1c1c", border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 200, overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              Notificações{naoLidas > 0 && (
                <span style={{ fontSize: 11, background: "rgba(226,75,74,0.15)", color: "#f09595", padding: "2px 7px", borderRadius: 20, marginLeft: 6 }}>{naoLidas} novas</span>
              )}
            </span>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} style={{ background: "none", border: "none", color: C.orange, fontSize: 12, cursor: "pointer" }}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notificacoes.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>
                Nenhuma notificação.
              </div>
            ) : notificacoes.map(n => {
              const t = corTipo[n.tipo] || corTipo.info;
              return (
                <div key={n.id} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: n.lida ? "transparent" : "rgba(249,115,22,0.04)", opacity: n.lida ? 0.6 : 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: t.color }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{n.titulo}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{n.mensagem}</div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>
                      {new Date(n.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                    {!n.lida && (
                      <button onClick={() => marcarLida(n.id)} title="Marcar como lida" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>
                        ✓
                      </button>
                    )}
                    <button onClick={() => deletar(n.id)} title="Remover" style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
            <button onClick={() => { setAberto(false); navigate("/dashboard/produtos"); }} style={{ background: "none", border: "none", color: C.orange, fontSize: 12, cursor: "pointer" }}>
              Ver produtos críticos →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
