import { useState, useEffect } from "react";
import { T, fmt } from "../styles/tokens";
import { api } from "../utils/api";
import { SectionHeader, Spinner } from "../components/UI";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const byCategory = products.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const stockColor = (qty) => qty < 20 ? "#FF5555" : qty < 50 ? T.yellow : T.green;

  return (
    <div style={{ padding: "20px 16px 100px", fontFamily: T.font }}>
      <SectionHeader
        eyebrow="Stock Management"
        title="Inventory"
        sub={`${products.length} active products`}
      />

      {/* Summary chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total SKUs",  value: products.length,                                     color: T.blueMid },
          { label: "Low (< 20)",  value: products.filter(p => p.stock_qty < 20).length,       color: "#FF5555" },
          { label: "OK",          value: products.filter(p => p.stock_qty >= 50).length,      color: T.green   },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: T.r, padding: "8px 14px",
            display: "flex", gap: 6, alignItems: "center",
          }}>
            <span style={{ color, fontWeight: 800, fontSize: 15 }}>{value}</span>
            <span style={{ color: T.muted, fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spinner />
        </div>
      )}

      {!loading && Object.entries(byCategory).sort().map(([category, items]) => (
        <div key={category} style={{ marginBottom: 16 }}>
          <div style={{
            color: T.faint, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: 8, paddingLeft: 4,
          }}>
            {category}
          </div>

          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: T.rl, overflow: "hidden",
          }}>
            {items.map((p, i) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 16px",
                borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.white, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                    <code style={{
                      color: T.red, fontSize: 9, fontWeight: 700,
                      background: T.redGlow, padding: "1px 6px", borderRadius: 4,
                    }}>{p.sku}</code>
                    <span style={{ color: T.muted, fontSize: 11 }}>{p.brand}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: T.white, fontSize: 13, fontWeight: 700 }}>{fmt(p.price_kes)}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 800, marginTop: 2,
                    color: stockColor(p.stock_qty),
                  }}>
                    {p.stock_qty} {p.unit}s
                    {p.stock_qty < 20 && " ⚠"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
