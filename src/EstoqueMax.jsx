import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./theme";
import { Badge, BtnOrange } from "./components";
import logo from "./assets/logo.png";

const features = [
  { icon: "📦", title: "Controle em tempo real", desc: "Monitore entradas, saídas e saldo de cada produto com atualização instantânea. Sem planilhas, sem retrabalho." },
  { icon: "⚠️", title: "Alertas de estoque crítico", desc: "Receba alertas automáticos quando qualquer produto atingir o nível mínimo definido por você." },
  { icon: "🏢", title: "Multi-empresa e filiais", desc: "Gerencie múltiplas empresas ou depósitos em um só lugar, com painéis e estoques separados para cada unidade." },
  { icon: "📊", title: "Relatórios e exportação", desc: "Gráficos de movimentação, histórico por produto e exportação completa em planilha Excel com um clique." },
  { icon: "📋", title: "Pedidos de compra", desc: "Crie pedidos de reposição para fornecedores. Quando o pedido for recebido, o estoque é atualizado automaticamente." },
  { icon: "🔒", title: "Acesso seguro por empresa", desc: "Cada empresa tem seu próprio acesso isolado. Seus dados nunca se misturam com os de outros clientes." },
];

const steps = [
  { n: "01", title: "Cadastre sua empresa", desc: "Crie sua conta, adicione sua empresa e convide sua equipe em menos de 5 minutos." },
  { n: "02", title: "Importe seus produtos", desc: "Suba uma planilha ou cadastre manualmente. Organize por categorias, fornecedores e localização." },
  { n: "03", title: "Gerencie em tempo real", desc: "Registre entradas e saídas, acompanhe alertas e tome decisões com dados confiáveis." },
];

const faqs = [
  { q: "Preciso instalar algum software?", a: "Não. O EstoqueMax é 100% web e funciona em qualquer navegador, computador ou celular." },
  { q: "Posso importar minha planilha atual?", a: "Sim. Aceitamos arquivos .xlsx e .csv para importação em massa de produtos e histórico." },
  { q: "Há contrato de fidelidade?", a: "Não. Os planos são mensais e você pode cancelar a qualquer momento sem multa." },
];

export default function EstoqueMax() {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState(null);

  const sec = (extra = {}) => ({ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", ...extra });
  const hr = () => <div style={{ height: 1, background: C.border, maxWidth: 1100, margin: "0 auto" }} />;

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }`}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(15,15,15,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <img src={logo} alt="EstoqueMax" style={{ width: 80, height: 80, objectFit: "contain" }} />
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.4 }}>Estoque<span style={{ color: "#f97316" }}>Max</span></span>
          </div>
          <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
            {["Funcionalidades", "Como funciona", "FAQ"].map((l) => (
              <span key={l} style={{ fontSize: 15, color: "#d4d3ce", cursor: "pointer", fontWeight: 500, letterSpacing: -0.2 }}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <BtnOrange onClick={() => navigate("/login")}>Entrar</BtnOrange>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ ...sec(), paddingTop: 100, paddingBottom: 100, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Badge>🚀 Novo: relatórios automáticos por WhatsApp</Badge>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 20, maxWidth: 800, margin: "0 auto 20px" }}>
          Controle de estoque<br />
          <span style={{ color: C.orange }}>para qualquer empresa</span>
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Do pequeno comércio ao grande distribuidor. Gerencie produtos, entradas, saídas e alertas em um só lugar.
        </p>

        {/* fake dashboard preview */}
        <div style={{ marginTop: 60, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, maxWidth: 860, margin: "60px auto 0", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["#e24b4a", "#ef9f27", "#639922"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
            {[["1.284", "Produtos", "#f97316"], ["R$ 84k", "Em estoque", "#639922"], ["18", "Alertas", "#e24b4a"], ["7", "Pedidos", "#378add"]].map(([v, l, c]) => (
              <div key={l} style={{ background: C.surface2, borderRadius: 10, padding: 14, borderTop: `2px solid ${c}` }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.surface2, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Movimentações recentes</span>
              <span style={{ fontSize: 11, color: C.orange }}>ver todas</span>
            </div>
            {[["Cabo USB-C", "Entrada", "+50 un.", "#97c459"], ["Fone XR", "Saída", "-12 un.", "#f09595"], ["Teclado K7", "Alerta", "8 restantes", "#fac775"]].map(([p, t, q, c]) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 12 }}>{p}</span>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 24 }}>
                  <span style={{ fontSize: 11, color: C.muted, minWidth: 52, textAlign: "left" }}>{t}</span>
                  <span style={{ fontSize: 12, color: c, minWidth: 80, textAlign: "right" }}>{q}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hr()}

      {/* FEATURES */}
      <div style={sec()}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Badge>Funcionalidades</Badge>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8, marginBottom: 12 }}>Tudo que você precisa<br />para controlar seu estoque</h2>
          <p style={{ color: C.muted, fontSize: 16 }}>Sem complexidade, sem planilhas, sem dor de cabeça.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {hr()}

      {/* HOW IT WORKS */}
      <div style={sec()}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Badge>Como funciona</Badge>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8 }}>Pronto em 3 passos simples</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.orange, flexShrink: 0 }}>{s.n}</div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: C.border }} />}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {steps.map((s) => (
            <div key={s.n}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{s.title}</div>
              <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={sec({ maxWidth: 700 })}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Badge>FAQ</Badge>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8 }}>Perguntas frequentes</h2>
        </div>
        {faqs.map((f, i) => (
          <div key={f.q} style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 0", cursor: "pointer" }} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{f.q}</span>
              <span style={{ color: C.orange, fontSize: 18, marginLeft: 16 }}>{faqOpen === i ? "−" : "+"}</span>
            </div>
            {faqOpen === i && <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>{f.a}</p>}
          </div>
        ))}
      </div>

      {hr()}

      {/* CTA FINAL */}
      <div style={{ ...sec(), textAlign: "center" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "60px 40px", maxWidth: 700, margin: "0 auto" }}>
          <img src={logo} alt="EstoqueMax" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 16 }} />
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, marginBottom: 12 }}>Comece a controlar<br />seu estoque hoje</h2>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 32 }}>14 dias grátis. Sem cartão. Cancela quando quiser.</p>
          <BtnOrange size="lg" onClick={() => navigate("/login")}>Criar conta grátis →</BtnOrange>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <img src={logo} alt="EstoqueMax" style={{ width: 80, height: 80, objectFit: "contain" }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Estoque<span style={{ color: "#f97316" }}>Max</span></span>
          </div>
          <span style={{ fontSize: 12, color: C.faint }}>© 2025 EstoqueMax. Todos os direitos reservados.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Termos", "Privacidade", "Contato"].map((l) => (
              <span key={l} style={{ fontSize: 12, color: C.muted, cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
