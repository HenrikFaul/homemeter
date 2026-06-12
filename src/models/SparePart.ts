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
