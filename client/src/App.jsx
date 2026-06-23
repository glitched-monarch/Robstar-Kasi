import { useState, useCallback, useEffect } from "react";
import { FontLink, Toast } from "./components/UI";
import { Sidebar, BottomNav } from "./components/Nav";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import Cart      from "./pages/Cart";
import Orders    from "./pages/Orders";
import Inventory from "./pages/Inventory";
import { api }   from "./utils/api";

/* Simple breakpoint hook */
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

export default function App() {
  const [user,     setUser]     = useState(null);
  const [page,     setPage]     = useState("dashboard");
  const [cart,     setCart]     = useState({});
  const [products, setProducts] = useState([]);
  const [toast,    setToast]    = useState(null);
  const isMobile = useIsMobile();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  /* Load products once logged in (needed for cart) */
  useEffect(() => {
    if (!user) return;
    api.getProducts().then(setProducts).catch(console.error);
  }, [user]);

  const handleAdd = useCallback((product, delta) => {
    setCart((prev) => {
      const cur = prev[product.id] || 0;
      const nxt = Math.max(0, cur + delta);
      if (nxt === 0) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.id]: nxt };
    });
    if (delta > 0) showToast(`${product.name.slice(0, 26)}… added`);
  }, [showToast]);

  const handleOrderPlaced = useCallback(() => {
    setCart({});
    setPage("orders");
  }, []);

  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  if (!user) return (
    <>
      <FontLink />
      <Login onLogin={(u) => { setUser(u); setPage("dashboard"); }} />
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#08080E" }}>
      <FontLink />

      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          user={user}
          active={page}
          onNav={setPage}
          cartCount={cartCount}
          onLogout={() => { setUser(null); setCart({}); }}
        />
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        overflowY: "auto",
        minHeight: "100vh",
        /* On mobile, top safe area + bottom nav */
        paddingTop: isMobile ? "env(safe-area-inset-top, 0px)" : 0,
      }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "#08080E",
            borderBottom: "1px solid #1F1F30",
            padding: "12px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚙</span>
              <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif" }}>
                ROBSTAR <span style={{ color: "#E0141A" }}>KASI</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cartCount > 0 && (
                <button onClick={() => setPage("cart")} style={{
                  background: "rgba(224,20,26,0.12)", border: "1px solid rgba(224,20,26,0.35)",
                  borderRadius: 20, padding: "4px 12px",
                  color: "#E0141A", fontSize: 12, fontWeight: 800, cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  Cart {cartCount}
                </button>
              )}
              <button onClick={() => { setUser(null); setCart({}); }} style={{
                background: "transparent", border: "1px solid #1F1F30",
                color: "#7A7A9A", borderRadius: 6, padding: "5px 10px",
                fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Out
              </button>
            </div>
          </div>
        )}

        {/* Pages */}
        {page === "dashboard" && <Dashboard user={user} onNav={setPage} />}
        {page === "catalogue" && <Catalogue cart={cart} onAdd={handleAdd} />}
        {page === "cart"      && (
          <Cart
            cart={cart}
            products={products}
            onAdd={handleAdd}
            onClear={() => setCart({})}
            onOrderPlaced={handleOrderPlaced}
            showToast={showToast}
            user={user}
          />
        )}
        {page === "orders"    && <Orders user={user} showToast={showToast} />}
        {page === "allorders" && user.role === "admin" && <Orders user={user} showToast={showToast} />}
        {page === "inventory" && user.role === "admin" && <Inventory />}
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <BottomNav user={user} active={page} onNav={setPage} cartCount={cartCount} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
