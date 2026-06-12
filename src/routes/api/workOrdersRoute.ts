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