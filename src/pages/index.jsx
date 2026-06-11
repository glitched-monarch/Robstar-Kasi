// ─── ROBSTAR KASI — Page Components ─────────────────────────────
import { useState } from "react";
import { T } from "../utils/tokens";
import { fmt } from "../utils/helpers";
import { DB } from "../data/db";
import { Badge, StatCard, PageHeader, QtyStepper } from "../components/ui";

// ── LOGIN ────────────────────────────────────────────────────────
export function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setL]   = useState(false);

  const go = () => {
    setErr("");
    setL(true);

    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(u => onLogin(u))
      .catch(() => setErr("Number not on the approved list."))
      .finally(() => setL(false));
  };

  return (
    <div style={{ minHeight:"100vh", background:T.base, display:"flex", fontFamily:T.font, flexDirection:"column" }}>

      {/* Mobile-only brand bar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"20px 20px 0", maxWidth:500 }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:`linear-gradient(135deg, ${T.red}, ${T.redDim})`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
        }}>⚙</div>
        <div>
          <div style={{ color:T.white, fontWeight:800, fontSize:15, letterSpacing:"-0.3px" }}>
            ROBSTAR <span style={{ color:T.red }}>KASI</span>
          </div>
          <div style={{ color:T.faint, fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase" }}>Supplier Portal</div>
        </div>
      </div>

      {/* Two-column on desktop, stacked on mobile */}
      <div style={{ display:"flex", flex:1, flexWrap:"wrap" }}>

        {/* Left brand panel — hidden on small screens via min-width trick */}
        <div style={{
          flex:"1 1 380px", minWidth:0,
          background:`linear-gradient(145deg, #0D0D18 0%, #0A0010 60%, ${T.red}18 100%)`,
          display:"flex", flexDirection:"column", justifyContent:"center",
          padding:"56px 64px", borderRight:`1px solid ${T.border}`,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", inset:0, opacity:0.04,
            backgroundImage:"linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
            backgroundSize:"40px 40px",
          }}/>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:`linear-gradient(to bottom, transparent, ${T.red}, transparent)` }}/>
          <div style={{ position:"relative" }}>
            <div style={{ color:T.red, fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>
              Nairobi Industrial Area
            </div>
            <h1 style={{ color:T.white, fontSize:48, fontWeight:800, lineHeight:1.05, margin:"0 0 20px", letterSpacing:"-1.5px" }}>
              Parts.{"\n"}Ordered.{"\n"}<span style={{ color:T.red }}>Delivered.</span>
            </h1>
            <p style={{ color:T.muted, fontSize:14, lineHeight:1.7, maxWidth:320, margin:"0 0 48px", fontFamily:T.body }}>
              The closed ordering platform for verified garages and distributors on Kirinyaga Road.
            </p>
            <div style={{ display:"flex", gap:36 }}>
              {[["240+","Parts in stock"],["50+","Active garages"],["24hr","Dispatch time"]].map(([n,l])=>(
                <div key={l}>
                  <div style={{ color:T.white, fontSize:20, fontWeight:800, letterSpacing:"-0.5px" }}>{n}</div>
                  <div style={{ color:T.faint, fontSize:11, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div style={{
          flex:"1 1 320px", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", padding:"40px 24px",
        }}>
          <div style={{ width:"100%", maxWidth:360 }}>
            <h2 style={{ color:T.white, fontSize:24, fontWeight:800, margin:"0 0 6px", letterSpacing:"-0.5px" }}>Sign In</h2>
            <p style={{ color:T.muted, fontSize:13, margin:"0 0 28px", fontFamily:T.body }}>
              Enter your registered Safaricom number
            </p>

            <label style={{ color:T.offWhite, fontSize:12, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>
              Phone Number
            </label>
            <input
              type="tel" placeholder="07XX XXX XXX" value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === "Enter" && go()}
              style={{
                width:"100%", boxSizing:"border-box", padding:"14px 16px",
                borderRadius:10, fontSize:16, fontFamily:T.font, fontWeight:600,
                background:T.card, border:`1px solid ${err ? T.red : T.border}`,
                color:T.white, outline:"none", marginBottom:err ? 8 : 18,
              }}
            />
            {err && <p style={{ color:"#FF6666", fontSize:12, margin:"0 0 14px", fontFamily:T.body }}>{err}</p>}

            <button onClick={go} disabled={loading || !phone} style={{
              width:"100%", padding:"15px", borderRadius:10, border:"none",
              background: loading || !phone ? T.faint : `linear-gradient(135deg, ${T.red}, ${T.redDim})`,
              color: loading || !phone ? T.muted : T.white,
              fontSize:15, fontWeight:800, cursor: loading || !phone ? "not-allowed" : "pointer",
              letterSpacing:"0.04em", fontFamily:T.font,
              boxShadow: loading || !phone ? "none" : `0 4px 24px ${T.redGlow}`,
            }}>
              {loading ? "Verifying…" : "Continue →"}
            </button>

            <div style={{ marginTop:24, padding:"14px 16px", borderRadius:10, background:T.card, border:`1px solid ${T.border}` }}>
              <div style={{ color:T.faint, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Demo accounts</div>
              {[["0722100001","Buyer — Westlands Garage"],["0700000000","Admin — HQ"]].map(([p,l])=>(
                <div key={p} onClick={() => setPhone(p)} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"8px 0", cursor:"pointer", borderBottom:`1px solid ${T.border}`,
                }}>
                  <code style={{ color:T.red, fontSize:13, fontWeight:700 }}>{p}</code>
                  <span style={{ color:T.muted, fontSize:11, fontFamily:T.body }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────
export function Dashboard({ user, orders, products, onNav }) {
  const mine    = user.role === "admin" ? orders : orders.filter(o => o.buyer_id === user.id);
  const revenue = orders.filter(o => o.status !== "cancelled").reduce((s,o) => s + o.total_kes, 0);
  const pending = orders.filter(o => o.status === "pending").length;
  const low     = products.filter(p => p.stock_qty < 20).length;

  const stats = user.role === "admin"
    ? [
        { label:"Total Revenue", value:fmt(revenue),  sub:"all orders",          accent:T.red     },
        { label:"Total Orders",  value:orders.length,  sub:"all customers",       accent:T.blueMid },
        { label:"Pending",       value:pending,         sub:"awaiting action",     accent:"#CCA400" },
        { label:"Low Stock",     value:low,             sub:"items under 20 units",accent:"#FF5555" },
      ]
    : [
        { label:"My Orders",   value:mine.length,                                           sub:"total placed",     accent:T.blueMid },
        { label:"Pending",     value:mine.filter(o => o.status === "pending").length,         sub:"awaiting confirm",  accent:"#CCA400" },
        { label:"Delivered",   value:mine.filter(o => o.status === "delivered").length,       sub:"completed",        accent:"#00C86E" },
        { label:"Total Spent", value:fmt(mine.reduce((s,o) => s + o.total_kes, 0)),          sub:"all time",         accent:T.red     },
      ];

  return (
    <div style={{ padding:"28px 20px", fontFamily:T.font }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ color:T.red, fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6 }}>
          {new Date().toLocaleDateString("en-KE", { weekday:"long", day:"numeric", month:"long" })}
        </div>
        <h1 style={{ color:T.white, fontSize:26, fontWeight:800, margin:"0 0 4px", letterSpacing:"-0.8px" }}>
          Good day, {user.name.split(" ")[0]}
        </h1>
        <p style={{ color:T.muted, fontSize:13, margin:0, fontFamily:T.body }}>{user.business_name}</p>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12, marginBottom:28 }}>
        {stats.map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      {/* Recent orders */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:T.white, fontSize:15, fontWeight:800 }}>Recent Orders</span>
          <button onClick={() => onNav(user.role === "admin" ? "allorders" : "orders")} style={{
            background:"transparent", border:`1px solid ${T.border}`, color:T.muted,
            borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:T.font, fontWeight:600,
          }}>View all →</button>
        </div>

        {mine.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:T.faint, fontSize:13, fontFamily:T.body }}>
            No orders yet.{" "}
            <span onClick={() => onNav("catalogue")} style={{ color:T.red, cursor:"pointer", fontWeight:700 }}>Browse parts →</span>
          </div>
        ) : (
          /* Mobile-friendly card list instead of table */
          <div>
            {mine.slice(0, 6).map(o => (
              <div key={o.id} style={{
                padding:"14px 20px",
                borderBottom:`1px solid ${T.border}20`,
                display:"flex", alignItems:"center", gap:12, flexWrap:"wrap",
              }}>
                <span style={{ color:T.red, fontSize:13, fontWeight:700, fontFamily:"monospace", flexShrink:0 }}>{o.order_number}</span>
                {user.role === "admin" && <span style={{ color:T.offWhite, fontSize:12, flex:1, minWidth:100 }}>{o.business_name}</span>}
                <span style={{ color:T.white, fontSize:13, fontWeight:700, marginLeft:"auto" }}>{fmt(o.total_kes)}</span>
                <Badge status={o.status}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CATALOGUE ────────────────────────────────────────────────────
export function Catalogue({ products, cart, onAdd }) {
    import { useState, useEffect } from "react";
  const [search, setSearch] = useState("");
  const [cat, setCat]       = useState("All");
  const cats = ["All", ...new Set(products.map(p => p.category))].sort();

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand||"").toLowerCase().includes(q))
        && (cat === "All" || p.category === cat);
  });
  const [filteredProducts, setFilteredProducts] = useState([]);

useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(setProducts);
}, []);

  return (
    <div style={{ padding:"28px 20px", fontFamily:T.font }}>
      <PageHeader eyebrow="Catalogue" title="Parts & Components" subtitle={`${filtered.length} items available`}/>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:12 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.faint, fontSize:14 }}>⌕</span>
        <input
          placeholder="Search by name, SKU, brand…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width:"100%", boxSizing:"border-box", padding:"11px 14px 11px 38px",
            borderRadius:9, border:`1px solid ${T.border}`, background:T.card,
            color:T.white, fontSize:13, outline:"none", fontFamily:T.font,
          }}
        />
      </div>

      {/* Category pills — horizontally scrollable on mobile */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:20, scrollbarWidth:"none" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding:"7px 14px", borderRadius:8, border:`1px solid ${cat === c ? T.red : T.border}`,
            background: cat === c ? T.redGlow : "transparent",
            color: cat === c ? T.red : T.muted,
            fontSize:12, fontWeight: cat === c ? 700 : 500, cursor:"pointer",
            fontFamily:T.font, whiteSpace:"nowrap", flexShrink:0,
          }}>{c}</button>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14 }}>
        {filtered.map(p => {
          const inCart   = cart[p.id] || 0;
          const lowStock = p.stock_qty < 20;
          return (
            <div key={p.id} style={{
              background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
              padding:18, display:"flex", flexDirection:"column", gap:12,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                <code style={{ color:T.red, fontSize:10, fontWeight:700, background:T.redGlow, padding:"3px 8px", borderRadius:5 }}>{p.sku}</code>
                <span style={{ color:T.faint, fontSize:10, fontWeight:600, background:T.border, padding:"3px 8px", borderRadius:5, textTransform:"uppercase", letterSpacing:"0.06em", flexShrink:0 }}>{p.category}</span>
              </div>
              <div>
                <div style={{ color:T.white, fontSize:14, fontWeight:700, lineHeight:1.35 }}>{p.name}</div>
                <div style={{ color:T.muted, fontSize:11, marginTop:3, fontFamily:T.body }}>{p.brand} · per {p.unit}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:"auto" }}>
                <div>
                  <div style={{ color:T.white, fontSize:18, fontWeight:800, letterSpacing:"-0.3px" }}>{fmt(p.price_kes)}</div>
                  <div style={{ fontSize:10, fontWeight:700, marginTop:3, letterSpacing:"0.06em", color: lowStock ? "#FF5555" : "#00C86E" }}>
                    {lowStock ? `⚠ ${p.stock_qty} left` : `✓ ${p.stock_qty} in stock`}
                  </div>
                </div>
                {inCart > 0 ? (
                  <QtyStepper
                    value={inCart}
                    onDecrement={() => onAdd(p, -1)}
                    onIncrement={() => onAdd(p, 1)}
                    accentOnAdd
                  />
                ) : (
                  <button onClick={() => onAdd(p, 1)} style={{
                    padding:"9px 16px", borderRadius:8, border:`1px solid ${T.red}`,
                    background:"transparent", color:T.red, fontSize:12, fontWeight:700,
                    cursor:"pointer", fontFamily:T.font,
                  }}>Add +</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign:"center", color:T.faint, padding:56, fontSize:14, fontFamily:T.body }}>No parts matching your search.</div>
      )}
    </div>
  );
}

// ── CART ─────────────────────────────────────────────────────────
export function Cart({ cart, products, onAdd, onClear, onPlaceOrder }) {
  const [notes, setNotes] = useState("");
  const items = Object.entries(cart).map(([pid, qty]) => ({ ...products.find(p => p.id === pid), qty }));
  const total = items.reduce((s, i) => s + i.price_kes * i.qty, 0);

  if (!items.length) return (
    <div style={{ padding:36, fontFamily:T.font, textAlign:"center", paddingTop:80 }}>
      <div style={{ fontSize:52, marginBottom:16, opacity:.25 }}>◎</div>
      <h2 style={{ color:T.white, fontSize:20, fontWeight:800, marginBottom:8 }}>Cart is empty</h2>
      <p style={{ color:T.muted, fontSize:13, fontFamily:T.body }}>Add items from the Parts Catalogue to get started.</p>
    </div>
  );

  return (
    <div style={{ padding:"28px 20px", fontFamily:T.font, maxWidth:680 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <PageHeader eyebrow="Order Review" title="My Cart"/>
        <button onClick={onClear} style={{
          background:"transparent", border:`1px solid ${T.border}`, color:T.muted,
          borderRadius:7, padding:"7px 14px", fontSize:12, cursor:"pointer", fontFamily:T.font, marginTop:4,
        }}>Clear</button>
      </div>

      {/* Line items */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", marginBottom:14 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            display:"flex", alignItems:"center", gap:12, padding:"13px 18px",
            borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
            flexWrap:"wrap",
          }}>
            <div style={{ flex:1, minWidth:140 }}>
              <div style={{ color:T.white, fontSize:13, fontWeight:700 }}>{item.name}</div>
              <div style={{ color:T.muted, fontSize:11, fontFamily:T.body }}>{item.sku} · {fmt(item.price_kes)}/{item.unit}</div>
            </div>
            <QtyStepper
              value={item.qty}
              onDecrement={() => onAdd(item, -1)}
              onIncrement={() => onAdd(item, 1)}
            />
            <div style={{ color:T.white, fontWeight:800, fontSize:14, minWidth:90, textAlign:"right" }}>
              {fmt(item.price_kes * item.qty)}
            </div>
          </div>
        ))}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"13px 18px", background:`${T.base}80`, borderTop:`1px solid ${T.border}` }}>
          <span style={{ color:T.muted, fontSize:13, fontWeight:600 }}>Total ({items.length} line{items.length !== 1 ? "s" : ""})</span>
          <span style={{ color:T.red, fontSize:17, fontWeight:800, letterSpacing:"-0.3px" }}>{fmt(total)}</span>
        </div>
      </div>

      {/* Notes */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
        <label style={{ color:T.offWhite, fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>
          Delivery Notes (optional)
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Call before delivery, drop at gate 4…" rows={3}
          style={{
            width:"100%", boxSizing:"border-box", padding:"10px 13px", borderRadius:8,
            border:`1px solid ${T.border}`, background:T.base, color:T.white,
            fontSize:13, outline:"none", resize:"vertical", fontFamily:T.body,
          }}
        />
      </div>

      <button onClick={() => onPlaceOrder(notes)} style={{
        width:"100%", padding:"16px", borderRadius:11, border:"none",
        background:`linear-gradient(135deg, ${T.red}, ${T.redDim})`,
        color:T.white, fontSize:15, fontWeight:800, cursor:"pointer",
        fontFamily:T.font, letterSpacing:"0.04em",
        boxShadow:`0 6px 28px ${T.redGlow}`,
      }}>
        Place Order — {fmt(total)} →
      </button>
    </div>
  );
}

// ── ORDERS LIST ──────────────────────────────────────────────────
export function OrdersList({ orders, user, onStatusChange }) {
  const [sel, setSel] = useState(null);
  const mine = user.role === "admin" ? orders : orders.filter(o => o.buyer_id === user.id);

  // Order detail view
  if (sel) {
    const order = mine.find(o => o.id === sel);
    const items = DB.orderItems[sel] || [];
    return (
      <div style={{ padding:"28px 20px", fontFamily:T.font, maxWidth:660 }}>
        <button onClick={() => setSel(null)} style={{
          background:"transparent", border:"none", color:T.muted,
          cursor:"pointer", fontSize:13, marginBottom:22, display:"flex", alignItems:"center", gap:4, fontFamily:T.font,
        }}>← All Orders</button>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ color:T.red, fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:4 }}>{order.created_at.slice(0,10)}</div>
            <h1 style={{ color:T.white, fontSize:24, fontWeight:800, margin:"0 0 2px", letterSpacing:"-0.5px" }}>{order.order_number}</h1>
            <p style={{ color:T.muted, fontSize:13, margin:0, fontFamily:T.body }}>{order.business_name}</p>
          </div>
          <Badge status={order.status}/>
        </div>

        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", marginBottom:12 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"12px 18px", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none", flexWrap:"wrap" }}>
              <div>
                <div style={{ color:T.white, fontSize:13, fontWeight:700 }}>{item.product_name}</div>
                <div style={{ color:T.muted, fontSize:11, fontFamily:T.body }}>{item.sku} · {item.qty} × {fmt(item.unit_price_kes)}</div>
              </div>
              <div style={{ color:T.white, fontWeight:700, fontSize:13 }}>{fmt(item.subtotal_kes)}</div>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"13px 18px", background:`${T.base}80` }}>
            <span style={{ color:T.muted, fontWeight:600, fontSize:13 }}>Total</span>
            <span style={{ color:T.red, fontWeight:800, fontSize:16 }}>{fmt(order.total_kes)}</span>
          </div>
        </div>

        {order.notes && (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 16px", marginBottom:12 }}>
            <span style={{ color:T.faint, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>Notes: </span>
            <span style={{ color:T.offWhite, fontSize:13, fontFamily:T.body }}>{order.notes}</span>
          </div>
        )}

        {user.role === "admin" && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["confirmed","dispatched","delivered","cancelled"].filter(s => s !== order.status).map(s => (
              <button key={s} onClick={() => { onStatusChange(order.id, s); setSel(null); }} style={{
                padding:"9px 18px", borderRadius:8, border:`1px solid ${T.border}`,
                background:"transparent", color:T.muted, fontSize:12, fontWeight:700,
                cursor:"pointer", fontFamily:T.font, letterSpacing:"0.04em",
              }}>Mark {s}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Orders list view — cards on mobile
  return (
    <div style={{ padding:"28px 20px", fontFamily:T.font }}>
      <PageHeader
        eyebrow={user.role === "admin" ? "All Customers" : "Order History"}
        title={user.role === "admin" ? "All Orders" : "My Orders"}
      />
      {mine.length === 0 ? (
        <div style={{ textAlign:"center", padding:56, color:T.faint, fontSize:14, fontFamily:T.body }}>No orders yet.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {mine.map(o => (
            <div key={o.id} style={{
              background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
              padding:"14px 18px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap",
              cursor:"pointer",
            }} onClick={() => setSel(o.id)}>
              <span style={{ color:T.red, fontSize:13, fontWeight:700, fontFamily:"monospace", flexShrink:0 }}>{o.order_number}</span>
              {user.role === "admin" && <span style={{ color:T.offWhite, fontSize:12, flex:1, minWidth:100 }}>{o.business_name}</span>}
              <span style={{ color:T.muted, fontSize:11, fontFamily:T.body, marginLeft: user.role !== "admin" ? "auto" : 0 }}>{o.created_at.slice(0,10)}</span>
              <span style={{ color:T.white, fontSize:13, fontWeight:700 }}>{fmt(o.total_kes)}</span>
              <Badge status={o.status}/>
              {user.role === "admin" && (
                <div style={{ display:"flex", gap:6 }} onClick={e => e.stopPropagation()}>
                  {["confirmed","dispatched","delivered","cancelled"].filter(s => s !== o.status).slice(0,2).map(s => (
                    <button key={s} onClick={() => onStatusChange(o.id, s)} style={{
                      padding:"4px 10px", borderRadius:6, border:`1px solid ${T.border}`,
                      background:"transparent", color:T.muted, fontSize:10, fontWeight:700,
                      cursor:"pointer", fontFamily:T.font,
                    }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── INVENTORY ────────────────────────────────────────────────────
export function Inventory({ products }) {
  return (
    <div style={{ padding:"28px 20px", fontFamily:T.font }}>
      <PageHeader eyebrow="Stock Management" title="Inventory"/>

      {/* Mobile: card list. Desktop: table */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {products.map(p => (
          <div key={p.id} style={{
            background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
            padding:"14px 18px",
          }}>
            {/* Top row */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
              <code style={{ color:T.red, fontSize:10, fontWeight:700, background:T.redGlow, padding:"2px 7px", borderRadius:4 }}>{p.sku}</code>
              <span style={{ color:T.faint, fontSize:10, background:T.border, padding:"2px 7px", borderRadius:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>{p.category}</span>
              <span style={{ color:T.muted, fontSize:11, marginLeft:"auto" }}>{p.brand}</span>
            </div>
            {/* Name + price row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <div style={{ color:T.white, fontSize:13, fontWeight:700 }}>{p.name}</div>
              <div style={{ color:T.white, fontSize:14, fontWeight:800 }}>{fmt(p.price_kes)}</div>
            </div>
            {/* Stock row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
              <span style={{ color:T.muted, fontSize:11, fontFamily:T.body }}>per {p.unit}</span>
              <span style={{
                fontWeight:800, fontSize:12,
                color: p.stock_qty < 20 ? "#FF5555" : p.stock_qty < 50 ? "#CCA400" : "#00C86E",
              }}>
                {p.stock_qty < 20 ? `⚠ ${p.stock_qty} left` : `${p.stock_qty} in stock`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}