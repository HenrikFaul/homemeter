-- src/db/schema.sql
-- SQLite Schema Definition for Industrial Maintenance Command Center
-- Constraints: INTEGER PRIMARY KEY AUTOINCREMENT, Standard SQLite datetime() usage only.
-- No MySQL functions (INTERVAL/NOW()) allowed per stack rules.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('operator', 'technician', 'supervisor', 'planner')) DEFAULT 'operator' NOT NULL,
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT datetime('now')
);

CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- e.g., 'pump', 'conveyor', 'motor'
    location TEXT NOT NULL, -- Machine ID or physical zone code
    criticality INTEGER CHECK(criticality BETWEEN 1 AND 5) DEFAULT 3, -- 1=Low to 5=Critical
    status TEXT CHECK(status IN ('running', 'stopped', 'maintenance', 'offline')) DEFAULT 'running' NOT NULL,
    last_maintenance_date DATETIME DEFAULT datetime('now'),
    next_due_date DATETIME DEFAULT (datetime('now','+1 day')), -- Per stack rule: default +1 day logic for scheduling triggers
    sensor_health_status TEXT CHECK(sensor_health_status IN ('healthy', 'degraded', 'critical')) DEFAULT 'healthy' NOT NULL,
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT (datetime('now','+1 day')), -- Per stack rule: default +1 day logic for scheduling triggers
    notes TEXT
);

CREATE TABLE IF NOT EXISTS spare_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK(stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 5 CHECK(min_stock_level > 0),
    reorder_point INTEGER DEFAULT 10 CHECK(reorder_point > 0),
    lead_time_days INTEGER DEFAULT 7 CHECK(lead_time_days > 0),
    unit_cost REAL DEFAULT 0.0, -- Stored as decimal string in app logic usually, but SQLite handles float/real loosely; use TEXT for precision if needed or REAL here per standard practice unless strict currency required. Using REAL for simplicity matching interface expectations.
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT (datetime('now','+1 day')) -- Per stack rule: default +1 day logic
);

CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    user_assigned_id INTEGER REFERENCES users(id), -- Can be null for unassigned or public tasks
    status TEXT CHECK(status IN ('open', 'in_progress', 'pending_approval', 'closed')) DEFAULT 'open' NOT NULL,
    priority INTEGER CHECK(priority BETWEEN 1 AND 5) DEFAULT 2, -- Matches criticality logic in app
    sla_deadline DATETIME DEFAULT (datetime('now','+1 day')), -- Per stack rule: default +1 day logic for SLA triggers
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT (datetime('now','+1 day')) -- Per stack rule: default +1 day logic
);

CREATE TABLE IF NOT EXISTS work_order_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    author_user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT datetime('now')
);

-- Indexes for performance on common query patterns (dashboard filtering)
CREATE INDEX IF NOT EXISTS idx_assets_status_location ON assets(status, location);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_priority ON work_orders(asset_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
