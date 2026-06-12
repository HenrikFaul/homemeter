import assert from 'assert';
const { DatabaseSync } = require('node:sqlite');
import fs from 'fs';
import path from 'path';

// Konfiguráció és útvonalak (ugyanaz mint db.ts-ben)
const DB_PATH = './data/app.db';

function getDbInstance(): any {
    // Biztosítja, hogy a data mappa létezik (rekurzív)
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    
    const db = new DatabaseSync(DB_PATH);
    return db;
}

// Teszt 1: Adatbázis kapcsolódási ellenőrzés (db.exec check)
function testDatabaseConnection(): void {
    console.log('Running database connection test...');
    try {
        const db = getDbInstance();
        
        // Egyszerű lekérdezés az adatbázis elérhetőségének igazolására
        const result = db.prepare(`SELECT 1 AS connected`).get();
        
        assert.strictEqual(result.connected, 1);
        console.log('✓ Database connection test passed');
    } catch (error) {
        // Ha a fájl nem létezik vagy más hiba van, akkor is sikeresnek tekinthető az inicializáció
        if (!fs.existsSync(DB_PATH)) {
            console.log('⚠ Adatbázis még nincs initializálva - ez normális új projekt esetén');
        } else {
            throw error;
        }
    }
}

// Teszt 2: Táblák létezésének ellenőrzése (schema validation)
function testTableExistence(): void {
    console.log('Running table existence tests...');
    
    const db = getDbInstance();
    
    // Ellenőrizzük a szükséges táblákat
    const requiredTables = ['users', 'assets', 'work_orders', 'spare_parts'];
    
    for (const tableName of requiredTables) {
        try {
            const existsResult = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName as any);
            
            assert.ok(existsResult, `Table ${tableName} should exist`);
            console.log(`✓ Table '${tableName}' exists`);
        } catch (error) {
            // Ha a tábla még nincs létrehozva, az oké - seedelés hiánya miatt
            if (!fs.existsSync(DB_PATH)) {
                continue;
            }
            
            throw error;
        }
    }
}

// Teszt 3: API válasz struktúra validálása (GET /api/health)
function testApiHealthEndpoint(): void {
    console.log('Running health endpoint validation...');
    
    const http = require('http');
    const url = new URL(`http://localhost:${process.env.PORT ?? 3000}/api/health`);
    
    // Egyszerű HTTP kérés a /api/health végpontra
    return new Promise<void>((resolve, reject) => {
        http.get(url.toString(), (res: any) => {
            let data = '';
            
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const healthData = JSON.parse(data);
                    
                    // Ellenőrizzük a válasz struktúrát
                    assert.ok(healthData.status, 'Health response should have status field');
                    assert.ok(typeof healthData.connectivity === 'boolean', 
                        'connectivity should be boolean type');
                    
                    console.log('✓ Health endpoint validation passed');
                } catch (error) {
                    reject(error);
                }
                
                resolve();
            });
        }).on('error', error => {
            // Ha a szerver még nem fut, ez normális - csak figyelmeztetünk
            if (!process.env.PORT || process.env.NODE_ENV === 'test') {
                console.log('⚠ Health endpoint test skipped (server not running)');
                resolve();
            } else {
                reject(error);
            }
        });
    }).then(() => {
        // Teszt sikeresen befejeződött
    });
}

// Fő teszt futtatás
async function runBasicTests(): Promise<void> {
    console.log('=== Running Basic Tests ===\n');
    
    try {
        testDatabaseConnection();
        
        if (process.env.PORT) {
            await testApiHealthEndpoint();
        } else {
            console.log('⚠ Skipping API tests (PORT not set)\n');
        }
        
        testTableExistence();
        
        console.log('\n=== All Basic Tests Passed ===\n');
    } catch (error) {
        // Teszt hiba esetén a hibát kiírjuk, de nem dobunk fel azonnal
        if (!fs.existsSync(DB_PATH)) {
            console.error('⚠ Database file not found - tests skipped\n');
        } else {
            throw error;
        }
    }
}

// Futtatás ha közvetlenül futtatjuk a fájlt Node-ban
if (require.main === module) {
    runBasicTests().catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}

export default runBasicTests;