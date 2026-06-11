// ─── ROBSTAR KASI — Navigation ──────────────────────────────────
import { T, NAV_ITEMS } from "../utils/tokens";

// ── Desktop sidebar ──────────────────────────────────────────────
export function Sidebar({ user, active, onNav, cartCount, onLogout }) {
  const navItems = NAV_ITEMS.filter(n => !n.admin || user.role === "admin");

  return (
    <div style={{
      width:226, minHeight:"100vh", background:T.surface,
      display:"flex", flexDirection:"column", position:"relative",
      fontFamily:T.font, borderRight:`1px solid ${T.border}`, flexShrink:0,
    }}>
      {/* Red speed stripe */}
      <div style={{
        position:"absolute", left:0, top:0, bottom:0, width:3,
        background:`linear-gradient(to bottom, transparent 0%, ${T.red} 30%, ${T.red} 70%, transparent 100%)`,
        pointerEvents:"none",
      }}/>

      {/* Brand */}
      <div style={{ padding:"26px 22px 22px 28px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:9, flexShrink:0,
            background:`linear-gradient(135deg, ${T.red}, ${T.redDim})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:19, boxShadow:`0 0 16px ${T.redGlow}`,
          }}>⚙</div>
          <div>
            <div style={{ color:T.white, fontWeight:800, fontSize:14, letterSpacing:"-0.3px" }}>
              ROBSTAR <span style={{ color:T.red }}>KASI</span>
            </div>
            <div style={{ color:T.faint, fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              B2B Portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding:"14px 10px 0", flexShrink:0 }}>
        <div style={{ color:T.faint, fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", padding:"0 14px 8px" }}>Menu</div>
      </div>
      <nav style={{ padding:"0 10px", flex:1 }}>
        {navItems.map(n => {
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} style={{
              width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:2,
              background: isActive ? T.redGlow : "transparent",
              color: isActive ? T.white : T.muted,
              fontSize:13, fontWeight: isActive ? 700 : 400,
              borderLeft:`2px solid ${isActive ? T.red : "transparent"}`,
              transition:"all .12s", fontFamily:T.font, position:"relative",
            }}>
              <span style={{ fontSize:14, opacity: isActive ? 1 : 0.5, flexShrink:0 }}>{n.icon}</span>
              {n.label}
              {n.id === "cart" && cartCount > 0 && (
                <span style={{
                  marginLeft:"auto", background:T.red, color:"#fff",
                  fontSize:10, fontWeight:800, borderRadius:999, padding:"1px 7px",
                  boxShadow:`0 0 8px ${T.redGlow}`,
                }}>{cartCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User strip */}
      <div style={{ padding:"14px 20px 20px 26px", borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{
            width:34, height:34, borderRadius:8, background:T.blueDim,
            border:`1px solid ${T.blueMid}`, display:"flex", alignItems:"center", justifyContent:"center",
            color:T.blueMid, fontWeight:800, fontSize:14, flexShrink:0,
          }}>{user.name[0]}</div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ color:T.white, fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
            <div style={{ color:T.faint, fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.business_name}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          background:"transparent", border:`1px solid ${T.border}`, color:T.muted,
          borderRadius:7, padding:"6px 14px", fontSize:11, cursor:"pointer",
          fontFamily:T.font, fontWeight:600, width:"100%", letterSpacing:"0.05em",
        }}>Sign out</button>
      </div>
    </div>
  );
}

// ── Mobile top header bar ────────────────────────────────────────
export function MobileHeader({ user, page, cartCount, onMenuOpen }) {
  const current = NAV_ITEMS.find(n => n.id === page);
  return (
    <div style={{
      position:"sticky", top:0, zIndex:100,
      background:T.surface, borderBottom:`1px solid ${T.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 18px", fontFamily:T.font,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:32, height:32, borderRadius:7,
          background:`linear-gradient(135deg, ${T.red}, ${T.redDim})`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
        }}>⚙</div>
        <div>
          <div style={{ color:T.white, fontWeight:800, fontSize:13, letterSpacing:"-0.2px" }}>
            ROBSTAR <span style={{ color:T.red }}>KASI</span>
          </div>
          <div style={{ color:T.faint, fontSize:10 }}>{current?.label || "Dashboard"}</div>
        </div>
      </div>
      <button onClick={onMenuOpen} style={{
        background:"transparent", border:`1px solid ${T.border}`,
        color:T.muted, borderRadius:8, padding:"7px 12px",
        fontSize:13, cursor:"pointer", fontFamily:T.font, fontWeight:700,
        display:"flex", alignItems:"center", gap:6, position:"relative",
      }}>
        ☰
        {cartCount > 0 && (
          <span style={{
            position:"absolute", top:-5, right:-5,
            background:T.red, color:"#fff", fontSize:9,
            fontWeight:800, borderRadius:999, padding:"1px 5px",
          }}>{cartCount}</span>
        )}
      </button>
    </div>
  );
}

// ── Mobile slide-out drawer ──────────────────────────────────────
export function MobileDrawer({ user, active, onNav, cartCount, onLogout, onClose }) {
  const navItems = NAV_ITEMS.filter(n => !n.admin || user.role === "admin");
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
      }}/>
      {/* Drawer */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0, width:280,
        background:T.surface, zIndex:201, display:"flex", flexDirection:"column",
        borderLeft:`1px solid ${T.border}`, fontFamily:T.font,
      }}>
        {/* Header */}
        <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:T.white, fontWeight:800, fontSize:15 }}>
            ROBSTAR <span style={{ color:T.red }}>KASI</span>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:T.muted, fontSize:20, cursor:"pointer", lineHeight:1 }}>✕</button>
        </div>

        {/* Nav */}
        <nav style={{ padding:"12px 10px", flex:1, overflowY:"auto" }}>
          {navItems.map(n => {
            const isActive = active === n.id;
            return (
              <button key={n.id} onClick={() => { onNav(n.id); onClose(); }} style={{
                width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:12,
                padding:"12px 14px", borderRadius:9, border:"none", cursor:"pointer", marginBottom:3,
                background: isActive ? T.redGlow : "transparent",
                color: isActive ? T.white : T.muted,
                fontSize:14, fontWeight: isActive ? 700 : 400, fontFamily:T.font,
                borderLeft:`2px solid ${isActive ? T.red : "transparent"}`,
              }}>
                <span style={{ fontSize:16, opacity: isActive ? 1 : 0.5 }}>{n.icon}</span>
                {n.label}
                {n.id === "cart" && cartCount > 0 && (
                  <span style={{
                    marginLeft:"auto", background:T.red, color:"#fff",
                    fontSize:11, fontWeight:800, borderRadius:999, padding:"2px 8px",
                  }}>{cartCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:"14px 18px 24px", borderTop:`1px solid ${T.border}` }}>
          <div style={{ color:T.white, fontSize:13, fontWeight:700, marginBottom:2 }}>{user.name}</div>
          <div style={{ color:T.faint, fontSize:11, marginBottom:12 }}>{user.business_name}</div>
          <button onClick={() => { onLogout(); onClose(); }} style={{
            background:"transparent", border:`1px solid ${T.border}`, color:T.muted,
            borderRadius:7, padding:"8px 16px", fontSize:12, cursor:"pointer",
            fontFamily:T.font, fontWeight:600, width:"100%",
          }}>Sign out</button>
        </div>
      </div>
    </>
  );
}