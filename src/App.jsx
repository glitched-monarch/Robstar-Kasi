// ─── ROBSTAR KASI — App Root ─────────────────────────────────────
import { useState, useCallback, useEffect } from "react";
import { T } from "./utils/tokens";
import { uid } from "./utils/helpers";
import { DB } from "./data/db";
import { FontLink, Toast } from "./components/ui";
import { Sidebar, MobileHeader, MobileDrawer } from "./components/Nav";
import { Login, Dashboard, Catalogue, Cart, OrdersList, Inventory } from "./pages/index";

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────
  const [user,     setUser]     = useState(null);

  // ── Navigation ────────────────────────────────────────────────
  const [page,     setPage]     = useState("dashboard");
  const [drawerOpen, setDrawer] = useState(false);

  // ── App state ─────────────────────────────────────────────────
  const [cart,     setCart]     = useState({});
  const [products, setProducts] = useState(DB.products);
  const [orders,   setOrders]   = useState(DB.orders);
  const [toast,    setToast]    = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Cart handler ──────────────────────────────────────────────
  const handleAdd = useCallback((product, delta) => {
    setCart(prev => {
      const cur = prev[product.id] || 0;
      const nxt = Math.max(0, cur + delta);
      if (nxt === 0) { const { [product.id]: _, ...rest } = prev; return rest; }
      return { ...prev, [product.id]: nxt };
    });
    if (delta > 0) showToast(`${product.name.slice(0, 30)}… added`);
  }, []);

  // ── Place order ───────────────────────────────────────────────
  const handlePlaceOrder = useCallback((notes) => {
    const items = Object.entries(cart).map(([pid, qty]) => ({
      ...products.find(p => p.id === pid), qty,
    }));
    const total  = items.reduce((s, i) => s + i.price_kes * i.qty, 0);
    const oid    = "o" + uid();
    const num    = `ORD-${String(orders.length + 1).padStart(3, "0")}`;

    const newOrder = {
      id: oid, order_number: num, buyer_id: user.id, status: "pending",
      total_kes: total, notes: notes || "",
      created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
      business_name: user.business_name, buyer_name: user.name,
    };

    // Write items into the in-memory store
 const handlePlaceOrder = useCallback(async (notes) => {
  const items = Object.entries(cart).map(([pid, qty]) => ({
    product_id: pid, qty,
  }));

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyer_id: user.id, items, notes }),
  });

  const order = await res.json();
  showToast(`${order.order_number} placed!`);
  setCart({});
  setPage("orders");
}, [cart, user]);

// orders list
useEffect(() => {
  const url = user.role === 'admin'
    ? '/api/orders'
    : `/api/orders?buyer_id=${user.id}`;
  fetch(url).then(res => res.json()).then(setOrders);
}, [user]);

  // ── Status update (admin) ─────────────────────────────────────
  const handleStatus = useCallback((oid, status) => {
    setOrders(prev => prev.map(o => o.id === oid ? { ...o, status } : o));
    showToast(`Order updated to ${status}`);
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => { setUser(null); setCart({}); setPage("dashboard"); };

  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  // ── Login gate ────────────────────────────────────────────────
  if (!user) return (
    <>
      <FontLink/>
      <Login onLogin={u => { setUser(u); setPage("dashboard"); }}/>
    </>
  );

  // ── Page renderer ─────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} orders={orders} products={products} onNav={setPage}/>;
      case "catalogue": return <Catalogue products={products} cart={cart} onAdd={handleAdd}/>;
      case "cart":      return <Cart cart={cart} products={products} onAdd={handleAdd} onClear={() => setCart({})} onPlaceOrder={handlePlaceOrder}/>;
      case "orders":    return <OrdersList orders={orders} user={user} onStatusChange={handleStatus}/>;
      case "allorders": return user.role === "admin" ? <OrdersList orders={orders} user={user} onStatusChange={handleStatus}/> : null;
      case "inventory": return user.role === "admin" ? <Inventory products={products}/> : null;
      default:          return null;
    }
  };

  // ── Layout — responsive: sidebar on desktop, drawer on mobile ──
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.base, fontFamily:T.font }}>
      <FontLink/>

      {/* Desktop sidebar — hidden on small screens */}
      <div style={{ display:"flex" }} className="sidebar-wrapper">
        <style>{`
          @media (max-width: 768px) { .sidebar-wrapper { display: none !important; } }
          @media (min-width: 769px) { .mobile-header   { display: none !important; } }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #252535; border-radius: 4px; }
        `}</style>
        <Sidebar user={user} active={page} onNav={setPage} cartCount={cartCount} onLogout={handleLogout}/>
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Mobile header */}
        <div className="mobile-header">
          <MobileHeader user={user} page={page} cartCount={cartCount} onMenuOpen={() => setDrawer(true)}/>
        </div>

        <main style={{ flex:1, overflowY:"auto", paddingBottom:32 }}>
          {renderPage()}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <MobileDrawer
          user={user} active={page} onNav={setPage}
          cartCount={cartCount} onLogout={handleLogout}
          onClose={() => setDrawer(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
    </div>
  );
})}
