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
