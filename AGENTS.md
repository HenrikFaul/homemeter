# AGENTS.md — TypeScript / Node (Express + SQLite adatbázis + statikus frontend)
## Parancsok (PONTOSAN ezeket használd)
- Telepítés: `npm install --no-audit --no-fund`
- Fordítás/ellenőrzés: `npx --yes tsc -p tsconfig.json --noEmit`
- Build artefakt: `npx --yes tsc -p tsconfig.json`
- Indítás: `node dist/server.js` (PORT env-ből; kiírja: "listening on <PORT>")
## Struktúra
- `package.json` — Defines project metadata, sets "type": "commonjs", lists express dependency and devDependencies like typescript with correct versions per stack constraints.
- `tsconfig.json` — Configures TypeScript compiler options including strict: false, noImplicitAny: false to allow loose typing as requested in brief instructions.
- `src/db/schema.sql` — Contains SQL DDL statements defining tables for assets, work_orders, spare_parts, users with SQLite syntax constraints like INTEGER PRIMARY KEY AUTOINCREMENT.
- `src/db/db.ts` — Initializes DatabaseSync instance using node:sqlite module, creates data directory recursively, executes schema creation via raw strings to avoid file reading logic errors.
- `src/models/Asset.ts` — Defines TypeScript interface for Asset entity including status, location, criticality, and sensor health indicators used across services.
- `src/models/User.ts` — Defines TypeScript interface for User role system covering operator, technician, supervisor roles with permissions flags as per core user roles requirement.
- `src/models/WorkOrder.ts` — Defines TypeScript interface for Work Order tracking ID, asset linkage, SLA timers, priority logic derived from composite factors like downtime duration.
- `src/models/SparePart.ts` — Defines TypeScript interface for Spare Parts inventory including stock levels, reorder points, lead times, and compatibility data linked to assets.
- `src/services/assetsService.ts` — Implements CRUD operations for assets using db.prepare methods with strict type casting from models directory via relative imports.
- `src/services/workOrdersService.ts` — Handles work order logic such as SLA countdowns, priority recalculation based on asset criticality, and assignment routing to technicians.
- `src/services/partsService.ts` — Manages inventory checks for stockout risks, part availability validation against open work orders, and consumption tracking via db.run with integer booleans.
- `src/routes/api/healthRoute.ts` — Express route handler mounted at /api/health endpoint returning system status including connectivity state and sync queue info from bottom utility strip data.
- `src/routes/api/assetsRoute.ts` — Express route handlers for GET list or single asset, POST create logic using assetsService with query params handling as per LISTA GET-végpont rules.
- `src/routes/api/workOrdersRoute.ts` — Express route handlers mounted at /api/work_orders endpoint for creating, updating, and listing maintenance tasks with filters like severity or status.
- `src/routes/api/partsRoute.ts` — Express route handlers mounted at /api/spare_parts endpoint to handle inventory queries and stock movement logging using partsService functions.
- `src/server.ts` — Main entry point importing express, configuring middleware for json parser and static file serving for public folder, mounting API routes via barrel import or direct use.
- `src/routes/index.ts` — Barrel export file that exports named route handlers to be imported by server.ts ensuring clean separation of concerns as per dependency order rules.
- `public/index.html` — Static HTML shell containing the dashboard layout with left panel rail for live equipment tree, center workspace area for machine overview and right action sidebar.
- `public/style.css` — Industrial-grade CSS styles defining dark mode high-contrast themes, grid layouts for multi-pane workflows, and responsive density controls for large monitors.
- `public/app.js` — Frontend application logic handling fetch requests to API endpoints like /api/assets/, rendering data tables with keyboard-first navigation support.
- `tests/basic.test.ts` — Simple Node assert test verifying database connection success via db.exec check or basic API response structure validation without Jest dependencies.
## Konvenciók
- Lásd: codingLessonsLearnt.md (HenrisForge) — a tanulságok kötelezőek.
- Minden megosztott típus a models rétegből; minden modul exportál, amire import mutat.
## NE MÓDOSÍTSD
- package-lock.json / node_modules / dist / __pycache__ / data/*.db (futási adat)
- .henris/ (build-állapot és session-napló) · recreation_prompts/ (generált dokumentáció)
Generálta: HENRIS Forge, 2026-06-12