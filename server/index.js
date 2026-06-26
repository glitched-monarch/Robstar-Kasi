require('dotenv').config();
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { query } = require("./db/pg");
const { v4: uuidv4 } = require("uuid");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { requireAuth, requireAdmin, requireBuyer } = require("./middleware/auth");
const { handleValidationErrors } = require("./validation/validations");
const { body } = require('express-validator');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Adjust as needed
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Session setup
app.use(session({
  store: new pgSession({
    pool: /* eslint-disable-next-line */ require('./db/pg').pool, // Use the same pool
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    sameSite: 'lax', // or 'strict' if same-site
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth')); // Auth routes

/* ── HELPER ──────────────────────────────────────── */
function rowsToObjects(result) {
  return result?.rows || [];
}

/* ── USERS ───────────────────────────────────────── */
// Only admins can view all users
app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await query(`SELECT id, name, business_name, phone, role, whitelisted, created_at FROM users ORDER BY business_name`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint is deprecated - use /api/auth/login
app.post("/api/users/login", (req, res) => {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/auth/login instead.' });
});

/* ── PRODUCTS ────────────────────────────────────── */
// Product listing is public (no authentication required for browsing)
// But we'll add authentication if we want to track who views products? Not required.
// We'll keep it public for now.
app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT id, sku, name, category, brand, unit, price_kes, stock_qty, min_order_qty, active FROM products WHERE active=true`;
    const params = [];
    if (category) {
      sql += ` AND category=$${params.length + 1}`;
      params.push(category);
    }
    if (search) {
      const searchTerm = `%${search}%`;
      sql += ` AND (name LIKE $${params.length + 1} OR sku LIKE $${params.length + 2} OR brand LIKE $${params.length + 3})`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    sql += ` ORDER BY category, name`;
    const result = await query(sql, params);
    res.json(rowsToObjects(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/categories", async (req, res) => {
  try {
    const result = await query(`SELECT DISTINCT category FROM products WHERE active=1 ORDER BY category`);
    const cats = result.rows.map(r => r.category);
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── ORDERS ──────────────────────────────────────── */
// Buyers can view their own orders, admins can view all orders
app.get("/api/orders", requireAuth, async (req, res) => {
  try {
    let sql = `
      SELECT o.*, u.business_name, u.name as buyer_name
      FROM orders o JOIN users u ON o.buyer_id=u.id
    `;
    const params = [];

    // If user is buyer, only show their orders
    // If user is admin, they can optionally filter by buyer_id via query
    if (req.user.role === 'buyer') {
      sql += ` WHERE o.buyer_id=$${params.length + 1}`;
      params.push(req.user.id);
    } else if (req.user.role === 'admin') {
      // Admin can filter by buyer_id if provided
      if (req.query.buyer_id) {
        sql += ` WHERE o.buyer_id=$${params.length + 1}`;
        params.push(req.query.buyer_id);
      }
      // If no buyer_id provided, admin sees all orders (no WHERE clause added)
    }

    sql += ` ORDER BY o.created_at DESC`;
    const result = await query(sql, params);
    res.json(rowsToObjects(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buyers can view their own orders, admins can view any order
app.get("/api/orders/:id", requireAuth, async (req, res) => {
  try {
    const orderResult = await query(
      `SELECT o.*, u.business_name, u.name as buyer_name, u.phone
       FROM orders o JOIN users u ON o.buyer_id=u.id WHERE o.id=$1`,
      [req.params.id]
    );
    const orders = rowsToObjects(orderResult);
    if (!orders.length) return res.status(404).json({ error: "Order not found" });

    // Check if the order belongs to the current user (unless admin)
    const order = orders[0];
    if (req.user.role === 'buyer' && order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const itemsResult = await query(
      `SELECT oi.*, p.name as product_name, p.sku, p.unit
       FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=$1`,
      [req.params.id]
    );
    order.items = rowsToObjects(itemsResult);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validation middleware for order placement
const validateOrderPlacement = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.product_id')
    .isUUID()
    .withMessage('Each item must have a valid product ID'),
  body('items.*.qty')
    .isInt({ gt: 0 })
    .withMessage('Each item quantity must be a positive integer'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  handleValidationErrors
];

// Buyers can place orders (using their own ID from session)
app.post("/api/orders", requireAuth, requireBuyer, validateOrderPlacement, async (req, res) => {
  try {
    const { items, notes } = req.body;

    const buyerId = req.user.id;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validate buyer is whitelisted
      const buyerCheck = await client.query(
        'SELECT id, whitelisted FROM users WHERE id=$1',
        [buyerId]
      );
      if (buyerCheck.rowCount === 0 || !buyerCheck.rows[0].whitelisted) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Not authorised' });
      }

      let total = 0;
      const enrichedItems = [];

      for (const item of items) {
        // Validate product exists and is active
        const prodResult = await client.query(
          'SELECT id, name, price_kes, stock_qty FROM products WHERE id=$1 AND active=true',
          [item.product_id]
        );
        if (prodResult.rowCount === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Product ${item.product_id} not found` });
        }
        const prod = prodResult.rows[0];

        // Check stock
        if (prod.stock_qty < item.qty) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });
        }

        const subtotal = prod.price_kes * item.qty;
        total += subtotal;
        enrichedItems.push({ ...item, unit_price: prod.price_kes, subtotal });
      }

      const orderId = uuidv4();
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // Insert order
      await client.query(
        `INSERT INTO orders (id, order_number, buyer_id, status, total_kes, notes)
         VALUES ($1, $2, $3, 'pending', $4, $5)`,
        [orderId, orderNumber, buyerId, total, notes || null]
      );

      // Insert order items and update stock
      for (const item of enrichedItems) {
        const itemId = uuidv4();
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [itemId, orderId, item.product_id, item.qty, item.unit_price, item.subtotal]
        );

        // Update product stock
        await client.query(
          `UPDATE products SET stock_qty = stock_qty - $1 WHERE id=$2`,
          [item.qty, item.product_id]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ id: orderId, order_number: orderNumber, buyer_id: buyerId, status: 'pending', total_kes: total, notes });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Only admins can update order status
app.patch("/api/orders/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "dispatched", "delivered", "cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status" });
    await query(`UPDATE orders SET status=$1 WHERE id=$2`, [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── STATS ───────────────────────────────────────── */
// Only admins can view stats
app.get("/api/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const ordersResult = await query(`SELECT COUNT(*) as count, SUM(total_kes) as revenue FROM orders WHERE status != 'cancelled'`);
    const pendingResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status='pending'`);
    const productsResult = await query(`SELECT COUNT(*) as count FROM products WHERE active=true`);
    const lowStockResult = await query(`SELECT COUNT(*) as count FROM products WHERE stock_qty < 20 AND active=true`);

    res.json({
      total_orders:    ordersResult[0]?.count   || 0,
      total_revenue:   ordersResult[0]?.revenue || 0,
      pending_orders:  pendingResult[0]?.count  || 0,
      total_products:  productsResult[0]?.count || 0,
      low_stock_count: lowStockResult[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── START ───────────────────────────────────────── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🔧 Robstar Kasi API running → http://localhost:${PORT}`)
);