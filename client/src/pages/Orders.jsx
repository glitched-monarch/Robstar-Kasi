import { useState, useEffect } from "react";
import { T, fmt } from "../styles/tokens";
import { api } from "../utils/api";
import { Badge, Card, SectionHeader, Spinner, GhostBtn } from "../components/UI";

export default function Orders({ user, showToast }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail,  setDetail]  = useState(null); // full order object

  const isAdmin = user.role === "admin";

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders(isAdmin ? null : user.id);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const openDetail = async (id) => {
    try {
      const data = await api.getOrder(id);
      setDetail(data);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.updateStatus(id, status);
      showToast(`Order marked ${status}`);
      setDetail(null);
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  if (detail) return (
    <OrderDetail
      order={detail}
      isAdmin={isAdmin}
      onBack={() => setDetail(null)}
      onStatus={changeStatus}
    />
  );

  return (
    <div style={{ padding: "20px 16px 100px", fontFamily: T.font }}>
      <SectionHeader
        eyebrow={isAdmin ? "All Customers" : "Order History"}
        title={isAdmin ? "All Orders" : "My Orders"}
        sub={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
      />

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spinner />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: T.faint, fontSize: 14 }}>No orders yet.</div>
      )}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => openDetail(o.id)}
              style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: T.rl, padding: "14px 16px", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                transition: "border-color .15s",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.red, fontSize: 13, fontWeight: 700, fontFamily: T.mono, marginBottom: 2 }}>
                  {o.order_number}
                </div>
                {isAdmin && (
                  <div style={{ color: T.offWhite, fontSize: 12, fontWeight: 600, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.business_name}
                  </div>
                )}
                <div style={{ color: T.faint, fontSize: 11 }}>{o.created_at?.slice(0, 10)}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: T.white, fontSize: 14, fontWeight: 800, marginBottom: 5 }}>{fmt(o.total_kes)}</div>
                <Badge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order, isAdmin, onBack, onStatus }) {
  const [busy, setBusy] = useState(false);

  const handle = async (status) => {
    setBusy(true);
    await onStatus(order.id, status);
    setBusy(false);
  };

  const nextStatuses = ["confirmed", "dispatched", "delivered", "cancelled"].filter(
    (s) => s !== order.status
  );

  return (
    <div style={{ padding: "20px 16px 100px", fontFamily: T.font }}>
      <button onClick={onBack} style={{
        background: "transparent", border: "none", color: T.muted,
        cursor: "pointer", fontSize: 13, marginBottom: 20,
        display: "flex", alignItems: "center", gap: 6, fontFamily: T.font,
        padding: 0,
      }}>
        ← All Orders
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ color: T.red, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
              {order.created_at?.slice(0, 10)}
            </div>
            <h1 style={{ color: T.white, fontSize: 20, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.4px" }}>
              {order.order_number}
            </h1>
            <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>{order.business_name}</p>
          </div>
          <Badge status={order.status} />
        </div>
      </div>

      {/* Line items */}
      <Card style={{ marginBottom: 12 }}>
        {(order.items || []).map((item, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", gap: 10,
            padding: "12px 16px",
            borderBottom: i < order.items.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: T.white, fontSize: 13, fontWeight: 700 }}>{item.product_name}</div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 1 }}>
                {item.sku} · {item.qty} × {fmt(item.unit_price_kes)}
              </div>
            </div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {fmt(item.subtotal_kes)}
            </div>
          </div>
        ))}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "12px 16px", background: `${T.base}80`,
          borderTop: `1px solid ${T.border}`,
        }}>
          <span style={{ color: T.muted, fontWeight: 600, fontSize: 13 }}>Total</span>
          <span style={{ color: T.red, fontWeight: 800, fontSize: 16 }}>{fmt(order.total_kes)}</span>
        </div>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card style={{ marginBottom: 16, padding: "12px 16px" }}>
          <span style={{ color: T.faint, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Note: </span>
          <span style={{ color: T.offWhite, fontSize: 13 }}>{order.notes}</span>
        </Card>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div>
          <div style={{ color: T.faint, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Update Status
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handle(s)}
                disabled={busy}
                style={{
                  padding: "9px 16px", borderRadius: T.r,
                  border: `1px solid ${T.border}`, background: "transparent",
                  color: busy ? T.faint : T.offWhite, fontSize: 12, fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer", fontFamily: T.font,
                  letterSpacing: "0.04em", textTransform: "capitalize",
                }}
              >
                Mark {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
