const BASE = process.env.REACT_APP_API_URL || "/api";

async function req(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  /* Auth */
  login: (phone, password)            => req("POST", "/auth/login", { phone, password }),
  logout: ()                          => req("POST", "/auth/logout"),
  changePassword: (currentPassword, newPassword) => req("POST", "/auth/change-password", { currentPassword, newPassword }),
  me: ()                              => req("GET", "/auth/me"),

  /* Products */
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req("GET", `/products${qs ? "?" + qs : ""}`);
  },
  getCategories: ()         => req("GET", "/products/categories"),

  /* Orders */
  getOrders: (buyer_id)     => req("GET", `/orders${buyer_id ? "?buyer_id=" + buyer_id : ""}`),
  getOrder:  (id)           => req("GET", `/orders/${id}`),
  placeOrder: (payload)     => req("POST", "/orders", payload),
  updateStatus: (id, status)=> req("PATCH", `/orders/${id}/status`, { status }),

  /* Stats */
  getStats: ()              => req("GET", "/stats"),
};