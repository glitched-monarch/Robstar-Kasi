import { useState, useEffect } from "react";
import { T, fmt } from "../styles/tokens";
import { api } from "../utils/api";
import { SectionHeader, Spinner } from "../components/UI";

export default function Catalogue({ cart, onAdd }) {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState("");
  const [cat,        setCat]        = useState("All");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(prods);
        setCategories(["All", ...cats]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q)) &&
      (cat === "All" || p.category === cat)
    );
  });

  return (
    <div style={{ padding: "20px 16px 100px", fontFamily: T.font }}>
      <SectionHeader eyebrow="Catalogue" title="Parts & Components" sub={`${filtered.length} items available`} />

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.faint, fontSize: 15 }}>⌕</span>
        <input
          placeholder="Search by name, SKU, brand…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px 12px 38px",
            borderRadius: T.rl, border: `1px solid ${T.border}`,
            background: T.card, color: T.white, fontSize: 14, outline: "none",
            fontFamily: T.font,
          }}
        />
      </div>

      {/* Category chips — horizontal scroll */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16,
        WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
      }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 999,
              border: `1px solid ${cat === c ? T.red : T.border}`,
              background: cat === c ? T.redMid : "transparent",
              color: cat === c ? T.red : T.muted,
              fontSize: 11, fontWeight: cat === c ? 700 : 500,
              cursor: "pointer", fontFamily: T.font, whiteSpace: "nowrap",
            }}
          >{c}</button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spinner />
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => {
            const inCart = cart[p.id] || 0;
            const low = p.stock_qty < 20;
            return (
              <div key={p.id} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: T.rl, padding: "14px 16px",
                display: "flex", gap: 12, alignItems: "center",
              }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <code style={{
                      color: T.red, fontSize: 9, fontWeight: 700,
                      background: T.redGlow, padding: "2px 7px", borderRadius: 4,
                      fontFamily: T.mono,
                    }}>{p.sku}</code>
                    <span style={{
                      color: T.faint, fontSize: 9, fontWeight: 600,
                      background: T.border, padding: "2px 7px", borderRadius: 4,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{p.category}</span>
                  </div>
                  <div style={{ color: T.white, fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{p.brand} · per {p.unit}</div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, marginTop: 4,
                    color: low ? "#FF5555" : T.green,
                  }}>
                    {low ? `⚠ ${p.stock_qty} left` : `✓ ${p.stock_qty} in stock`}
                  </div>
                </div>

                {/* Price + qty control */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ color: T.white, fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px", marginBottom: 8 }}>
                    {fmt(p.price_kes)}
                  </div>
                  {inCart > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <QtyBtn onClick={() => onAdd(p, -1)}>−</QtyBtn>
                      <span style={{ color: T.red, fontWeight: 800, fontSize: 14, minWidth: 18, textAlign: "center" }}>{inCart}</span>
                      <QtyBtn onClick={() => onAdd(p, 1)} active>+</QtyBtn>
                    </div>
                  ) : (
                    <button onClick={() => onAdd(p, 1)} style={{
                      padding: "8px 14px", borderRadius: T.r,
                      border: `1px solid ${T.red}`, background: "transparent",
                      color: T.red, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: T.font,
                    }}>Add +</button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: T.faint, padding: 48, fontSize: 14 }}>
              No parts matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QtyBtn({ onClick, children, active }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: T.r,
      border: `1px solid ${active ? T.red : T.border}`,
      background: active ? T.redGlow : T.surface,
      color: active ? T.red : T.white,
      fontSize: 16, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700,
    }}>{children}</button>
  );
}
