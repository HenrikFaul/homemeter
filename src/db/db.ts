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
