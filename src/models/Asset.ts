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
