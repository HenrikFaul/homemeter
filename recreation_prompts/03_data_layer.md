# 03_data_layer — generátor prompt

Hozd létre PONTOSAN az alábbi fájlokat a(z) TypeScript / Node (Express + SQLite adatbázis + statikus frontend) projektben. A tartalom a source-of-truth — karakterre pontosan ezt add vissza, kivéve ha a master kontextus kifejezetten módosítást kér.

## FILE: src/db/schema.sql
Cél: Contains SQL DDL statements defining tables for assets, work_orders, spare_parts, users with SQLite syntax constraints like INTEGER PRIMARY KEY AUTOINCREMENT.

```
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

```

## FILE: src/db/db.ts
Cél: Initializes DatabaseSync instance using node:sqlite module, creates data directory recursively, executes schema creation via raw strings to avoid file reading logic errors.

```
const { DatabaseSync } = require('node:sqlite');
import fs from 'fs';
import path from 'path';

// Konfiguráció és útvonalak
const DB_PATH = './data/app.db';

// Biztosítja, hogy a data mappa létezik (rekurzív)
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Adatbázis inicializálása
const db = new DatabaseSync(DB_PATH);

// Séma létrehozása közvetlen SQL stringekkel (NE fájlból olvasd)
db.exec(`PRAGMA foreign_keys = ON;`);

// Felhasználók tábla
db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('operator', 'technician', 'supervisor', 'planner')) DEFAULT 'operator' NOT NULL,
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT datetime('now')
);`);

// Eszközök tábla (assets) - kiegészítve a hiányzó részekkel az eredeti snippet alapján
db.exec(`CREATE TABLE IF NOT EXISTS assets (
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
    updated_at DATETIME DEFAULT datetime('now')
);`);

// Hibajegyek tábla (work_orders) - kiegészítve a rendszerhez szükséges mezőkkel
db.exec(`CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES assets(id), -- FK reláció
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open' NOT NULL,
    priority INTEGER CHECK(priority BETWEEN 1 AND 5) DEFAULT 3,
    assigned_to_id INTEGER REFERENCES users(id), -- FK reláció felhasználóhoz (opcionális)
    due_date DATETIME DEFAULT datetime('now','+7 days'),
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT datetime('now')
);`);

// Alkatrész tábla (spare_parts) - kiegészítve a rendszerhez szükséges mezőkkel
db.exec(`CREATE TABLE IF NOT EXISTS spare_parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL, -- e.g., 'Bearing 6205', 'Oil Filter'
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    reorder_point INTEGER CHECK(reorder_point >= 0) DEFAULT 10,
    lead_time_days INTEGER CHECK(lead_time_days > 0) DEFAULT 7, -- Napokban
    unit_price REAL DEFAULT 0.0,
    compatible_asset_ids TEXT, -- JSON string vagy sztring lista kompatibilitásnak (egyszerűsítve: 'asset_id1, asset_id2')
    created_at DATETIME DEFAULT datetime('now'),
    updated_at DATETIME DEFAULT datetime('now')
);`);

// Seedelés ha üres (csak felhasználó tábla ellenőrzése)
const userCountResult = db.prepare(`SELECT COUNT(*) AS cnt FROM users`).get();
if (!userCountResult || Number(userCountResult.cnt ?? 0) === 0) {
    // Admin felhasználó létrehozása seedeléshez, ha nincs még senki (password_hash placeholder)
    const insertUserParams = [
        'admin', 
        '$2b$10$placeholderHashForAdminPasswordChangeMeLaterInProduction' 
    ];
    
    db.prepare(`INSERT INTO users(username, password_hash, role) VALUES (?, ?, ?)`).run(
        ...insertUserParams.map((val: any) => val ?? null), // SOHA ne adj undefined-ot (használd ?? null-t)
        'supervisor' 
    );

    const insertAssetParams = [
        'Pump-Mainline-A', 
        'pump', 
        'Zone-A1-Line02-P04', 
        5, // criticality high for demo seed
        'running', 
        datetime('now'), 
        (datetime('now','+3 days')), 
        'healthy'
    ];

    db.prepare(`INSERT INTO assets(name, type, location, criticality, status, last_maintenance_date, next_due_date, sensor_health_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        ...insertAssetParams.map((val: any) => val ?? null), // SOHA ne adj undefined-ot (használd ?? null-t)
    );

    const insertPartParams = [
        'Oil Filter 10W40', 
        'OIL-FILTER-X500', 
        2, 
        5, 
        7, 
        1.99, 
        'Pump-Mainline-A' // Egyszerűsített kompatibilitás
    ];

    db.prepare(`INSERT INTO spare_parts(name, sku, stock_quantity, reorder_point, lead_time_days, unit_price, compatible_asset_ids) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        ...insertPartParams.map((val: any) => val ?? null), // SOHA ne adj undefined-ot (használd ?? null-t)
    );
}

// Exportálás a végén KÖTELEZŐEN
export default db;

```

## FILE: src/models/Asset.ts
Cél: Defines TypeScript interface for Asset entity including status, location, criticality, and sensor health indicators used across services.

```
// src/models/Asset.ts
/**
 * Defines TypeScript interfaces for Asset entity used across services and routes.
 * Matches database schema in src/db/schema.sql constraints.
 */

export interface Asset {
  id: number;
  name: string;
  type: 'pump' | 'conveyor' | 'motor' | 'compressor'; // Extended based on industrial context if needed, strictly TEXT per DB but constrained by CHECK logic in schema implies specific values or open text. Using union for safety with strict TS while keeping flexibility.
  location: string;
  criticality: number; // 1-5 scale as per database constraint
  status: 'running' | 'stopped' | 'maintenance' | 'offline';
  last_maintenance_date?: string; // ISO Date string or null if not set yet in DB logic (defaults handled by SQL)
  next_due_date?: string; // ISO Date string for SLA tracking
  sensor_health_status: 'healthy' | 'degraded' | 'critical';
}

// Optional helper type for partial asset updates to avoid full object replacement issues, 
// though strict TS usually prefers explicit interfaces. Keeping it simple per "loose typing" stack rule where applicable but maintaining interface integrity here.
export type AssetStatus = Asset['status'];

```

## FILE: src/models/User.ts
Cél: Defines TypeScript interface for User role system covering operator, technician, supervisor roles with permissions flags as per core user roles requirement.

```
// src/models/User.ts
/**
 * Defines TypeScript interfaces for User entity used across services and routes.
 * Matches database schema in src/db/schema.sql constraints exactly to ensure DB consistency.
 */

export interface User {
  id: number; // INTEGER PRIMARY KEY AUTOINCREMENT mapped to Number per stack rules
  username: string; // TEXT UNIQUE NOT NULL
  password_hash: string; // TEXT NOT NULL (never store plain text passwords)
  role: 'operator' | 'technician' | 'supervisor' | 'planner'; // Matches DB CHECK constraint for permissions flags logic
  created_at?: string; // DATETIME DEFAULT datetime('now') stored as ISO String or null if not set in service layer
  updated_at?: string; // DATETIME DEFAULT datetime('now') stored as ISO String or null if not set in service layer
}

// Helper type alias for role validation to avoid repeating the union literal everywhere.
export type UserRole = User['role'];

/**
 * Optional helper type for partial user updates (e.g., updating username without re-hashing password).
 */
export interface PartialUser {
  id?: number; // Usually not updated directly but included in ID tracking if needed by service logic
  username?: string;
  role?: UserRole;
}

/**
 * Helper type for creating a new user input. Excludes sensitive fields like password_hash and auto-generated IDs.
 */
export interface CreateUserInput {
  username: string;
  password_hash: string; // Service layer must handle hashing before passing this to DB logic or validation
  role?: UserRole;
}

/**
 * Helper type for user lookup results that might include derived permission data not stored in DB directly.
 */
export interface UserWithPermissions extends User {
  permissions?: Record<string, boolean>; // Optional object for runtime permission checks if needed beyond Role string
}

```

## FILE: src/models/WorkOrder.ts
Cél: Defines TypeScript interface for Work Order tracking ID, asset linkage, SLA timers, priority logic derived from composite factors like downtime duration.

```
/**
 * Defines TypeScript interfaces for Work Order entity used across services and routes.
 * Matches database schema constraints (INTEGER PRIMARY KEY AUTOINCREMENT, DATETIME).
 */

export interface WorkOrder {
  id: number; // INTEGER PRIMARY KEY AUTOINCREMENT mapped to Number per stack rules
  asset_id: number; // Foreign key reference to assets.id table column
  work_order_number?: string; // Unique identifier text for display (e.g., WO-2024-001)
  description: string; // TEXT NOT NULL describing the issue or task
  status: 'open' | 'closed' | 'in_progress' | 'cancelled'; // Matches operational states logic
  priority: number; // Integer scale derived from composite factors (downtime, criticality), typically 1-5
  sla_deadline?: string; // ISO Date String for SLA tracking or null if not applicable yet
  created_at?: string; // DATETIME DEFAULT datetime('now') stored as ISO String
  updated_at?: string; // DATETIME DEFAULT datetime('now') stored as ISO String
}

/**
 * Helper type alias for partial work order updates to avoid full object replacement issues.
 */
export interface PartialWorkOrder {
  id: number | undefined;
  asset_id?: number;
  description?: string;
  status?: 'open' | 'closed' | 'in_progress' | 'cancelled';
  priority?: number;
}

/**
 * Helper type for creating a new work order input. Excludes sensitive fields like IDs and auto-generated timestamps unless explicitly provided by service layer logic (though usually handled in DB defaults).
 */
export interface CreateWorkOrderInput {
  asset_id: number; // Required to link to an existing asset
  description: string; // Task or issue description required for audit trail
  priority?: number; // Optional override of default calculated priority, if service logic allows manual input
}

/**
 * Helper type representing the result structure returned by database queries (e.g., db.prepare(...).all()).
 */
export interface WorkOrderRow extends WorkOrder {
  _sql_changes: any[] | null; // Placeholder for internal DB metadata if needed in specific contexts, usually ignored at TS level but kept for schema alignment.
}

/**
 * Helper type alias for work order status enum to ensure consistency across UI and API validation.
 */
export type WorkOrderStatus = 'open' | 'closed' | 'in_progress' | 'cancelled';

```

## FILE: src/models/SparePart.ts
Cél: Defines TypeScript interface for Spare Parts inventory including stock levels, reorder points, lead times, and compatibility data linked to assets.

```
/**
 * Defines TypeScript interfaces for Spare Part entity used across services and routes.
 * Matches database schema constraints for spare parts inventory management in src/db/schema.sql logic.
 */

export interface SparePart {
  id: number; // INTEGER PRIMARY KEY AUTOINCREMENT mapped to Number per stack rules
  name: string; // TEXT NOT NULL description of the part
  sku: string; // Unique Stock Keeping Unit identifier (TEXT UNIQUE)
  stock_level: number; // Current integer count in inventory
  min_stock: number; // Reorder point threshold for triggering alerts or orders
  lead_time_days: number; // Estimated days to receive new stock after order placement
  unit_of_measure?: string; // e.g., 'piece', 'kg', 'liter' (TEXT), optional if generic counting used
}

/**
 * Helper type alias for partial spare part updates. Used in service layers to avoid 
 * full object replacement issues when updating specific fields like stock_level or status logic.
 */
export interface PartialSparePart {
  id: number | undefined; // Usually not updated directly but included if needed by ID tracking
  name?: string;
  sku?: string;
  stock_level?: number;
  min_stock?: number;
  lead_time_days?: number;
}

/**
 * Helper type for creating a new spare part input. Excludes sensitive fields like IDs 
 * and auto-generated timestamps unless explicitly handled by service layer logic (e.g., audit).
 */
export interface CreateSparePartInput {
  name: string;
  sku: string;
  stock_level?: number; // Optional if defaulting to 0 or specific seed value in DB init
  min_stock?: number;
  lead_time_days?: number;
}

/**
 * Helper type representing a spare part linked to an asset (compatibility data). 
 * This is often used in queries joining parts and assets. While the DB schema might handle FKs differently,
 * this interface helps services express relationships clearly before mapping back to raw rows.
 */
export interface SparePartWithAssetLink {
  id: number;
  name: string;
  sku: string;
  stock_level: number;
  min_stock: number;
  lead_time_days: number;
  unit_of_measure?: string;
  location_zone?: string; // Physical storage zone code if applicable, optional TEXT
  asset_id?: number | null; // Optional FK reference to assets.id table column if tracked in this view
}

/**
 * Helper type for spare part status or state flags, often used alongside the main entity.
 */
export interface SparePartStatus {
  is_critical: boolean; // Boolean flag derived from stock_level vs min_stock logic (0/1 stored as integer usually)
  needs_reorder: boolean; // Derived boolean based on lead time and current level
}

/**
 * Helper type alias for spare part status flags to avoid repeating the union literal everywhere.
 */
export type SparePartStatusFlags = 'in_stock' | 'low_stock' | 'out_of_stock';

```
