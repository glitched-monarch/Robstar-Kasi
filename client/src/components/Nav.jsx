import { T } from "../styles/tokens";

const NAV_ITEMS = [
  { id: "dashboard", icon: "▣", label: "Home",    admin: false },
  { id: "catalogue", icon: "⬡", label: "Parts",   admin: false },
  { id: "cart",      icon: "◎", label: "Cart",    admin: false },
  { id: "orders",    icon: "≡", label: "Orders",  admin: false },
  { id: "allorders", icon: "◈", label: "All",     admin: true  },
  { id: "inventory", icon: "◫", label: "Stock",   admin: true  },
];

export function BottomNav({ user, active, onNav, cartCount }) {
  const items = NAV_ITEMS.filter((n) => !n.admin || user.role === "admin");

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: T.surface,
      borderTop: `1px solid ${T.border}`,
      display: "flex", justifyContent: "space-around", alignItems: "stretch",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {items.map((n) => {
        const isActive = active === n.id;
        return (
          <button
            key={n.id}
            onClick={() => onNav(n.id)}
            style={{
              flex: 1, border: "none", background: "transparent",
              padding: "10px 4px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", position: "relative",
              borderTop: isActive ? `2px solid ${T.red}` : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: 18, color: isActive ? T.red : T.faint, lineHeight: 1 }}>
              {n.icon}
            </span>
            <span style={{
              fontSize: 9, fontWeight: isActive ? 700 : 500,
              color: isActive ? T.white : T.faint,
              fontFamily: T.font, letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              {n.label}
            </span>
            {n.id === "cart" && cartCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: "calc(50% - 16px)",
                background: T.red, color: "#fff",
                fontSize: 9, fontWeight: 800, borderRadius: 999,
                padding: "1px 5px", minWidth: 16, textAlign: "center",
                lineHeight: "14px",
              }}>
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ── DESKTOP SIDEBAR (hidden on mobile) ── */
export function Sidebar({ user, active, onNav, cartCount, onLogout }) {
  const items = NAV_ITEMS.filter((n) => !n.admin || user.role === "admin");

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: T.surface,
      display: "flex", flexDirection: "column",
      borderRight: `1px solid ${T.border}`,
      position: "relative", fontFamily: T.font,
    }}>
      {/* Red accent stripe */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(to bottom, transparent, ${T.red} 30%, ${T.red} 70%, transparent)`,
      }} />

      {/* Brand */}
      <div style={{ padding: "24px 20px 20px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.red}, ${T.redDim})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: `0 0 16px ${T.redGlow}`,
          }}>⚙</div>
          <div>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 13, letterSpacing: "-0.3px" }}>
              ROBSTAR <span style={{ color: T.red }}>KASI</span>
            </div>
            <div style={{ color: T.faint, fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Parts Portal
            </div>
          </div>
        </div>
      </div>

      <nav style={{ padding: "10px 10px", flex: 1 }}>
        {user.role === "admin" && (
          <div style={{ padding: "6px 10px 4px", color: T.faint, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Buyer
          </div>
        )}
        {items.filter(n => !n.admin).map((n) => <NavItem key={n.id} n={n} active={active} onNav={onNav} cartCount={cartCount} />)}

        {user.role === "admin" && (
          <>
            <div style={{ padding: "12px 10px 4px", color: T.faint, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Admin
            </div>
            {items.filter(n => n.admin).map((n) => <NavItem key={n.id} n={n} active={active} onNav={onNav} />)}
          </>
        )}
      </nav>

      {/* User strip */}
      <div style={{ padding: "14px 16px 20px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.blueDim,
            border: `1px solid ${T.blueMid}`, display: "flex", alignItems: "center",
            justifyContent: "center", color: T.blueMid, fontWeight: 800, fontSize: 13, flexShrink: 0,
          }}>
            {user.name[0]}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: T.white, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ color: T.faint, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.business_name}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: "100%", background: "transparent", border: `1px solid ${T.border}`,
          color: T.muted, borderRadius: T.r, padding: "6px", fontSize: 11,
          cursor: "pointer", fontFamily: T.font, fontWeight: 600,
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function NavItem({ n, active, onNav, cartCount }) {
  const isActive = active === n.id;
  return (
    <button onClick={() => onNav(n.id)} style={{
      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 9,
      padding: "9px 12px", borderRadius: T.r, border: "none", cursor: "pointer",
      marginBottom: 2,
      background: isActive ? T.redMid : "transparent",
      color: isActive ? T.white : T.muted,
      fontSize: 12, fontWeight: isActive ? 700 : 400,
      borderLeft: isActive ? `2px solid ${T.red}` : "2px solid transparent",
      fontFamily: T.font, position: "relative",
    }}>
      <span style={{ fontSize: 13, opacity: isActive ? 1 : 0.5 }}>{n.icon}</span>
      {n.label}
      {n.id === "cart" && cartCount > 0 && (
        <span style={{
          marginLeft: "auto", background: T.red, color: "#fff",
          fontSize: 9, fontWeight: 800, borderRadius: 999, padding: "1px 6px",
        }}>
          {cartCount}
        </span>
      )}
    </button>
  );
}
