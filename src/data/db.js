const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "autospares.sqlite");

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    initSchema();
    saveDb();
  }

  return db;
}

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'buyer',
      whitelisted INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT,
      unit TEXT NOT NULL DEFAULT 'piece',
      price_kes REAL NOT NULL,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      min_order_qty INTEGER NOT NULL DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      buyer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_kes REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(buyer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price_kes REAL NOT NULL,
      subtotal_kes REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  seedData();
}

function seedData() {
  const { v4: uuidv4 } = require("uuid");

  // Seed users
  const users = [
    { id: uuidv4(), name: "James Mwangi", business: "Westlands Auto Garage", phone: "0722100001", role: "buyer" },
    { id: uuidv4(), name: "Fatuma Hassan", business: "Kirinyaga Spares Ltd", phone: "0733200002", role: "buyer" },
    { id: uuidv4(), name: "Peter Kamau", business: "Industrial Area Motors", phone: "0711300003", role: "buyer" },
    { id: uuidv4(), name: "Admin User", business: "Auto Spares KE HQ", phone: "0700000000", role: "admin" },
  ];

  users.forEach((u) => {
    db.run(
      `INSERT OR IGNORE INTO users (id, name, business_name, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [u.id, u.name, u.business, u.phone, u.role]
    );
  });

  // Seed products
  const products = [
    { id: uuidv4(), sku: "ENG-OIL-001", name: "Engine Oil 5W-30 (4L)", category: "Lubricants", brand: "Total", unit: "can", price: 1850, stock: 240 },
    { id: uuidv4(), sku: "FIL-OIL-002", name: "Oil Filter - Toyota", category: "Filters", brand: "Denso", unit: "piece", price: 420, stock: 380 },
    { id: uuidv4(), sku: "FIL-AIR-003", name: "Air Filter - Nissan Hardbody", category: "Filters", brand: "K&N", unit: "piece", price: 680, stock: 95 },
    { id: uuidv4(), sku: "BRK-PAD-004", name: "Brake Pads Front - Toyota Hilux", category: "Brakes", brand: "Brembo", unit: "set", price: 3200, stock: 60 },
    { id: uuidv4(), sku: "BRK-DSC-005", name: "Brake Disc - Toyota Hilux", category: "Brakes", brand: "DBA", unit: "pair", price: 7500, stock: 24 },
    { id: uuidv4(), sku: "ELC-BAT-006", name: "Car Battery 65Ah (NS70)", category: "Electrical", brand: "Chloride Exide", unit: "piece", price: 11500, stock: 42 },
    { id: uuidv4(), sku: "SUS-SHK-007", name: "Shock Absorber Front - Isuzu", category: "Suspension", brand: "KYB", unit: "piece", price: 4800, stock: 30 },
    { id: uuidv4(), sku: "ENG-SPK-008", name: "Spark Plugs - Iridium (set of 4)", category: "Engine", brand: "NGK", unit: "set", price: 2200, stock: 110 },
    { id: uuidv4(), sku: "COO-RAD-009", name: "Radiator - Mitsubishi L200", category: "Cooling", brand: "Koyo", unit: "piece", price: 14200, stock: 12 },
    { id: uuidv4(), sku: "TRS-CLT-010", name: "Clutch Kit - Nissan", category: "Transmission", brand: "LuK", unit: "kit", price: 18500, stock: 18 },
    { id: uuidv4(), sku: "STR-TIE-011", name: "Tie Rod End - Toyota Land Cruiser", category: "Steering", brand: "Moog", unit: "piece", price: 2800, stock: 55 },
    { id: uuidv4(), sku: "ENG-TBL-012", name: "Timing Belt Kit - Honda", category: "Engine", brand: "Gates", unit: "kit", price: 6400, stock: 28 },
  ];

  products.forEach((p) => {
    db.run(
      `INSERT OR IGNORE INTO products (id, sku, name, category, brand, unit, price_kes, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.sku, p.name, p.category, p.brand, p.unit, p.price, p.stock]
    );
  });

  // Seed 2 sample orders
  const buyerResult = db.exec(`SELECT id FROM users WHERE role='buyer' LIMIT 2`);
  const buyers = buyerResult[0]?.values || [];

  if (buyers.length >= 1) {
    const orderId1 = uuidv4();
    const itemId1 = uuidv4();
    const itemId2 = uuidv4();
    db.run(
      `INSERT OR IGNORE INTO orders (id, order_number, buyer_id, status, total_kes) VALUES (?, ?, ?, ?, ?)`,
      [orderId1, "ORD-2024-001", buyers[0][0], "confirmed", 5270]
    );
    db.run(
      `INSERT OR IGNORE INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes) VALUES (?, ?, (SELECT id FROM products WHERE sku='ENG-OIL-001'), ?, ?, ?)`,
      [itemId1, orderId1, 2, 1850, 3700]
    );
    db.run(
      `INSERT OR IGNORE INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes) VALUES (?, ?, (SELECT id FROM products WHERE sku='FIL-OIL-002'), ?, ?, ?)`,
      [itemId2, orderId1, 2, 420, 840]
    );
  }
}

module.exports = { getDb, saveDb };