import { useState, useEffect } from "react";
import { T, fmt } from "../styles/tokens";
import { api } from "../utils/api";
import { StatCard, Badge, Card, GhostBtn, SectionHeader, Spinner } from "../components/UI";

export default function Dashboard({ user, onNav }) {
  const [orders,  setOrders]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersData, statsData] = await Promise.all([
          api.getOrders(user.role === "admin" ? null : user.id),
          user.role === "admin" ? api.getStats() : null,
        ]);
        setOrders(ordersData);
        if (statsData) setStats(statsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <Spinner />
    </div>
  );

  const statCards = user.role === "admin"
    ? [
        { label: "Revenue",      value: fmt(stats?.total_revenue || 0),  accent: T.red     },
        { label: "Orders",       value: stats?.total_orders || 0,         accent: T.blueMid },
        { label: "Pending",      value: stats?.pending_orders || 0,       accent: T.yellow  },
        { label: "Low Stock",    value: stats?.low_stock_count || 0,      accent: "#FF5555" },
      ]
    : [
        { label: "My Orders",  value: orders.length,                                                   accent: T.blueMid },
        { label: "Pending",    value: orders.filter(o => o.status === "pending").length,                accent: T.yellow  },
        { label: "Delivered",  value: orders.filter(o => o.status === "delivered").length,              accent: T.green   },
        { label: "Spent",      value: fmt(orders.reduce((s, o) => s + o.total_kes, 0)),                accent: T.red     },
      ];

  const recent = orders.slice(0, 5);

  return (
    <div style={{ padding: "20px 16px 100px", fontFamily: T.font }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: T.red, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
          {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <h1 style={{ color: T.white, fontSize: 22, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.5px" }}>
          Hey, {user.name.split(" ")[0]} 👋
        </h1>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>{user.business_name}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => onNav("catalogue")} style={{
          flex: 1, padding: "13px 10px", borderRadius: T.rl, border: "none",
          background: `linear-gradient(135deg, ${T.red}, ${T.redDim})`,
          color: T.white, fontSize: 13, fontWeight: 800, cursor: "pointer",
          fontFamily: T.font, boxShadow: `0 4px 20px ${T.redGlow}`,
        }}>
          Browse Parts →
        </button>
        <button onClick={() => onNav(user.role === "admin" ? "allorders" : "orders")} style={{
          flex: 1, padding: "13px 10px", borderRadius: T.rl,
          border: `1px solid ${T.border}`, background: "transparent",
          color: T.offWhite, fontSize: 13, fontWeight: 700, cursor: "pointer",
          fontFamily: T.font,
        }}>
          View Orders
        </button>
      </div>

      {/* Recent orders */}
      <Card>
        <div style={{
          padding: "14px 16px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: T.white, fontSize: 14, fontWeight: 700 }}>Recent Orders</span>
          <GhostBtn small onClick={() => onNav(user.role === "admin" ? "allorders" : "orders")}>
            View all →
          </GhostBtn>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center" }}>
            <p style={{ color: T.faint, fontSize: 13, margin: "0 0 12px" }}>No orders yet.</p>
            <button onClick={() => onNav("catalogue")} style={{
              background: "transparent", border: `1px solid ${T.border}`,
              color: T.red, borderRadius: T.r, padding: "8px 16px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font,
            }}>Browse parts →</button>
          </div>
        ) : (
          recent.map((o, i) => (
            <div key={o.id} style={{
              padding: "12px 16px",
              borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : "none",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.red, fontSize: 12, fontWeight: 700, fontFamily: T.mono }}>{o.order_number}</div>
                {user.role === "admin" && (
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.business_name}
                  </div>
                )}
                <div style={{ color: T.faint, fontSize: 11, marginTop: 1 }}>{o.created_at?.slice(0, 10)}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: T.white, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{fmt(o.total_kes)}</div>
                <Badge status={o.status} />
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
