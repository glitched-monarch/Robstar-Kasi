require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { query } = require('./pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the SQLite database file
const SQLITE_DB_PATH = path.join(__dirname, 'robstar.sqlite');

// Helper to execute a query on SQLite
function sqliteQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Helper to execute a query on PostgreSQL
async function pgQuery(text, params) {
  return await query(text, params);
}

// Main migration function
async function migrate() {
  console.log('Starting migration process...');

  // 1. Always ensure PostgreSQL schema exists (run schema.sql)
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await pgQuery(schemaSql);
  console.log('PostgreSQL schema ensured.');

  // Check if SQLite database exists for data migration
  if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.log('SQLite database not found. Skipping data migration.');
    return;
  }

  console.log('Starting data migration from SQLite to PostgreSQL...');

  // Open SQLite database
  const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);

  try {
    // 2. Migrate users
    console.log('Migrating users...');
    const users = await sqliteQuery(sqliteDb, 'SELECT * FROM users');
    for (const user of users) {
      // Map SQLite user to PostgreSQL user
      // Note: SQLite stores booleans as 0/1, we need to convert
      const pgUser = {
        id: user.id || uuidv4(), // Ensure we have a UUID
        name: user.name,
        business_name: user.business_name,
        phone: user.phone,
        role: user.role || 'buyer',
        whitelisted: user.whitelisted === 1,
        failed_login_attempts: user.failed_login_attempts || 0,
        locked_until: user.locked_until ? new Date(user.locked_until) : null,
        password_hash: user.password_hash || null, // Will need to set a default or force reset
        created_at: user.created_at ? new Date(user.created_at) : new Date()
      };

      // Insert into PostgreSQL
      await pgQuery(
        `INSERT INTO users (
          id, name, business_name, phone, role, whitelisted,
          failed_login_attempts, locked_until, password_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          pgUser.id,
          pgUser.name,
          pgUser.business_name,
          pgUser.phone,
          pgUser.role,
          pgUser.whitelisted,
          pgUser.failed_login_attempts,
          pgUser.locked_until,
          pgUser.password_hash,
          pgUser.created_at
        ]
      );
    }
    console.log(`Migrated ${users.length} users.`);

    // 3. Migrate products
    console.log('Migrating products...');
    const products = await sqliteQuery(sqliteDb, 'SELECT * FROM products');
    for (const product of products) {
      const pgProduct = {
        id: product.id || uuidv4(),
        sku: product.sku,
        name: product.name,
        category: product.category,
        brand: product.brand,
        unit: product.unit || 'piece',
        price_kes: parseFloat(product.price_kes),
        stock_qty: product.stock_qty,
        min_order_qty: product.min_order_qty || 1,
        active: product.active === 1
      };

      await pgQuery(
        `INSERT INTO products (
          id, sku, name, category, brand, unit, price_kes, stock_qty, min_order_qty, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          pgProduct.id,
          pgProduct.sku,
          pgProduct.name,
          pgProduct.category,
          pgProduct.brand,
          pgProduct.unit,
          pgProduct.price_kes,
          pgProduct.stock_qty,
          pgProduct.min_order_qty,
          pgProduct.active
        ]
      );
    }
    console.log(`Migrated ${products.length} products.`);

    // 4. Migrate orders
    console.log('Migrating orders...');
    const orders = await sqliteQuery(sqliteDb, 'SELECT * FROM orders');
    for (const order of orders) {
      const pgOrder = {
        id: order.id || uuidv4(),
        order_number: order.order_number || `ORD-${Date.now().toString().slice(-6)}`,
        buyer_id: order.buyer_id,
        status: order.status || 'pending',
        total_kes: parseFloat(order.total_kes),
        notes: order.notes,
        created_at: order.created_at ? new Date(order.created_at) : new Date()
      };

      await pgQuery(
        `INSERT INTO orders (
          id, order_number, buyer_id, status, total_kes, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING`,
        [
          pgOrder.id,
          pgOrder.order_number,
          pgOrder.buyer_id,
          pgOrder.status,
          pgOrder.total_kes,
          pgOrder.notes,
          pgOrder.created_at
        ]
      );
    }
    console.log(`Migrated ${orders.length} orders.`);

    // 5. Migrate order_items
    console.log('Migrating order_items...');
    const orderItems = await sqliteQuery(sqliteDb, 'SELECT * FROM order_items');
    for (const item of orderItems) {
      const pgItem = {
        id: item.id || uuidv4(),
        order_id: item.order_id,
        product_id: item.product_id,
        qty: item.qty,
        unit_price_kes: parseFloat(item.unit_price_kes),
        subtotal_kes: parseFloat(item.subtotal_kes)
      };

      await pgQuery(
        `INSERT INTO order_items (
          id, order_id, product_id, qty, unit_price_kes, subtotal_kes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING`,
        [
          pgItem.id,
          pgItem.order_id,
          pgItem.product_id,
          pgItem.qty,
          pgItem.unit_price_kes,
          pgItem.subtotal_kes
        ]
      );
    }
    console.log(`Migrated ${orderItems.length} order items.`);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    sqliteDb.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration process finished.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration process failed:', err);
      process.exit(1);
    });
}

module.exports = { migrate };