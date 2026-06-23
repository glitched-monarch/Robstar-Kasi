import { useState } from "react";
import { T } from "../styles/tokens";
import { api } from "../utils/api";

const DEMOS = [
  { phone: "0722100001", label: "Buyer — Westlands Garage", password: "buyer123" },
  { phone: "0700000000", label: "Admin — HQ",               password: "admin123" },
];

export default function Login({ onLogin }) {
  const [phone, setPhone]     = useState("");
  const [password, setPassword] = useState("");
  const [err,   setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!phone.trim()) return;
    setErr(""); setLoading(true);
    try {
      const user = await api.login(phone.trim(), password);
      onLogin(user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.base, fontFamily: T.font,
      display: "flex", flexDirection: "column",
      padding: "0 0 env(safe-area-inset-bottom, 0px)",
    }}>
      {/* Top brand strip */}
      <div style={{
        background: `linear-gradient(135deg, #0C0C18, #0A000E)`,
        borderBottom: `1px solid ${T.border}`,
        padding: "28px 24px 28px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        {/* Left accent */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(to bottom, transparent, ${T.red}, transparent)`,
        }} />

        <div style={{ position: "relative" }}>
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: `linear-gradient(135deg, ${T.red}, ${T.redDim})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: `0 0 20px ${T.redGlow}`, flexShrink: 0,
            }}>⚙</div>
            <div>
              <div style={{ color: T.white, fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px" }}>
                ROBSTAR <span style={{ color: T.red }}>KASI</span>
              </div>
              <div style={{ color: T.muted, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Parts Portal — Nairobi
              </div>
            </div>
          </div>

          <h1 style={{
            color: T.white, fontSize: 32, fontWeight: 800,
            margin: "0 0 8px", letterSpacing: "-1px", lineHeight: 1.1,
          }}>
            Parts.<br />Ordered.<br />
            <span style={{ color: T.red }}>Delivered.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 13, margin: "10px 0 0", lineHeight: 1.55, maxWidth: 280 }}>
            The closed ordering platform for verified garages and distributors on Kirinyaga Road.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${T.border}`,
        background: T.surface,
      }}>
        {[["240+", "Parts"], ["50+", "Garages"], ["24hr", "Dispatch"]].map(([n, l]) => (
          <div key={l} style={{
            flex: 1, padding: "14px 0", textAlign: "center",
            borderRight: `1px solid ${T.border}`,
          }}>
            <div style={{ color: T.white, fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px" }}>{n}</div>
            <div style={{ color: T.faint, fontSize: 10, fontWeight: 500, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "28px 24px", maxWidth: 420, width: "100%" }}>
        <h2 style={{ color: T.white, fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.4px" }}>
          Sign In
        </h2>
        <p style={{ color: T.muted, fontSize: 13, margin: "0 0 24px" }}>
          Enter your registered Safaricom number
        </p>

        <label style={{
          color: T.offWhite, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.09em", textTransform: "uppercase",
          display: "block", marginBottom: 7,
        }}>
          Phone Number
        </label>
        <input
          type="tel"
          placeholder="07XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          style={{
            width: "100%", padding: "14px 16px", borderRadius: T.rl,
            fontSize: 16, fontFamily: T.font, fontWeight: 600,
            background: T.card, border: `1px solid ${err ? T.red : T.border}`,
            color: T.white, outline: "none", marginBottom: err ? 8 : 16,
          }}
        />
        {err && (
          <p style={{ color: "#FF6666", fontSize: 12, margin: "0 0 14px" }}>{err}</p>
        )}
        <label style={{
           color: T.offWhite, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.09em", textTransform: "uppercase",
          display: "block", marginBottom: 7, marginTop: 16,
        }}>
  Password
</label>
<input
  type="password"
  placeholder="Enter your password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && go()}
  style={{
    width: "100%", padding: "14px 16px", borderRadius: T.rl,
    fontSize: 16, fontFamily: T.font, fontWeight: 600,
    background: T.card, border: `1px solid ${err ? T.red : T.border}`,
    color: T.white, outline: "none", marginBottom: err ? 8 : 16,
  }}
/>

        <button
          onClick={go}
          disabled={loading || !phone || !password}
          style={{
            width: "100%", padding: "15px", borderRadius: T.rl, border: "none",
            background: loading || !phone || !password
              ? T.faint
              : `linear-gradient(135deg, ${T.red}, ${T.redDim})`,
            color: loading || !phone || !password ? T.muted : T.white,
            fontSize: 15, fontWeight: 800, cursor: loading || !phone || !password ? "not-allowed" : "pointer",
            letterSpacing: "0.04em", fontFamily: T.font,
            boxShadow: loading || !phone || !password ? "none" : `0 4px 24px ${T.redGlow}`,
          }}
        >
          {loading ? "Verifying…" : "Continue →"}
        </button>

        {/* Demo accounts */}
        <div style={{
          marginTop: 24, padding: "14px 16px", borderRadius: T.rl,
          background: T.card, border: `1px solid ${T.border}`,
        }}>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Demo accounts
          </div>
          {DEMOS.map(({ phone: p, label }) => (
            <div
              key={p}
              onClick={() => { setPhone(p); setPassword(demo.password); }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", cursor: "pointer",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <code style={{ color: T.red, fontSize: 13, fontWeight: 700, fontFamily: T.mono }}>{p}</code>
              <span style={{ color: T.muted, fontSize: 12 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
