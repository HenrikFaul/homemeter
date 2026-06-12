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
