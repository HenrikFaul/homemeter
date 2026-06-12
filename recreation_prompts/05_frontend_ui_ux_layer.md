# 05_frontend_ui_ux_layer — generátor prompt

Hozd létre PONTOSAN az alábbi fájlokat a(z) TypeScript / Node (Express + SQLite adatbázis + statikus frontend) projektben. A tartalom a source-of-truth — karakterre pontosan ezt add vissza, kivéve ha a master kontextus kifejezetten módosítást kér.

## FILE: public/index.html
Cél: Static HTML shell containing the dashboard layout with left panel rail for live equipment tree, center workspace area for machine overview and right action sidebar.

```
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ipari Karbantartás Parancsközpont</title>
    
    <!-- Chart.js betöltése a grafikonokhoz -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>

    <!-- Saját CSS fájlok referenciája (a public mappa alatt) -->
    <link rel="stylesheet" href="./style.css">
</head>
<body class="app-body dark-theme">

    <!-- Felső sáv: Cím, státusz és felhasználó információk -->
    <header class="app-header">
        <div class="header-left">
            <h1>Ipari Karbantartás Parancsközpont</h1>
        </div>
        
        <!-- Spacer a középre igazításhoz vagy logikához, ha szükséges -->
        <div class="spacer"></div>

        <!-- Státusz jelvény: rendszer állapota (pl. online/offline) -->
        <div id="system-status" class="status-pill ok">
            <span class="dot"></span> Rendszer Online
        </div>
    </header>

    <!-- Fő tartalom terület -->
    <main class="app-main grid-layout">
        
        <!-- Bal panel: Eszköz fastruktúra / Live Equipment Tree -->
        <section class="panel-left section" aria-label="Eszközök listája">
            <h2>Eszközök Áttekintése</h2>
            
            <!-- Töltés közbeni skeletontartalom (Skeleton) -->
            <div id="assets-skeleton-container" class="skeleton-list"></div>

            <!-- Üres állapot vagy adatok megjelenítése után a lista helye -->
            <div id="asset-tree-content">
                <!-- Itt renderelődik az eszközfa JS-ből (insertAdjacentHTML) -->
            </div>

             <!-- Hiba banner, ha nincs kapcsolat -->
             <div id="assets-error-banner" class="error-banner hidden"></div>
        </section>


        <!-- Középső terület: Operatív nézet és részletek -->
        <section class="panel-center section">
            <h2>Részletes Megfigyelés</h2>

            <!-- KPI kártyák rácsa (Stat Cards) -->
            <div id="dashboard-stats" class="grid grid-cols-4 gap-4 mb-6">
                <!-- Stat card 1: Aktív hibajegyek száma -->
                <div class="card stat">
                    <div class="value" id="stat-active-incidents">0</div>
                    <div class="label">Aktív Hibajegy (SLA)</div>
                </div>

                 <!-- Stat card 2: Kritikus eszközök száma -->
                 <div class="card stat warn">
                    <div class="value" id="stat-critical-assets">0</div>
                    <div class="label">Kritikus Eszköz (Offline)</div>
                </div>

                 <!-- Stat card 3: Alkatrész hiányok -->
                 <div class="card stat warn">
                    <div class="value" id="stat-parts-low-stock">0</div>
                    <div class="label">Alacsony Raktárkészlet</div>
                </div>

                 <!-- Stat card 4: Teljesített feladatok -->
                 <div class="card stat ok">
                    <div class="value" id="stat-completed-today">0</div>
                    <div class="label">Teljesítve Ma</div>
                </div>
            </div>

            <!-- Fő eszköz részlet nézet -->
            <div id="asset-detail-view" class="card asset-card hidden">
                <h3>Eszköz: <span id="detail-asset-name"></span></h3>
                
                <div class="kv-row mb-4">
                    <span>Helyszín:</span><b id="detail-location"></b>
                </div>

                <!-- Grafikon tartomány -->
                <div class="chart-box" style="height: 250px;">
                    <canvas id="asset-health-chart"></canvas>
                </div>

                 <!-- Eszköz állapot badge-je -->
                 <div class="kv-row mt-4">
                     <span>Eszköz Állapota:</span><b id="detail-status-badge" class="badge ok"><span class="dot"></span>Fut</b>
                </div>

            </div>

             <!-- Üres állapot: Nincs kiválasztott eszköz -->
             <div id="asset-empty-state" class="state hidden">
                 <div class="icon">📭</div>
                 <div>Egy eszközt sem választottál ki.</div>
            </div>

        </section>


        <!-- Jobb panel: Feladatok és gyorsakciók -->
        <section class="panel-right section" aria-label="Aktív feladatok">
            
            <h2>Aktív Hibajegyek</h2>
            
            <!-- Töltés skeletontartalom jobb oldalon is lehetne, de egyszerűsítve a listát -->
             <div id="work-orders-list-container" class="list-group skeleton"></div>

            <!-- Üres állapot: Nincs nyitott hibajegy -->
            <div id="wo-empty-state" class="state hidden">
                <div class="icon">✅</div>
                <div>Nincsenek aktív beavatkozások.</div>
            </div>

             <!-- Hiba banner jobb oldalon is lehetne, de a fő hiba az assets-ben van -->


        </section>

    </main>

    <!-- Alapvető JavaScript logika betöltése (Vanilla JS) -->
    <script src="./app.js"></script>
</body>
</html>

```

## FILE: public/style.css
Cél: Industrial-grade CSS styles defining dark mode high-contrast themes, grid layouts for multi-pane workflows, and responsive density controls for large monitors.

```
/* ============================================================
   HENRIS Forge design-alap — token-alapú, sötét/világos, reszponzív
   A komponensek KIZÁRÓLAG ezekre az osztályokra építenek.
   ============================================================ */
:root{
  --bg:#0d1117; --bg-2:#161b22; --panel:#1c2128; --line:#30363d;
  --fg:#e6edf3; --muted:#8b949e;
  --primary:#4493f8; --primary-fg:#ffffff;
  --ok:#3fb950; --warn:#d29922; --err:#f85149;
  --radius:10px; --radius-sm:6px;
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px;
  --font:system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --shadow:0 1px 3px rgba(0,0,0,.4);
}
@media (prefers-color-scheme: light){
  :root{ --bg:#f6f8fa; --bg-2:#ffffff; --panel:#ffffff; --line:#d0d7de; --fg:#1f2328; --muted:#656d76; --shadow:0 1px 3px rgba(31,35,40,.12); }
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--fg);font-family:var(--font);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}

/* ---- Vázszerkezet ---- */
.app-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:var(--sp-4);flex-wrap:wrap;
  padding:var(--sp-3) var(--sp-5);background:var(--bg-2);border-bottom:1px solid var(--line);box-shadow:var(--shadow)}
.app-header h1{margin:0;font-size:18px;font-weight:650;letter-spacing:.2px}
.app-main{max-width:1200px;margin:0 auto;padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-5)}
.section{display:flex;flex-direction:column;gap:var(--sp-3)}
.section > h2{margin:0;font-size:15px;font-weight:650;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
.toolbar{display:flex;gap:var(--sp-2);align-items:center;flex-wrap:wrap}
.spacer{flex:1}

/* ---- Kártyák, rács ---- */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--sp-4)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:var(--sp-4);
  display:flex;flex-direction:column;gap:var(--sp-2);box-shadow:var(--shadow)}
.card h3{margin:0;font-size:15px;font-weight:650}
.card .meta{color:var(--muted);font-size:13px}
.kv{display:flex;justify-content:space-between;gap:var(--sp-3);font-size:14px}
.kv b{font-weight:600}
.stat{display:flex;flex-direction:column;gap:2px;padding:var(--sp-3) var(--sp-4)}
.stat .value{font-size:26px;font-weight:700;line-height:1.1}
.stat .label{color:var(--muted);font-size:13px}

/* ---- Jelvények, állapot ---- */
.badge{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:999px;
  font-size:12px;font-weight:600;border:1px solid var(--line);background:var(--bg-2);color:var(--fg);white-space:nowrap}
.badge.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 40%,transparent)}
.badge.warn{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 40%,transparent)}
.badge.err{color:var(--err);border-color:color-mix(in srgb,var(--err) 40%,transparent)}
.badge .dot{width:8px;height:8px;border-radius:50%;background:currentColor}
.status-pill{padding:var(--sp-2) var(--sp-4);border-radius:var(--radius-sm);background:var(--panel);
  border:1px solid var(--line);font-size:13px;color:var(--muted)}

/* ---- Gombok ---- */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius-sm);
  border:1px solid var(--line);background:var(--panel);color:var(--fg);font-size:14px;font-weight:550;
  cursor:pointer;min-height:32px;transition:background .12s,border-color .12s}
.btn:hover{border-color:var(--primary)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn.primary{background:var(--primary);border-color:var(--primary);color:var(--primary-fg)}
.btn.danger{background:transparent;border-color:var(--err);color:var(--err)}
.btn.sm{padding:3px 10px;font-size:12.5px;min-height:26px}

/* ---- Táblázat ---- */
.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel)}
table{width:100%;border-collapse:collapse;font-size:14px}
th{padding:10px 14px;text-align:left;color:var(--muted);font-size:12px;text-transform:uppercase;
  letter-spacing:.6px;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:10px 14px;border-bottom:1px solid var(--line)}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover{background:color-mix(in srgb,var(--primary) 6%,transparent)}

/* ---- Űrlapok ---- */
.form{display:flex;flex-direction:column;gap:var(--sp-3);max-width:520px}
.form .row{display:flex;gap:var(--sp-3);flex-wrap:wrap}
label.field{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted);flex:1;min-width:160px}
input,select,textarea{padding:8px 10px;border-radius:var(--radius-sm);border:1px solid var(--line);
  background:var(--bg-2);color:var(--fg);font-family:var(--font);font-size:14px;min-height:34px}
input:focus,select:focus,textarea:focus{border-color:var(--primary);outline:none}
.field-error{color:var(--err);font-size:12.5px}

/* ---- Állapot-nézetek (loading / empty / error) ---- */
.state{display:flex;flex-direction:column;align-items:center;gap:var(--sp-2);
  padding:var(--sp-6);color:var(--muted);text-align:center;border:1px dashed var(--line);border-radius:var(--radius)}
.state .icon{font-size:28px}
.skeleton{position:relative;overflow:hidden;background:var(--panel);border-radius:var(--radius);min-height:72px}
.skeleton::after{content:"";position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--fg) 7%,transparent),transparent);
  animation:shimmer 1.4s infinite}
@keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.error-banner{padding:var(--sp-3) var(--sp-4);border:1px solid var(--err);border-radius:var(--radius-sm);
  background:color-mix(in srgb,var(--err) 8%,transparent);color:var(--err);font-size:14px}

/* ---- Grafikon-konténer ---- */
.chart-box{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
  padding:var(--sp-4);width:100%}
.chart-box canvas{display:block;width:100%!important;height:280px!important}

/* ---- Reszponzív ---- */
@media (max-width:720px){
  .app-main{padding:var(--sp-3)}
  .grid{grid-template-columns:1fr}
  .app-header{padding:var(--sp-3)}
}

```

## FILE: public/app.js
Cél: Frontend application logic handling fetch requests to API endpoints like /api/assets/, rendering data tables with keyboard-first navigation support.

```
/**
 * public/app.js
 * Industrial Maintenance Command Center - Frontend Logic
 * Handles data fetching, rendering, and user interactions for assets/work orders.
 */

(function () {
  'use strict';

  // --- Configuration & Constants ---
  const API_BASE = '/api';
  
  // UI Element References (Caching DOM nodes)
  const els = {
    headerTitle: document.getElementById('app-title'),
    statusPill: document.getElementById('system-status'),
    assetsContainer: document.getElementById('assets-list-container'),
    statsGrid: document.querySelector('.stats-grid'),
    createWoBtn: document.getElementById('btn-create-work-order'),
    workOrderForm: document.getElementById('form-new-workorder') || null, // Fallback if form not found yet or dynamic
  };

  // --- State Management (Simple) ---
  let currentAssets = [];
  
  /**
   * Normalizes API response data to ensure it's always an array before iteration.
   */
  const normalizeList = (data) => {
    return Array.isArray(data) 
      ? data 
      : (data && typeof data === 'object' ? [data] : []);
  };

  /**
   * Formats a date string for display in the UI.
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('hu-HU', { day: '2-digit', month: 'short' });
    } catch (e) {
      return dateStr; // Fallback for invalid dates
    }
  };

  /**
   * Renders the status badge HTML based on state.
   */
  const renderStatusBadge = (status, label) => {
    let className = 'badge';
    let dotColor = '';
    
    if (['running', 'healthy'].includes(status)) {
      className += ' ok';
      dotColor = '#2ecc71'; // Green
    } else if (['maintenance', 'degraded'].includes(status)) {
      className += ' warn';
      dotColor = '#f39c12'; // Orange/Yellow
    } else if (['error', 'critical', 'offline', 'stopped'].includes(status)) {
      className += ' err';
      dotColor = '#e74c3c'; // Red
    }

    return `<span class="${className}">
              <span style="background-color:${dotColor}; width:8px; height:8px; border-radius:50%; display:inline-block;"></span> 
              ${label || status.toUpperCase()}
            </span>`;
  };

  /**
   * Renders a single asset card.
   */
  const renderAssetCard = (asset) => {
    // Normalize criticality for display if needed, but assuming raw data is fine per schema
    return `
      <div class="card">
        <h3>${escapeHtml(asset.name)}</h3>
        <div class="kv-row" style="margin-bottom: 8px;">
          <span>Típus:</span><b>${asset.type || 'N/A'}</b>
        </div>
        <div class="kv-row" style="margin-bottom: 8px;">
          <span>Helyszín:</span><b>${escapeHtml(asset.location)}</b>
        </div>
        <div class="kv-row" style="margin-bottom: 8px;">
          <span>Kritikusitás:</span><b>${asset.criticality || '3'}</b>/5
        </div>
        
        <!-- Status Badge -->
        ${renderStatusBadge(asset.sensor_health_status, asset.status)}

        <div class="kv-row" style="margin-top: 8px; font-size: 0.9em;">
          <span>Jelenlegi állapot:</span><b>${asset.status.toUpperCase()}</b>
        </div>
        
        ${asset.next_due_date ? `
        <div class="kv-row">
           <span>Következő karbantartás:</span><b>${formatDate(asset.next_due_date)}</b>
        </div>` : ''}

      </div>
    `;
  };

  /**
   * Renders the statistics grid (KPIs).
   */
  const renderStats = () => {
    // Logic to calculate stats from currentAssets would go here if we had full state. 
    // For MVP, we assume initial fetch provides counts or empty state handles it.
    
    let html = '';

    // Helper for stat card HTML structure per UI rules: <div class="card stat"><div class="value">42</div><div class="label">Megnevezés</div></div>
    const createStatCard = (count, label) => `
      <div class="card stat" style="${count > 0 ? 'display:flex; flex-direction:column;' : ''}">
        ${count !== undefined && count >= 0 
          ? `<div class="value">${escapeHtml(count)}</div>` 
          : '<div class="value">-</div>'}
        <div class="label">${escapeHtml(label)}</div>
      </div>
    `;

    // If we have assets, calculate simple stats. Otherwise show empty state or 0s if needed for layout stability.
    const totalAssets = currentAssets.length;
    
    html += createStatCard(totalAssets, 'Eszközök');
    
    // Example: Running vs Stopped (Simple logic based on status field)
    const runningCount = currentAssets.filter(a => a.status === 'running').length;
    const stoppedCount = currentAssets.filter(a => ['stopped', 'maintenance'].includes(a.status)).length;

    html += createStatCard(runningCount, 'Folyamatban');
    html += createStatCard(stoppedCount, 'Leállítva/Karbantartás');

    // Critical Assets (Criticality >= 4)
    const criticalAssets = currentAssets.filter(a => a.criticality && a.criticality >= 4).length;
    
    if (criticalAssets > 0 || totalAssets === 0) {
      html += createStatCard(criticalAssets, 'Kritikus eszközök');
    }

    return html;
  };

  /**
   * Renders the error banner.
   */
  const renderErrorBanner = (message) => `
    <div class="error-banner">
        <span style="color: #e74c3c;">⚠️ ${escapeHtml(message)}</span>
    </div>`;

  /**
   * Renders the empty state.
   */
  const renderEmptyState = () => `
      <div class="state">
        <div style="font-size: 2rem; margin-bottom:10px;">📭</div>
        <div>Még nincs adat</div>
        ${els.createWoBtn ? `<button id="btn-trigger-load" class="btn primary" onclick="loadAssets()">Adatok betöltése</button>` : ''}
      </div>
  `;

  /**
   * Renders the skeleton loading state.
   */
  const renderSkeleton = () => {
    return [1,2,3].map(() => `<div class="skeleton" style="height:80px; margin-bottom:16px;"></div>`).join('');
  };

  /**
   * Main function to load and display assets.
   */
  const loadAssets = async () => {
    // Reset UI state for loading
    els.assetsContainer.innerHTML = renderSkeleton();
    
    if (els.statusPill) {
      els.statusPill.textContent = 'Betöltés...';
      els.statusPill.className = 'status-pill warn'; 
    }

    try {
      const response = await fetch(`${API_BASE}/assets`); // Relative path as per stack rules
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: Nincs adat vagy hiba.`);

      let rawData;
      
      // Handle potential JSON parsing issues or non-JSON responses gracefully (though API should return JSON)
      try {
        rawData = await response.json(); 
      } catch (e) {
         throw new Error('Hibás válaszformátum a szerverről.');
      }

      const assetsList = normalizeList(rawData); // Normalize list rule
      
      currentAssets = assetsList; // Update state for stats calculation if needed later

      // Render Stats first, then List (or vice versa depending on layout)
      els.statsGrid.innerHTML = renderStats();
      
      // Check empty state vs data
      const containerHtml = assetsList.length > 0 
        ? `<div class="grid">${assetsList.map(renderAssetCard).join('')}</div>` 
        : renderEmptyState();

      els.assetsContainer.innerHTML = containerHtml;

    } catch (error) {
      console.error(error); // Log for debugging, but don't crash UI completely if possible
      
      const errorMsg = error.message || 'Hiba történt az adatok betöltésekor.';
      
      // Update status pill to Error state visually
      els.statusPill.textContent = 'hiba'; 
      els.statusPill.className = 'status-pill err';

      // Render error banner in assets container or a dedicated area if exists. 
      // Based on UI rules: "hibánál <div class="error-banner">Hiba: …</div>"
      
      const fallbackContainerHtml = renderErrorBanner(errorMsg);
      els.assetsContainer.innerHTML = fallbackContainerHtml;

    } finally {
       // Reset status pill if successful or just leave it as is based on data state. 
       // Ideally, we update the pill text to reflect current system health from assets list (e.g., "OK" vs "Alert").
       const hasCriticalIssues = currentAssets.some(a => a.sensor_health_status === 'critical');
       
       if (!hasCriticalIssues && els.statusPill) {
         els.statusPill.textContent = 'rendszer'; 
         els.statusPill.className = 'status-pill ok';
       } else if (els.statusPill) {
          // If we have data, update text to reflect status of the most critical asset or general state.
          const activeIssuesCount = currentAssets.filter(a => a.sensor_health_status !== 'healthy').length;
          els.statusPill.textContent = `${activeIssuesCount > 0 ? activeIssuesCount : ''} figyelmeztetés`; 
       }
    }
  };

  /**
   * Handles the creation of a new Work Order.
   */
  const handleCreateWorkOrder = async (e) => {
    e.preventDefault(); // Prevent form submission if using standard <form> behavior, but here we intercept
    
    const descriptionInput = document.getElementById('wo-description');
    const priorityInput = document.getElementById('wo-priority');

    if (!descriptionInput || !priorityInput) return;

    const desc = descriptionInput.value.trim();
    // Priority 1-5. Default to medium (3).
    
    try {
      await fetch(`${API_BASE}/work_orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, priority: parseInt(priorityInput.value) || 3 })
      });

      // Clear inputs and reload assets to show new state (or just refresh list if we had a dedicated WO view)
      const form = document.getElementById('form-new-workorder');
      if(form) {
        form.reset(); 
      } else {
         descriptionInput.value = '';
         priorityInput.value = '3';
      }

      // Reload assets to update the dashboard state immediately (Optimistic UI would be better but simple reload is safer per stack rules)
      loadAssets(); 

    } catch (error) {
       alert('Hiba a hibajegy létrehozásakor: ' + error.message);
    }
  };

  /**
   * Utility to escape HTML strings to prevent XSS.
   */
  const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /**
   * Initialize the application.
   */
  const init = () => {
    // Ensure elements exist before attaching listeners (DOM ready check)
    if (!els.assetsContainer || !els.statsGrid) return console.warn('UI elemek nem találhatók.');

    els.createWoBtn?.addEventListener('click', handleCreateWorkOrder);
    
    // Initial Load
    loadAssets();
  };

  // Run initialization when DOM is ready (or immediately if script tag at end of body)
  document.addEventListener('DOMContentLoaded', init);

})();

```
