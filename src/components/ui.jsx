// ─── ROBSTAR KASI — Shared UI Components ────────────────────────
import { useEffect } from "react";
import { T, STATUS_CONFIG } from "../utils/tokens";

// ── Google Fonts loader ──────────────────────────────────────────
export function FontLink() {
  return (
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');`}</style>
  );
}

// ── Status badge ─────────────────────────────────────────────────
export function Badge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700,
      background:s.bg, border:`1px solid ${s.border}`, color:s.text,
      fontFamily:T.font, letterSpacing:"0.04em", textTransform:"uppercase",
      whiteSpace:"nowrap",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.text, flexShrink:0 }}/>
      {s.label}
    </span>
  );
}

// ── Toast notification ───────────────────────────────────────────
export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position:"fixed", bottom:24, right:16, left:16, zIndex:1000,
      maxWidth:400, margin:"0 auto",
      background: type === "success" ? "#0A1F12" : "#1A0505",
      border:`1px solid ${type === "success" ? "#00C86E" : T.red}`,
      color: type === "success" ? "#00C86E" : "#FF6666",
      borderRadius:11, padding:"12px 18px", fontSize:13, fontWeight:700,
      boxShadow:"0 12px 36px rgba(0,0,0,0.5)", fontFamily:T.font,
      display:"flex", alignItems:"center", gap:10,
    }}>
      <span style={{ fontSize:16, flexShrink:0 }}>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

// ── Stat card (dashboard) ────────────────────────────────────────
export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
      padding:"18px 20px", position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background:`linear-gradient(to right, ${accent}, transparent)`,
      }}/>
      <div style={{ color:T.muted, fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      <div style={{ color:accent, fontSize:26, fontWeight:800, lineHeight:1, letterSpacing:"-0.5px" }}>{value}</div>
      <div style={{ color:T.faint, fontSize:11, marginTop:5, fontFamily:T.body }}>{sub}</div>
    </div>
  );
}

// ── Section page header ──────────────────────────────────────────
export function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom:28 }}>
      {eyebrow && (
        <div style={{ color:T.red, fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ color:T.white, fontSize:26, fontWeight:800, margin:"0 0 4px", letterSpacing:"-0.8px" }}>{title}</h1>
      {subtitle && <p style={{ color:T.muted, fontSize:13, margin:0, fontFamily:T.body }}>{subtitle}</p>}
    </div>
  );
}

// ── Small qty stepper ────────────────────────────────────────────
export function QtyStepper({ value, onDecrement, onIncrement, accentOnAdd }) {
  const btn = (label, onClick, accent) => (
    <button onClick={onClick} style={{
      width:30, height:30, borderRadius:7, cursor:"pointer",
      border:`1px solid ${accent ? T.red : T.border}`,
      background: accent ? T.redGlow : T.surface,
      color: accent ? T.red : T.white,
      fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
    }}>{label}</button>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      {btn("−", onDecrement, false)}
      <span style={{ color:T.red, fontWeight:800, fontSize:15, minWidth:22, textAlign:"center" }}>{value}</span>
      {btn("+", onIncrement, accentOnAdd)}
    </div>
  );
}