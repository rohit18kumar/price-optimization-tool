-- Run with: psql -h localhost -U rohitkumar -d bcg -f database_setup.sql
-- Uses existing database 'bcg'

-- Drop tables if they exist (optional - comment out to preserve data)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'buyer', 'supplier')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Products Table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock_available INTEGER DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    customer_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (customer_rating >= 0 AND customer_rating <= 5),
    demand_forecast INTEGER DEFAULT 0,
    forecast_method VARCHAR(20) DEFAULT 'estimated',
    optimized_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- Create Indexes for Performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_rating ON products(customer_rating);
CREATE INDEX idx_products_stock ON products(stock_available);
CREATE INDEX idx_users_email ON users(email);

-- Insert Sample Data
INSERT INTO products (name, category, cost_price, selling_price, description, stock_available, units_sold, customer_rating, demand_forecast, optimized_price) VALUES
('Geo - Note Pad', 'Stationary', 1.2, 2.7, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 121243, 131244, 4.2, 2500, 2.9),
('Jazz - Sticky Notes', 'Stationary', 2.5, 3.3, 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 21200, 65321, 4.5, 1800, 3.5),
('Premium Notebook', 'Stationary', 3.0, 5.0, 'High quality notebook with premium paper.', 5000, 2500, 4.8, 1200, 5.2),
('Basic Pen Set', 'Stationary', 0.5, 1.5, 'Set of 5 basic ballpoint pens.', 15000, 8500, 3.9, 3000, 1.8),
('Highlighter Pack', 'Stationary', 1.8, 3.2, 'Pack of 4 different colored highlighters.', 8000, 4200, 4.1, 2200, 3.4);

-- Default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6yKUpNXe/C', 'admin', 'Admin', 'User');