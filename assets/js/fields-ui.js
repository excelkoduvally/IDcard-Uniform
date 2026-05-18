// Helper to securely escape HTML against XSS injections
export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Display alert messages securely
export function showAlert(msg, type = "error") {
  const el = document.getElementById("alert-box");
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = msg; 
  setTimeout(() => el.className = "alert", 4000);
}

// Populate the school dropdown filter
export function populateSchoolsDropdown(schools) {
  const select = document.getElementById("new-field-school");
  if (!select) return;
  
  // Clear other options except placeholder
  select.innerHTML = '<option value="">[ All Schools (Global) ]</option>';
  
  schools.forEach(school => {
    const opt = document.createElement("option");
    opt.value = escapeHTML(school.id);
    opt.textContent = escapeHTML(school.school_name || "Unnamed School");
    select.appendChild(opt);
  });
}

// Render fields list with dynamic filtering and security escape mechanisms
export function renderFieldsList(fields, searchQuery = "", filterScope = "all") {
  const list = document.getElementById("fields-list");
  if (!list) return;

  // Apply real-time search & filter (Item 15)
  const filtered = fields.filter(f => {
    const nameMatch = f.field_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      f.field_key.toLowerCase().includes(searchQuery.toLowerCase());
    
    let scopeMatch = true;
    if (filterScope === 'global') scopeMatch = !f.school_id;
    if (filterScope === 'specific') scopeMatch = !!f.school_id;
    if (filterScope === 'active') scopeMatch = f.active;
    if (filterScope === 'inactive') scopeMatch = !f.active;

    return nameMatch && scopeMatch;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No fields found matching criteria.</p></div>';
    return;
  }

  list.innerHTML = filtered.map(f => {
    const scope = f.school_id 
      ? `<span class="badge badge-blue">Specific: ${escapeHTML(f.schools?.school_name || 'Unknown')}</span>` 
      : `<span class="badge badge-green">GLOBAL</span>`;
    
    const activeText = f.active 
      ? '<span class="status-badge"><b style="color:#22c55e">Active</b></span>' 
      : '<span class="status-badge"><b style="color:#ef4444">Inactive</b></span>';
      
    const lockIndicator = f.locked 
      ? '<span class="lock-badge" style="font-size:0.75rem; color:var(--warning); text-align:center;"><i class="fas fa-lock"></i> Locked</span>' 
      : '';

    return `
      <div class="field-card" data-field-id="${escapeHTML(f.id)}">
        <div class="field-info">
          <strong>${escapeHTML(f.field_name)} <span style="color:var(--text-muted); font-size:0.8rem">(${escapeHTML(f.field_key)})</span></strong>
          <div style="margin: 0.4rem 0;">${scope}</div>
          <span>Type: ${escapeHTML(f.field_type)} | ${f.required ? '<b style="color:var(--accent)">Required</b>' : 'Optional'} | ${activeText} | Order: ${parseInt(f.display_order) || 0}</span>
        </div>
        <div style="display:flex; gap:0.5rem; flex-direction:column; align-items: flex-end;">
          <button 
            class="btn btn-outline btn-sm action-btn" 
            data-id="${escapeHTML(f.id)}" 
            data-active="${f.active}"
            data-locked="${f.locked}"
            ${f.locked ? 'disabled title="Locked core field"' : ''}
          >
            ${f.active ? 'Deactivate' : 'Activate'}
          </button>
          ${lockIndicator}
        </div>
      </div>
    `;
  }).join('');
}

// Update UI directly on active toggle to prevent full reload (Item 8)
export function updateFieldCardUI(fieldId, active) {
  const card = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (!card) return;
  
  const statusBadge = card.querySelector('.status-badge');
  const actionBtn = card.querySelector('.action-btn');
  
  if (active) {
    statusBadge.innerHTML = '<b style="color:#22c55e">Active</b>';
    actionBtn.textContent = 'Deactivate';
    actionBtn.setAttribute('data-active', 'true');
  } else {
    statusBadge.innerHTML = '<b style="color:#ef4444">Inactive</b>';
    actionBtn.textContent = 'Activate';
    actionBtn.setAttribute('data-active', 'false');
  }
}
