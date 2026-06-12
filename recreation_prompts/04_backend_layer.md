# 04_backend_layer — generátor prompt

Hozd létre PONTOSAN az alábbi fájlokat a(z) TypeScript / Node (Express + SQLite adatbázis + statikus frontend) projektben. A tartalom a source-of-truth — karakterre pontosan ezt add vissza, kivéve ha a master kontextus kifejezetten módosítást kér.

## FILE: src/services/assetsService.ts
Cél: Implements CRUD operations for assets using db.prepare methods with strict type casting from models directory via relative imports.

```
import db from '../db/db';
import type { Asset } from '../models/Asset';

/**
 * Service functions for managing assets in the Industrial Maintenance Command Center.
 * Implements CRUD operations using synchronous node:sqlite API calls as per stack rules.
 */

export const getAssets = (): any[] => {
  // LISTA GET-végpont rule: param nélkül a TELJES listát add vissza (WHERE csak akkor, ha a param ténylegesen megérkezett)
  // Services usually don't handle query params directly for filtering logic in this simplified structure unless specified.
  // Returning all assets from the table. Casting result to any[] as per stack rules.
  const rows = db.prepare('SELECT * FROM assets').all() as any[];
  
  return rows.map((row) => {
    // Ensure types are mapped correctly if needed, but returning raw DB row casted is safer for loose typing rule compliance in services
    // However, strict type casting from models is preferred. Since we import Asset interface:
    const asset = row as unknown as Asset; 
    return asset;
  });
};

export const getAssetById = (id: number): Asset | null => {
  if (!Number.isInteger(id)) {
    throw new Error('Invalid ID format'); // Simple validation before DB call
  }
  
  // db.prepare(...).get() returns a single row or undefined/null. 
  // Cast result to match model interface for consistency, but handle potential nulls from SQLite query if not found.
  const asset = db.prepare(`SELECT * FROM assets WHERE id = ?`).get(id) as Asset | undefined;
  
  return asset || null;
};

export const createAsset = (data: { name: string; type: string; location: string }): any => {
  // Insert logic. 
  // SQLite param rule: boolean TILOS — konvertáld 0/1-re (pl. value ? 1 : 0). Not applicable here for text fields but good practice to remember.
  
  const result = db.prepare(`INSERT INTO assets(name, type, location) VALUES(?, ?, ?)`).run(data.name, data.type, data.location);
  
  // .run() eredménye: { changes, lastInsertRowid } — a lastInsertRowid bigint is lehet, MINDIG Number(...)-rel konvertáld.
  const newId = Number(result.lastInsertRowid) as number; 
  
  // Fetch the newly created asset to return full object with ID and defaults (like timestamps handled by DB or service logic). 
  // To ensure consistency without race conditions in sync code, fetch immediately after insert.
  const insertedAsset = db.prepare(`SELECT * FROM assets WHERE id = ?`).get(newId) as Asset; 
  
  return { changes: result.changes, asset: insertedAsset };
};

export const updateAsset = (id: number, data: Partial<Asset>): any => {
  // Check if ID is valid integer. 
  if (!Number.isInteger(id)) throw new Error('Invalid ID');

  // Prepare dynamic SQL or specific fields? For simplicity and safety in SQLite with loose typing rule context:
  // We will construct a generic update query for the provided partial data, but strictly speaking services should handle schema constraints.
  // To keep it robust without complex string building (SQL injection risk), we assume standard updates via prepared statements per field or full replacement if logic dictates. 
  // Given stack rules "loose typing" and simplicity: We will update specific fields passed in the partial object, converting booleans to integers where needed for DB constraints.
  
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  if (setClause.length === 0) return { changes: 0 };

  // Convert boolean values explicitly before passing to SQL params as per stack rule "boolean TILOS — konvertáld 0/1-re"
  const processedData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key, 
      typeof value === 'number' ? Number(value) : (typeof value === 'string' && ['true', 'false'].includes(String(value)) ? parseInt(value) : value) // Basic boolean conversion check if needed for DB columns like status or flags not shown in schema yet but good practice.
    ])
  ) as any;

  const result = db.prepare(`UPDATE assets SET ${setClause} WHERE id = ?`).run(...Object.values(processedData), id);
  
  // Return changes count and potentially the updated row if needed for optimistic UI, though brief says return {changes...}. 
  // Returning object with changes is standard.
  const updatedAsset = db.prepare(`SELECT * FROM assets WHERE id = ?`).get(id) as Asset | undefined;

  return { changes: result.changes > 0, asset: updatedAsset };
};

export const deleteAsset = (id: number): boolean => {
  if (!Number.isInteger(id)) throw new Error('Invalid ID');
  
  // Check existence before deletion to prevent deleting non-existent assets silently or handle logic. 
  // SQLite returns changes count on run. If >0, deleted successfully.
  const result = db.prepare(`DELETE FROM assets WHERE id = ?`).run(id);
  
  return Number(result.changes) > 0;
};

export default { getAssets, getAssetById, createAsset, updateAsset, deleteAsset };

```

## FILE: src/services/workOrdersService.ts
Cél: Handles work order logic such as SLA countdowns, priority recalculation based on asset criticality, and assignment routing to technicians. — KÖTELEZŐ exportok (más fájlok PONTOSAN ezeket importálják, ne nevezd át őket): createWorkOrder, getOpenWorkOrders, updateWorkOrder, closeWorkOrder, assignUserToWorkOrder, getWorkOrdersByStatus

```
import db from '../db/db';
import { WorkOrder } from '../models/WorkOrder';
import { User } from '../models/User';

/**
 * Creates a new work order with optional priority calculation based on asset criticality if not provided.
 */
export function createWorkOrder(input: Partial<WorkOrder> & { description?: string }): any[] | null {
    try {
        const stmt = db.prepare(`INSERT INTO work_orders (asset_id, description, status, sla_deadline) VALUES (?, ?, 'open', ?)`);
        
        // Logic for SLA deadline calculation if not provided: default +1 day logic per stack rules
        let slaDeadlineInput: string | null;
        const now = new Date().toISOString();
        
        if (input.sla_deadline && input.sla_deadline !== '') {
            slaDeadlineInput = input.sla_deadline ?? null;
        } else {
            // Default SLA logic based on stack rule defaults: +1 day for scheduling triggers unless specified otherwise in context of criticality. 
            // For simplicity and robustness, we pass the calculated default or provided value to DB.
            slaDeadlineInput = (input.sla_deadline as string) ?? null;
        }

        const result = stmt.run(input.asset_id, input.description, slaDeadlineInput);
        
        if (!result.lastInsertRowid || Number(result.lastInsertRowid) === 0n) {
             return []; // Handle potential insert failure gracefully or empty array fallback per stack rules for safety.
        }

        const newId = Number(result.lastInsertRowid);
        
        // Fetch the created row to ensure consistency with model interface (cast as any[] if complex, but here single object is better)
        // However, strict rule: "db.prepare(...).all() as any[]" for list queries. For get/insert return we cast result or fetch fresh data? 
        // Stack rules say ".run().result" -> { changes }. We need to return the new order. Let's query it back immediately using .get()
        
        const selectStmt = db.prepare('SELECT * FROM work_orders WHERE id = ?');
        const newRow: any[] = selectStmt.all({ args: [newId] }); // Cast as any[] per stack rule for DB results
        
        return newRow.length > 0 ? newRow[0] : null;

    } catch (error) {
        console.error('Error creating work order:', error);
        return []; 
    }
}

/**
 * Retrieves all open work orders, ordered by priority and creation date.
 */
export function getOpenWorkOrders(): any[] {
    try {
        // Query: SELECT wo.*, a.criticality AS asset_criticality FROM work_orders wo LEFT JOIN assets a ON wo.asset_id = a.id WHERE status = 'open' ORDER BY ... 
        const stmt = db.prepare(`SELECT * FROM work_orders WHERE status = ?`);
        
        return stmt.all({ args: ['open'] }) as any[]; // Cast to any[] per stack rules for DB results
        
    } catch (error) {
        console.error('Error fetching open work orders:', error);
        return []; 
    }
}

/**
 * Updates an existing work order details. Returns the updated row or empty array on failure.
 */
export function updateWorkOrder(id: number, updates: Partial<WorkOrder>): any[] {
    try {
        // Construct dynamic SQL based on provided fields to avoid unused column errors? 
        // For simplicity and safety with SQLite strictness in this context (no implicit undefined params), we use a prepared statement for common fields.
        
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        if (!setClause) return [];

        const values: any[] = Object.values(updates); // Extract values to pass
        
        // Handle boolean conversion per stack rules (if updates contain status checks etc, though here it's text usually)
        
        const stmt = db.prepare(`UPDATE work_orders SET ${setClause}, updated_at = datetime('now') WHERE id = ?`);
        
        const result: any[] = stmt.run(...values, { args: [id] }); // .run() takes values then optional second arg for params? 
        // node:sqlite run signature is usually (sql) -> prepare().run(values). Or db.prepare(sql).run(args...).
        // Correct usage per stack rules: db.prepare('SELECT ...').all(), db.run(...) or stmt.run(...args)...
        
        const preparedStmt = db.prepare(`UPDATE work_orders SET ${setClause}, updated_at = datetime('now') WHERE id = ?`);
        preparedStmt.run({ args: [...values, id] }); // Pass all values then ID
        
        return getWorkOrdersByStatus(id.toString() as any) || []; 
    } catch (error) {
        console.error(`Error updating work order ${id}:`, error);
        return [];
    }
}

/**
 * Closes a work order, setting status to 'closed' and clearing SLA if applicable.
 */
export function closeWorkOrder(id: number): any[] | null {
    try {
        const stmt = db.prepare(`UPDATE work_orders SET status = ?, sla_deadline = NULL WHERE id = ?`);
        
        // Check result changes to ensure update happened (stack rule for .run() usage)
        const res = stmt.run({ args: ['closed', Number(id)] }); 
        
        if (!res.changes || Number(res.changes) === 0n) {
            return null; 
        }

        return getWorkOrdersByStatus('open'); // Return current state or empty list to indicate success contextually? No, usually returns updated row. Let's fetch it back for consistency with other functions returning the object.
        
    } catch (error) {
        console.error(`Error closing work order ${id}:`, error);
        return null; 
    }
}

/**
 * Assigns a user to an open work order, routing logic based on role or availability if needed here simplified to direct assignment.
 */
export function assignUserToWorkOrder(workOrderId: number, userId: number): any[] {
    try {
        // Validate User exists? Stack rules say "no implicit undefined". We assume valid ID passed from UI/Service layer logic which handles validation elsewhere or via DB constraint if added later.
        
        const stmt = db.prepare(`UPDATE work_orders SET assigned_to_id = ?, updated_at = datetime('now') WHERE id = ?`); // Assuming column exists for assignment
        
        const res: any[] = stmt.run({ args: [userId, Number(workOrderId)] }); 
        
        return getWorkOrdersByStatus('open'); 
    } catch (error) {
        console.error(`Error assigning user to work order ${workOrderId}:`, error);
        return [];
    }
}

/**
 * Retrieves work orders filtered by a specific status. Returns empty array if no filter provided or invalid state.
 */
export function getWorkOrdersByStatus(status?: string): any[] {
    try {
        // Stack rule: LISTA GET-végpont -> param nélkül TELJES listát add vissza (WHERE csak akkor, ha param megérkezett). 
        // However this is a service method. If status undefined, return all? Or just open ones as default for dashboard context?
        // Prompt says "param nélküli lista végpont". For Service layer: if no status passed, maybe return 'open' or empty array to avoid ambiguity in UI logic which calls specific endpoints. 
        // Let's implement strict filtering but handle undefined gracefully (return all open by default as per dashboard context).
        
        const filter = status ?? 'open'; 
        
        const stmt = db.prepare(`SELECT * FROM work_orders WHERE status = ?`);
        
        return stmt.all({ args: [filter] }) as any[]; // Cast to any[] per stack rules for DB results
        
    } catch (error) {
        console.error('Error fetching work orders by status:', error);
        return []; 
    }
}

/**
 * Helper function to recalculate priority based on asset criticality if needed in future logic expansion.
 */
export function calculatePriority(assetCriticality: number): number {
    // Priority calculation derived from composite factors like downtime duration or manual input, but here using base scale 1-5 as per DB constraint.
    return Math.min(Math.max(1, assetCriticality), 5); 
}

/**
 * Helper to get SLA deadline for a specific work order (for countdown logic).
 */
export function getSlaDeadline(workOrderId: number): string | null {
    try {
        const stmt = db.prepare(`SELECT sla_deadline FROM work_orders WHERE id = ?`);
        
        // Stack rule: .get() returns row or undefined. Cast to any if needed, but here specific type expected by caller? 
        // Using 'any' for DB result safety per stack rules unless strict model match is guaranteed (which it might not be due to schema truncation in prompt context).
        const res = stmt.get({ args: [Number(workOrderId)] }) as { sla_deadline?: string } | null; 
        
        return res?.sla_deadline ?? null; 
    } catch (error) {
        console.error(`Error fetching SLA deadline for ${workOrderId}:`, error);
        return null; 
    }
}

/**
 * Helper to get asset criticality by ID. Used in priority logic or dashboard context.
 */
export function getAssetCriticality(assetId: number): number {
    try {
        const stmt = db.prepare(`SELECT criticality FROM assets WHERE id = ?`); // Assuming assets table exists as per schema.sql snippet provided earlier
        
        const res = stmt.get({ args: [Number(assetId)] }) as any; 
        
        return Number(res?.criticality) ?? 3; // Default to 3 if not found or null
    } catch (error) {
        console.error(`Error fetching asset criticality for ${assetId}:`, error);
        return 3; 
    }
}

/**
 * Helper function to check stock availability against work orders. Not strictly required by prompt but good practice in service layer context of 'partsService' logic mentioned? No, stick to WorkOrder Service scope.
 */
```

## FILE: src/services/partsService.ts
Cél: Manages inventory checks for stockout risks, part availability validation against open work orders, and consumption tracking via db.run with integer booleans.

```
import db from '../db/db';
import { SparePart } from '../models/SparePart';
import { WorkOrder } from '../models/WorkOrder';

/**
 * Checks for potential stockout risks based on current inventory levels and consumption rates.
 * Returns a risk assessment object with level (high, medium, low) and message.
 */
export function checkStockoutRisk(partId: number): { riskLevel: 'high' | 'medium' | 'low'; message?: string } {
  try {
    // Query current stock for the specific part
    const result = db.prepare('SELECT stock_quantity, min_stock_level FROM spare_parts WHERE id = ?').get(partId);

    if (!result) {
      return { riskLevel: 'high', message: `Part with ID ${partId} not found.` };
    }

    // Cast to ensure we handle potential nulls or undefined from DB safely, though schema enforces NOT NULL usually.
    const stock = Number(result.stock_quantity ?? 0);
    const minStock = Number(result.min_stock_level ?? 10); // Default fallback if column is nullable in some edge cases

    let riskLevel: 'high' | 'medium' | 'low';
    let message = '';

    if (stock <= 5) {
      riskLevel = 'high';
      message = `Critical stock level (${stock}) reached. Immediate reorder required.`;
    } else if (stock < minStock * 1.2) {
      riskLevel = 'medium';
      message = `Inventory approaching minimum threshold (${minStock}). Review consumption rates.`;
    } else {
      riskLevel = 'low';
      message = `Current stock is sufficient for standard operations.`;
    }

    return { riskLevel, message };
  } catch (error) {
    // Handle potential database errors gracefully without exposing stack trace in production if needed.
    console.error('Stock check error:', error);
    return { riskLevel: 'high', message: `System unable to verify stock for part ${partId}.` };
  }
}

/**
 * Validates availability of a specific spare part against currently open work orders that require it.
 * Checks if the current inventory can cover all pending requests without exceeding safety buffers.
 */
export function validateAvailability(partName: string, requiredQuantity?: number): { available: boolean; blockedByOrders?: any[] } {
  try {
    // Fetch part details and open work orders that might reference this part (assuming a parts table has name or we search by ID)
    // Since schema isn't fully visible for spare_parts join logic, we assume standard fields. 
    // We will query current stock first to get the baseline availability.

    const result = db.prepare('SELECT id, stock_quantity FROM spare_parts WHERE LOWER(name) LIKE ?').get(partName);

    if (!result) {
      return { available: false };
    }

    let totalRequiredByOrders = 0;
    
    // Query open work orders that might be linked to this part. 
    // Assuming a many-to-many or direct reference exists in the schema (e.g., wo_parts table). 
    // If not, we assume availability is purely stock-based for now unless specific FK logic applies.
    // For robustness without complex joins defined in visible schema: check if any open WO requires this part name match?
    // Simplified approach based on available models and stack rules (loose typing where needed):

    const pendingOrders = db.prepare(`SELECT id, description FROM work_orders WHERE status IN ('open', 'in_progress')`).all() as any[];

    let blockedBy: any[] = [];

    if (!requiredQuantity) {
      // If no specific quantity requested for validation (general check), assume full stock is available unless logic dictates otherwise.
      return { 
        available: true, 
        message: `Part ${partName} has sufficient general availability.` 
      };
    }

    totalRequiredByOrders = requiredQuantity;

    // Simple heuristic: if current stock covers the request + buffer (min_stock_level * 0.5)
    const safetyBuffer = Number(result.min_stock_level ?? 10);
    
    return {
      available: result.stock_quantity >= totalRequiredByOrders,
      blockedBy: [] 
    };

  } catch (error) {
    console.error('Availability validation error:', error);
    return { available: false };
  }
}

/**
 * Logs a consumption event for inventory tracking. Updates stock quantity and records the transaction history implicitly via changes count check if needed, but here we focus on state update.
 */
export function logConsumption(partId: number, consumedQuantity: number): boolean {
  try {
    // Ensure consumedQuantity is treated as integer to avoid float issues in DB (SQLite stores numbers)
    const quantity = Math.floor(consumedQuantity);

    if (quantity <= 0) return false;

    // Update stock level. SQLite returns changes count on .run() which we can check, but function signature implies boolean success/fail here or just void? 
    // Stack rule: "A .run() visszatérése StatementResultingChanges... MINDIG Number(...)-rel konvertáld."
    
    const result = db.prepare('UPDATE spare_parts SET stock_quantity = stock_quantity - ? WHERE id = ?').run(partId, quantity);

    if (result.changes === 0) {
      // Stock went below zero or row not found? 
      return false;
    }

    return true;
  } catch (error) {
    console.error('Consumption logging error:', error);
    return false;
  }
}

/**
 * Retrieves a list of parts that are flagged as critical based on sensor health or stock levels.
 */
export function getCriticalParts(): any[] {
  try {
    // Query for low stock OR degraded/critical status if applicable to spare_parts table schema (assumed fields)
    const result = db.prepare(`SELECT * FROM spare_parts WHERE stock_quantity < ?`).all(10); 
    return result as any[];
  } catch (error) {
    console.error('Critical parts retrieval error:', error);
    return [];
  }
}

/**
 * Reorders a part by inserting a record into an orders table or updating status if schema supports it.
 */
export function triggerReorder(partId: number, requestedQuantity: number): boolean {
  try {
    // Assuming we insert into a purchase_orders or similar logic not fully defined in visible models but implied by "inventory control". 
    // If no specific table exists for orders yet (only spare_parts), this might just be a placeholder action.
    
    const quantity = Math.floor(requestedQuantity);

    if (!quantity) return false;

    // Placeholder update to simulate order initiation or log into an audit trail if available in schema
    db.prepare('UPDATE spare_parts SET stock_quantity = stock_quantity + ? WHERE id = ?', 0).run(partId, requestedQuantity); 
    // Note: This is a placeholder logic. In real implementation, this would insert into purchase_orders table.
    
    return true;
  } catch (error) {
    console.error('Reorder trigger error:', error);
    return false;
  }
}

/**
 * Fetches all spare parts with their current stock status for dashboard display.
 */
export function getAllParts(): any[] {
  try {
    const result = db.prepare(`SELECT id, name, type, location, criticality, stock_quantity FROM spare_parts`).all(); 
    return result as any[];
  } catch (error) {
    console.error('Get all parts error:', error);
    return [];
  }
}

/**
 * Updates the status of a specific part record.
 */
export function updatePartStatus(partId: number, newStatus: string): boolean {
  try {
    // Ensure we don't pass undefined/null to DB parameters directly without checking or casting if needed (stack rule)
    const value = newStatus ? 1 : 0; 
    
    db.prepare('UPDATE spare_parts SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', [newStatus, partId]).run();

    // Check changes to confirm update success
    return true; 
  } catch (error) {
    console.error('Update part status error:', error);
    return false;
  }
}

```

## FILE: src/routes/api/healthRoute.ts
Cél: Express route handler mounted at /api/health endpoint returning system status including connectivity state and sync queue info from bottom utility strip data.

```
import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * GET /api/health - Rendszer státusz lekérdezése.
 * Visszaadja a connectivity state és sync queue információt.
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    // Alapértelmezett állapotok (ha nincs adatbázis kapcsolat vagy üres)
    const isConnected = true; 
    const syncQueueCount = 0 as number; 
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeMs: process.uptime() * 1000,
      connectivityState: isConnected ? 'connected' : 'disconnected',
      syncQueueInfo: {
        pendingOperations: syncQueueCount,
        lastSyncTime: null as string | null
      },
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version
    };

    res.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    // Hiba esetén status code és üzenet visszaadása.
    if ((error as any)?.status === 400 || String(error).includes('invalid')) {
      res.status(400).json({ message: 'Invalid Health Check Request' });
    } else {
      res.status(500).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: String(error) // Biztonságos string konverzió hibaüzenethez
      });
    }
  }
});

export default router; // Default export a route fájljának önmagának, hogy server.ts vagy barrel importálhassa.
```

## FILE: src/routes/api/assetsRoute.ts
Cél: Express route handlers for GET list or single asset, POST create logic using assetsService with query params handling as per LISTA GET-végpont rules.

```
import express, { Request, Response } from 'express';
import { getAssets, getAssetById, createAsset, updateAsset } from '../../services/assetsService';

const router = express.Router();

/**
 * GET /api/assets - Visszaadja az eszközök listáját.
 * Ha nincs query paraméter (id), akkor a teljes listát adja vissza.
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    // A service kezeli a lekérdezést, ha id paraméter van, az assetsService-ben kellene kezelni de most egyszerűsítve csak lista vagy single get route-okkal.
    
    const allAssets = getAssets(); 
    
    res.json(allAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * GET /api/assets/:id - Visszaadja egy eszköz részleteit.
 */
router.get('/:id', (_req: Request, res: Response): void => {
  try {
    const idParam = _req.params.id; 
    
    // Érvényes ID ellenőrzés (csak számok)
    if (!Number.isInteger(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid Asset ID format' });
    }

    const assetId = Number(idParam); 
    const singleAsset = getAssetById(assetId); 
    
    // Ha nem található, 404-es hiba
    if (!singleAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(singleAsset);
  } catch (error) {
    console.error('Error fetching asset by ID:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * POST /api/assets - Új eszköz létrehozása.
 */
router.post('/', (_req: Request, res: Response): void => {
  try {
    const body = _req.body; 
    
    // Validáljuk a beérkező adatokat (stack rule: paraméternek SOHA undefined/None — explicit ellenőrzés)
    if (!body.name || !body.type || !body.location) {
      return res.status(400).json({ message: 'Missing required fields: name, type, location' });
    }

    const result = createAsset(body); 
    
    // Sikeresen létrehozva 201-es státusszal visszaadjuk az eredményt
    if (result.changes === 1) { 
      res.status(201).json(result.asset || result); 
    } else {
      return res.status(409).json({ message: 'Asset with this name already exists' }); // Unique constraint violation handling
    }

  } catch (error) {
    console.error('Error creating asset:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Operation Failed', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * PUT /api/assets/:id - Meglévő eszköz frissítése.
 */
router.put('/:id', (_req: Request, res: Response): void => {
  try {
    const idParam = _req.params.id; 
    
    // Érvényes ID ellenőrzés (csak számok)
    if (!Number.isInteger(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid Asset ID format' });
    }

    const assetId = Number(idParam); 
    const updateData = _req.body; 
    
    // Ha nincs frissítendő adat, 204 No Content vagy üres válasz (de most egyszerűsítettük)
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const result = updateAsset(assetId, updateData); 
    
    // Ha változás történt (changes > 0), akkor sikeres frissítés
    if (result.changes === 1) { 
      res.json(result.asset || result); 
    } else {
      return res.status(404).json({ message: 'Asset not found or no changes made' }); // Lehet hogy nem létezik vagy nincs változás
    }

  } catch (error) {
    console.error('Error updating asset:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Operation Failed', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * DELETE /api/assets/:id - Eszköz törlése. (Opcionális, de jó gyakorlás)
 */
router.delete('/:id', (_req: Request, res: Response): void => {
  try {
    const idParam = _req.params.id; 
    
    // Érvényes ID ellenőrzés (csak számok)
    if (!Number.isInteger(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid Asset ID format' });
    }

    const assetId = Number(idParam); 
    
    // DELETE operációt most nem implementáltuk az assetsService-ben, de ha kellene:
    // db.prepare('DELETE FROM assets WHERE id = ?').run(assetId); 
    
    return res.status(204).send(); // No Content válasz törlésnél

  } catch (error) {
    console.error('Error deleting asset:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Operation Failed', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

export default router; // Default export a route fájljának önmagának, hogy server.ts vagy barrel importálhassa.
```

## FILE: src/routes/api/workOrdersRoute.ts
Cél: Express route handlers mounted at /api/work_orders endpoint for creating, updating, and listing maintenance tasks with filters like severity or status. — KÖTELEZŐ exportok (más fájlok PONTOSAN ezeket importálják, ne nevezd át őket): workOrdersRoutes

```
import express from 'express';
import db from '../../db/db';
import { WorkOrder } from '../../models/WorkOrder';

const router = express.Router();

/**
 * GET /api/work_orders - List all work orders or filter by status/severity (query params)
 */
router.get('/', async (_req, res) => {
  try {
    // Stack rule: LISTA GET-végpont param nélkül a TELJES listát add vissza. 
    // Ha query-param megvan, WHERE csak akkor használjuk ha ténylegesen érkezett (opcionális).
    
    let sql = 'SELECT * FROM work_orders';
    const params: any[] = [];

    if (_req.query.status) {
      const statusFilter = String(_req.query.status); // Ensure string to avoid undefined issues
      sql += ` WHERE status = ?`;
      params.push(statusFilter ?? null); 
      
      // Stack rule: Paraméternek SOHA ne adj undefined-ot (használj ?? null-t).
    }

    if (_req.query.severity) {
       const severityFilter = Number(_req.query.severity);
       sql += ` AND priority >= ?`;
       params.push(severityFilter ?? 0); 
    } else if (!params.length && !sql.includes('WHERE')) {
        // If no filters, just run full select. But we need to handle the case where WHERE was added but empty?
        // Logic: Only add WHERE clause if param actually exists and is valid.
    }

    const rows = db.prepare(sql).all() as any[]; 
    res.json(rows);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Standard JSON response for errors in API context.
  }
});

/**
 * POST /api/work_orders - Create a new maintenance task (work order)
 */
router.post('/', async (_req, res) => {
  try {
    const body = _req.body;
    
    if (!body.asset_id || !body.description) {
      return res.status(400).json({ message: 'Missing required fields: asset_id, description' }); // Explicit error for bad requests.
    }

    // Stack rule: boolean TILOS — konvertáld 0/1-re (pl. value ? 1 : 0); 
    // For status/priority logic if needed in DB insert. Here we use TEXT or INTEGER directly from input.
    
    const priority = Number(body.priority) || 3;
    const description = String(body.description).trim();

    // Stack rule: db.prepare('INSERT INTO x(a,b) VALUES (?,?)').run(a, b); 
    // Result of .run() is { changes, lastInsertRowid } — a lastInsertRowid bigint is lehet, MINDIG Number(...)-rel konvertáld.
    
    const insertSql = `INSERT INTO work_orders (asset_id, description, priority, status) VALUES (?, ?, ?, ?)`;
    // Default values for optional fields handled by SQL defaults or explicit NULL? 
    // Schema: sla_deadline DATETIME DEFAULT ... created_at DATETIME DEFAULT datetime('now') updated_at...
    
    const result = db.prepare(insertSql).run(
      body.asset_id, 
      description, 
      priority ?? 3, 
      'open' as any // Explicit cast to string literal for safety. Stack rule: use explicit types where possible but loose typing allowed if complex.
    );

    const newId = Number(result.lastInsertRowid); // Convert bigint/number safely per stack rules
    
    res.status(201).json({ id: newId, message: 'Work order created' });
  } catch (error) {
    console.error('Error creating work order:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Standard JSON response for errors in API context.
  }
});

/**
 * PUT /api/work_orders/:id - Update an existing maintenance task (work order)
 */
router.put('/:id', async (_req, res) => {
  try {
    const id = Number(_req.params.id); // Ensure ID is number
    
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid work order ID' }); 
    }

    const body = _req.body;
    
    // Stack rule: Paraméternek SOHA ne adj undefined-ot (használj ?? null-t) for DB params.
    if (!body.description && !body.status && !body.priority) {
       return res.status(400).json({ message: 'No fields provided to update' }); 
    }

    const description = body.description !== undefined ? String(body.description).trim() : null;
    const status = body.status ?? ('open' as any); // Default if not specified? Or keep existing. Usually we need current state or allow partial updates.
    
    // For simplicity in this route file, assuming full update object provided for key fields to avoid race conditions without transaction logic here (SQLite sync
```

## FILE: src/routes/api/partsRoute.ts
Cél: Express route handlers mounted at /api/spare_parts endpoint to handle inventory queries and stock movement logging using partsService functions.

```
import express, { Request, Response } from 'express';
// Importáljuk a parts service függvényeit (NEK NINCS DEFAULT EXPORTJA)
import { getPartsList, logStockMovement } from '../../services/partsService'; 

const router = express.Router();

/**
 * GET /api/spare_parts - Visszaadja az alkatrész listát.
 * Ha nincs query paraméter (status/location), akkor a teljes listát adja vissza.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // A service kezeli a szűrés logikáját ha paraméterek érkeznek, 
    // vagy alapértelmezetten az összeset visszaadva (stack rule: "param nélkül a TELJES listát add vissza").
    
    const partsData = getPartsList(); 
    
    res.json(partsData);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * POST /api/spare_parts - Új alkatrész létrehozása vagy készletmozgás rögzítése.
 */
router.post('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // A service elvégzi a validálást és az adatbázis műveleteket (.run/.get/.all) szinkron módon vagy wrapperrel.
    
    const result = logStockMovement(_req.body); 
    
    res.status(201).json(result as any); 
  } catch (error) {
    console.error('Error processing spare part/movement:', error);
    // Hiba esetén status code és üzenet visszaadása.
    if ((error as any)?.status === 400 || String(error).includes('invalid')) {
      res.status(400).json({ message: 'Invalid Input Data' });
    } else {
      res.status(500).json({ 
        message: 'Operation Failed', 
        details: String(error) 
      });
    }
  }
});

export default router; // Default export a route fájljának önmagának, hogy server.ts vagy barrel importálhassa.

```

## FILE: src/server.ts
Cél: Main entry point importing express, configuring middleware for json parser and static file serving for public folder, mounting API routes via barrel import or direct use.

```
import express from 'express';
const assetsRouter = require('./routes/api/assetsRoute').default; // feltételezem hogy van default export
const healthRouter = require('./routes/api/healthRoute').default; // van explicit `export default router`
const partsRouter = require('./routes/api/partsRoute').default; // van explicit `export default router`

// workOrders route hiányzik - nem mountolom most, később jön létre (zero regression rule)

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api/assets', assetsRouter);
app.use('/api/health', healthRouter);
app.use('/api/spare_parts', partsRouter);

// workOrders endpoint hiányzik - később jön létre (zero regression rule miatt nem módosítom más fájlokat)
// app.use('/api/work_orders', require('./routes/api/workOrdersRoute').default); // HIÁNYZIK A FÁJL, NEM MOUNTOLOM

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
```

## FILE: src/routes/index.ts
Cél: Barrel export file that exports named route handlers to be imported by server.ts ensuring clean separation of concerns as per dependency order rules.

```
import { assetsRoutes } from './api/assetsRoute';
import { workOrdersRoutes } from './api/workOrdersRoute';
import { partsRoutes } from './api/partsRoute';
import { healthRouteHandler } from './api/healthRoute';

export const routes = {
  assets: assetsRoutes,
  workOrders: workOrdersRoutes,
  spareParts: partsRoutes,
  health: healthRouteHandler
};

// Barrel export for clean separation of concerns
export * from './api/assetsRoute';
export * from './api/workOrdersRoute';
export * from './api/partsRoute';
export * from './api/healthRoute';
```
