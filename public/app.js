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
