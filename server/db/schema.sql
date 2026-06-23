-- Drop tables if they exist (for fresh starts, be careful in production)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions; -- For connect-pg-simple

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'buyer',
    whitelisted BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    unit TEXT NOT NULL DEFAULT 'piece',
    price_kes DECIMAL(10,2) NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    min_order_qty INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    buyer_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total_kes DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    qty INTEGER NOT NULL,
    unit_price_kes DECIMAL(10,2) NOT NULL,
    subtotal_kes DECIMAL(12,2) NOT NULL
);

-- Sessions table for connect-pg-simple
CREATE TABLE sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IDX_sessions_expire ON sessions(expire);