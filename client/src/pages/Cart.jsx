import { useState } from "react";
import { T, fmt } from "../styles/tokens";
import { api } from "../utils/api";
import { Card, Spinner } from "../components/UI";

export default function Cart({ cart, products, onAdd, onClear, onOrderPlaced, showToast, user }) {
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);

  const items = Object.entries(cart).map(([pid, qty]) => ({
    ...products.find((p) => p.id === pid),
    qty,
  })).filter(Boolean);

  const total = items.reduce((s, i) => s + i.price_kes * i.qty, 0);

  const handlePlace = async () => {
    setLoading(true);
    try {
      const payload = {
        buyer_id: user.id,
        notes: notes || undefined,
        items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
      };
      const order = await api.placeOrder(payload);
      onOrderPlaced(order);
      showToast(`${order.order_number} placed!`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", fontFamily: T.font }}>
        <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.25 }}>◎</div>
        <h2 style={{ color: T.white, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Cart is empty</h2>
        <p style={{ color: T.muted, fontSize: 13 }}>Add items from the Parts Catalogue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 120px", fontFamily: T.font }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ color: T.red, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            Order Review
          </div>
          <h1 style={{ color: T.white, fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            My Cart
          </h1>
        </div>
        <button onClick={onClear} style={{
          background: "transparent", border: `1px solid ${T.border}`,
          color: T.muted, borderRadius: T.r, padding: "6px 12px",
          fontSize: 11, cursor: "pointer", fontFamily: T.font, fontWeight: 600,
          marginTop: 4,
        }}>
          Clear
        </button>
      </div>

      {/* Line items */}
      <Card style={{ marginBottom: 12 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            display: "flex", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.white, fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
                {fmt(item.price_kes)} / {item.unit}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <SmBtn onClick={() => onAdd(item, -1)}>−</SmBtn>
              <span style={{ color: T.white, fontWeight: 700, minWidth: 18, textAlign: "center", fontSize: 14 }}>
                {item.qty}
              </span>
              <SmBtn onClick={() => onAdd(item, 1)}>+</SmBtn>
            </div>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 13, flexShrink: 0, minWidth: 80, textAlign: "right" }}>
              {fmt(item.price_kes * item.qty)}
            </div>
          </div>
        ))}

        {/* Total row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px",
          background: `${T.base}80`, borderTop: `1px solid ${T.border}`,
        }}>
          <span style={{ color: T.muted, fontSize: 12, fontWeight: 600 }}>
            Total ({items.length} line{items.length !== 1 ? "s" : ""})
          </span>
          <span style={{ color: T.red, fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>
            {fmt(total)}
          </span>
        </div>
      </Card>

      {/* Notes */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: "12px 16px" }}>
          <label style={{
            color: T.offWhite, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.09em", textTransform: "uppercase", display: "block", marginBottom: 8,
          }}>
            Delivery Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Call before delivery, drop at gate 4…"
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: T.r,
              border: `1px solid ${T.border}`, background: T.base,
              color: T.white, fontSize: 13, outline: "none", resize: "vertical",
              fontFamily: T.font,
            }}
          />
        </div>
      </Card>

      {/* Sticky CTA */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 70px)",
        background: T.base, borderTop: `1px solid ${T.border}`,
        zIndex: 10,
      }}>
        <button
          onClick={handlePlace}
          disabled={loading}
          style={{
            width: "100%", padding: "15px", borderRadius: T.rl, border: "none",
            background: loading ? T.faint : `linear-gradient(135deg, ${T.red}, ${T.redDim})`,
            color: loading ? T.muted : T.white,
            fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: T.font, letterSpacing: "0.04em",
            boxShadow: loading ? "none" : `0 6px 28px ${T.redGlow}`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {loading
            ? "Placing order…"
            : `Place Order — ${fmt(total)} →`}
        </button>
      </div>
    </div>
  );
}

function SmBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 28, height: 28, borderRadius: 6,
      border: `1px solid ${T.border}`, background: T.surface,
      color: T.white, cursor: "pointer", fontSize: 15,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{children}</button>
  );
}
