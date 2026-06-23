require('dotenv').config();
const { query } = require('./pg');
const { hashPassword } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  try {
    console.log('Seeding database with demo data...');

    // Clear existing data (in reverse order of foreign key dependencies)
    await query('DELETE FROM order_items');
    await query('DELETE FROM orders');
    await query('DELETE FROM products');
    await query('DELETE FROM users');

    // Reset sequences if using SERIAL (not needed for UUID)

    // Create demo users
    const users = [
      { id: uuidv4(), name: "James Mwangi", business_name: "Westlands Auto Garage", phone: "0722100001", role: "buyer", password: "buyer123" },
      { id: uuidv4(), name: "Fatuma Hassan", business_name: "Kirinyaga Spares Ltd", phone: "0733200002", role: "buyer", password: "buyer123" },
      { id: uuidv4(), name: "Peter Kamau", business_name: "Industrial Area Motors", phone: "0711300003", role: "buyer", password: "buyer123" },
      { id: uuidv4(), name: "Admin User", business_name: "Robstar Kasi HQ", phone: "0700000000", role: "admin", password: "admin123" }
    ];

    for (const user of users) {
      const passwordHash = await hashPassword(user.password);
      await query(
        `INSERT INTO users (id, name, business_name, phone, role, password_hash, whitelisted, failed_login_attempts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, user.name, user.business_name, user.phone, user.role, passwordHash, true, 0]
      );
    }
    console.log(`Created ${users.length} demo users`);

    // Create demo products (same as original prototype)
    const products = [
      { id: uuidv4(), sku: "ENG-OIL-001", name: "Engine Oil 5W-30 (4L)", category: "Lubricants", brand: "Total", unit: "can", price: 1850, stock: 240 },
      { id: uuidv4(), sku: "FIL-OIL-002", name: "Oil Filter — Toyota", category: "Filters", brand: "Denso", unit: "piece", price: 420, stock: 380 },
      { id: uuidv4(), sku: "FIL-AIR-003", name: "Air Filter — Nissan Hardbody", category: "Filters", brand: "K&N", unit: "piece", price: 680, stock: 95 },
      { id: uuidv4(), sku: "BRK-PAD-004", name: "Brake Pads Front — Toyota Hilux", category: "Brakes", brand: "Brembo", unit: "set", price: 3200, stock: 60 },
      { id: uuidv4(), sku: "BRK-DSC-005", name: "Brake Disc — Toyota Hilux", category: "Brakes", brand: "DBA", unit: "pair", price: 7500, stock: 24 },
      { id: uuidv4(), sku: "ELC-BAT-006", name: "Car Battery 65Ah (NS70)", category: "Electrical", brand: "Chloride Exide", unit: "piece", price: 11500, stock: 42 },
      { id: uuidv4(), sku: "SUS-SHK-007", name: "Shock Absorber Front — Isuzu", category: "Suspension", brand: "KYB", unit: "piece", price: 4800, stock: 30 },
      { id: uuidv4(), sku: "ENG-SPK-008", name: "Spark Plugs Iridium (set of 4)", category: "Engine", brand: "NGK", unit: "set", price: 2200, stock: 110 },
      { id: uuidv4(), sku: "COO-RAD-009", name: "Radiator — Mitsubishi L200", category: "Cooling", brand: "Koyo", unit: "piece", price: 14200, stock: 12 },
      { id: uuidv4(), sku: "TRS-CLT-010", name: "Clutch Kit — Nissan", category: "Transmission", brand: "LuK", unit: "kit", price: 18500, stock: 18 },
      { id: uuidv4(), sku: "STR-TIE-011", name: "Tie Rod End — Land Cruiser", category: "Steering", brand: "Moog", unit: "piece", price: 2800, stock: 55 },
      { id: uuidv4(), sku: "ENG-TBL-012", name: "Timing Belt Kit — Honda", category: "Engine", brand: "Gates", unit: "kit", price: 6400, stock: 28 }
    ];

    for (const product of products) {
      await query(
        `INSERT INTO products (id, sku, name, category, brand, unit, price_kes, stock_qty, min_order_qty, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [product.id, product.sku, product.name, product.category, product.brand, product.unit, product.price, product.stock, 1, true]
      );
    }
    console.log(`Created ${products.length} demo products`);

    // Create demo orders (using first two buyers)
    const buyerIds = [users[0].id, users[1].id]; // James and Fatuma

    // Order 1 for James
    const orderId1 = uuidv4();
    await query(
      `INSERT INTO orders (id, order_number, buyer_id, status, total_kes, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId1, "ORD-2024-001", buyerIds[0], "confirmed", 5270, "Deliver to gate 4"]
    );

    // Order items for order 1
    await query(
      `INSERT INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(), orderId1,
        (await query('SELECT id FROM products WHERE sku = $1', ['ENG-OIL-001'])).rows[0].id,
        2, 1850, 3700
      ]
    );

    await query(
      `INSERT INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(), orderId1,
        (await query('SELECT id FROM products WHERE sku = $1', ['FIL-OIL-002'])).rows[0].id,
        2, 420, 840
      ]
    );

    // Order 2 for Fatuma
    const orderId2 = uuidv4();
    await query(
      `INSERT INTO orders (id, order_number, buyer_id, status, total_kes, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId2, "ORD-2024-002", buyerIds[1], "pending", 18500, null]
    );

    // Order item for order 2
    await query(
      `INSERT INTO order_items (id, order_id, product_id, qty, unit_price_kes, subtotal_kes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(), orderId2,
        (await query('SELECT id FROM products WHERE sku = $1', ['TRS-CLT-010'])).rows[0].id,
        1, 18500, 18500
      ]
    );

    console.log('Created 2 demo orders');
    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
    throw err;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      process.exit(1);
    });
}

module.exports = { seedDatabase };