const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { getDb, saveDb } = require("./server/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ── USERS ──────────────────────────────────────────────────────
app.get("/api/users", async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM users ORDER BY business_name`);
  res.json(rowsToObjects(result));
});

app.post("/api/users/login", async (req, res) => {
  const { phone } = req.body;
  const db = await getDb();
  const result = db.exec(`SELECT * FROM users WHERE phone=? AND whitelisted=1`, [phone]);
  const users = rowsToObjects(result);
  if (!users.length) return res.status(403).json({ error: "Not authorised. Contact your supplier." });
  res.json(users[0]);
});

// ── PRODUCTS ────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  const db = await getDb();
  const { category, search } = req.query;
  let sql = `SELECT * FROM products WHERE active=1`;
  const params = [];
  if (category) { sql += ` AND category=?`; params.push(category); }
  if (search) { sql += ` AND (name LIKE ? OR sku LIKE ? OR brand LIKE ?)`; const s = `%${search}%`; params.push(s, s, s); }
  sql += ` ORDER BY category, name`;
  const result = db.exec(sql, params);
  res.json(rowsToObjects(result));
});

app.get("/api/products/categories", async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT DISTINCT category FROM products WHERE active=1 ORDER BY category`);
  const cats = (result[0]?.values || []).map((r) => r[0]);
  res.json(cats);
});

// ── ORDERS ──────────────────────────────────────────────────────
app.get("/api/orders", async (req, res) => {
  const db = await getDb();
  const { buyer_id } = req.query;
  let sql = `
    SELECT o.*, u.business_name, u.name as buyer_name
    FROM orders o JOIN users u ON o.buyer_id=u.id
  `;
  const params = [];
  if (buyer_id) { sql += ` WHERE o.buyer_id=?`; params.push(buyer_id); }
  sql += ` ORDER BY o.created_at DESC`;
  const result = db.exec(sql, params);
  res.json(rowsToObjects(result));
});

app.get("/api/orders/:id", async (req, res) => {
  const db = await getDb();
  const orderResult = db.exec(
    `SELECT o.*, u.business_name, u.name as buyer_name, u.phone FROM orders o JOIN users u ON o.buyer_id=u.id WHERE o.id=?`,
    [req.params.id]
  );
  const orders = rowsToObjects(orderResult);
  if (!orders.length) return res.status(404).json({ error: "Order not found" });

  const itemsResult = db.exec(
    `SELECT oi.*, p.name as product_name, p.sku, p.unit FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=?`,
    [req.params.id]
  );
  const order = orders[0];
  order.items = rowsToObjects(itemsResult);
  res.json(order);
});

app.post("/api/orders", async (req, res) => {
  const { buyer_id, items, notes } = req.body;
  if (!buyer_id || !items?.length) return res.status(400).json({ error: "buyer_id and items required" });

  const db = await getDb();

  // Check buyer is whitelisted
  const buyerCheck = db.exec(`SELECT id FROM users WHERE id=? AND whitelisted=1`, [buyer_id]);
  if (!rowsToObjects(buyerCheck).length) return res.status(403).json({ error: "Not authorised" });

  let total = 0;
  const enrichedItems = [];

  for (const item of items) {
    const prodResult = db.exec(`SELECT * FROM products WHERE id=? AND active=1`, [item.product_id]);
    const prod = rowsToObjects(prodResult)[0];
    if (!prod) return res.status(400).json({ error: `Product ${item.product_id} not found` });
    if (prod.stock_qty < item.qty) return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });
    const subtotal = prod.price_kes * item.qty;
    total += subtotal;
    enrichedItems.push({ ...item, unit_price: prod.price_kes, subtotal });
  }

  const orderId = uuidv4();
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

  db.run(
    `INSERT INTO orders (id, order_number, buyer_id, status, total_kes, notes) VALUES (?, ?, ?, 'pending', ?, ?)`,
    [orderId, orderNumber, buyer_id, total, notes || null]
  );

  for (const item of enrichedItems) {
    db.run(
      `INSERT INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), orderId, item.product_id, item.qty, item.unit_price, item.subtotal]
    );
    db.run(`UPDATE products SET stock_qty = stock_qty - ? WHERE id=?`, [item.qty, item.product_id]);
  }

  saveDb();

  const newOrder = db.exec(`SELECT * FROM orders WHERE id=?`, [orderId]);
  res.status(201).json(rowsToObjects(newOrder)[0]);
});

app.patch("/api/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "dispatched", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const db = await getDb();
  db.run(`UPDATE orders SET status=? WHERE id=?`, [status, req.params.id]);
  saveDb();
  res.json({ success: true });
});

// ── DASHBOARD STATS ─────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  const db = await getDb();
  const orders = db.exec(`SELECT COUNT(*) as count, SUM(total_kes) as revenue FROM orders WHERE status != 'cancelled'`);
  const pending = db.exec(`SELECT COUNT(*) as count FROM orders WHERE status='pending'`);
  const products = db.exec(`SELECT COUNT(*) as count FROM products WHERE active=1`);
  const lowStock = db.exec(`SELECT COUNT(*) as count FROM products WHERE stock_qty < 20 AND active=1`);

  res.json({
    total_orders: rowsToObjects(orders)[0]?.count || 0,
    total_revenue: rowsToObjects(orders)[0]?.revenue || 0,
    pending_orders: rowsToObjects(pending)[0]?.count || 0,
    total_products: rowsToObjects(products)[0]?.count || 0,
    low_stock_count: rowsToObjects(lowStock)[0]?.count || 0,
  });
});

// ── HELPER ──────────────────────────────────────────────────────
function rowsToObjects(result) {
  if (!result?.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => (obj[col] = row[i]));
    return obj;
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auto Spares KE API running on port ${PORT}`));