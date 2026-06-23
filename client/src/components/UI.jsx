import { useEffect } from "react";
import { T, STATUS } from "../styles/tokens";

/* ── GOOGLE FONTS ── */
export function FontLink() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; background: ${T.base}; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: ${T.surface}; }
      ::-webkit-scrollbar-thumb { background: ${T.faint}; border-radius: 4px; }
    `}</style>
  );
}

/* ── STATUS BADGE ── */
export function Badge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      fontFamily: T.font, letterSpacing: "0.05em", textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.text, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ── TOAST ── */
export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 2000, background: isSuccess ? "#091A10" : "#1A0505",
      border: `1px solid ${isSuccess ? T.green : T.red}`,
      color: isSuccess ? T.green : "#FF6666",
      borderRadius: T.rl, padding: "12px 20px", fontSize: 13, fontWeight: 700,
      boxShadow: "0 16px 48px rgba(0,0,0,0.6)", fontFamily: T.font,
      display: "flex", alignItems: "center", gap: 10,
      maxWidth: "calc(100vw - 32px)", whiteSpace: "nowrap",
    }}>
      <span>{isSuccess ? "✓" : "✕"}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{message}</span>
    </div>
  );
}

/* ── SPINNER ── */
export function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: `2px solid ${T.faint}`,
      borderTopColor: T.red, borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── SECTION HEADER ── */
export function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {eyebrow && (
        <div style={{
          color: T.red, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6,
        }}>{eyebrow}</div>
      )}
      <h1 style={{
        color: T.white, fontSize: 22, fontWeight: 800,
        margin: "0 0 4px", letterSpacing: "-0.5px", fontFamily: T.font,
      }}>{title}</h1>
      {sub && <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>{sub}</p>}
    </div>
  );
}

/* ── STAT CARD ── */
export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: T.rl,
      padding: "16px 18px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(to right, ${accent}, transparent)`,
      }} />
      <div style={{ color: T.muted, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ color: accent, fontSize: 24, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ── CARD WRAPPER ── */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: T.rl, overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

/* ── GHOST BUTTON ── */
export function GhostBtn({ onClick, children, small }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: `1px solid ${T.border}`,
      color: T.muted, borderRadius: T.r, cursor: "pointer",
      padding: small ? "5px 12px" : "8px 16px",
      fontSize: small ? 11 : 12, fontWeight: 600, fontFamily: T.font,
    }}>
      {children}
    </button>
  );
}
