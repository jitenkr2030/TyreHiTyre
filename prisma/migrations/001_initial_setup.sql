-- Create PostgreSQL database schema for TyreHiTyre
-- This file will be used for database setup

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tyres_brand ON tyres(brand);
CREATE INDEX IF NOT EXISTS idx_tyres_type ON tyres(type);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);