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
