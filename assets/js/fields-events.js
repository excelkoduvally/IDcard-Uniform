import * as API from "./fields-api.js";
import * as UI from "./fields-ui.js";

let localFieldsList = [];

// Initialize all event listeners and load data
export async function initFieldManager() {
  setupDynamicKeyGeneration();
  setupFilterSearchListeners();
  setupActionListeners();
  
  // Set initial loading state
  const listEl = document.getElementById("fields-list");
  if (listEl) listEl.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading configuration...</p></div>';

  try {
    // 1. Combine DB Queries into Parallel Execution (Performance Item 11)
    const [schools, fields] = await Promise.all([
      API.getSchools(),
      API.getFields()
    ]);
    
    localFieldsList = fields;
    
    // 2. Efficient initDefaults Check (Item 3)
    // Only fetch/insert defaults if the database currently contains ZERO fields.
    if (localFieldsList.length === 0) {
      const statusText = document.querySelector("#fields-list p");
      if (statusText) statusText.textContent = "Initializing default core fields...";
      
      await API.initDefaults();
      // Refetch
      localFieldsList = await API.getFields();
    }

    UI.populateSchoolsDropdown(schools);
    UI.renderFieldsList(localFieldsList);
    
  } catch (err) {
    UI.showAlert(`Error loading configuration: ${err.message}`, "error");
    console.error("[FieldManager Load Error]", err);
  }
}

// 1. Auto-generate sanitized field key on typing name (Item 2 & 13)
function setupDynamicKeyGeneration() {
  const nameInput = document.getElementById("new-field-name");
  const keyInput = document.getElementById("new-field-key");
  
  if (nameInput && keyInput) {
    nameInput.addEventListener("input", (e) => {
      const value = e.target.value;
      const autoKey = value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, ""); // Keep it safe and pristine (Item 2)
      
      keyInput.value = autoKey;
    });
    
    // Also sanitize key input directly if they type there
    keyInput.addEventListener("input", (e) => {
      e.target.value = e.target.value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    });
  }
}

// 2. Set up search bar & filter pills (Item 15)
function setupFilterSearchListeners() {
  const searchInput = document.getElementById("field-search");
  const scopeFilter = document.getElementById("field-scope-filter");
  
  const triggerRender = () => {
    const q = searchInput ? searchInput.value : "";
    const scope = scopeFilter ? scopeFilter.value : "all";
    UI.renderFieldsList(localFieldsList, q, scope);
  };

  if (searchInput) searchInput.addEventListener("input", triggerRender);
  if (scopeFilter) scopeFilter.addEventListener("change", triggerRender);
}

// 3. Handle Add Field & Toggle Active Action Event Listeners
function setupActionListeners() {
  // Add Field Button
  const addBtn = document.getElementById("add-field-btn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      const name = document.getElementById("new-field-name").value.trim();
      const key = document.getElementById("new-field-key").value.trim();
      const type = document.getElementById("new-field-type").value;
      const required = document.getElementById("new-field-required").checked;
      const schoolId = document.getElementById("new-field-school").value;
      const order = document.getElementById("new-field-order").value;

      if (!name || !key) {
        UI.showAlert("Both Name and Key are required fields.", "error");
        return;
      }

      // Add Loading State to Add Button (Item 9)
      const originalText = addBtn.innerHTML;
      addBtn.disabled = true;
      addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      try {
        const payload = {
          field_name: name,
          field_key: key,
          field_type: type,
          required: required,
          active: true,
          locked: false,
          display_order: parseInt(order) || 100,
          school_id: schoolId || null
        };

        const newField = await API.addField(payload);
        
        UI.showAlert("Custom field registered successfully!", "success");
        
        // Clear input form fields
        document.getElementById("new-field-name").value = "";
        document.getElementById("new-field-key").value = "";
        document.getElementById("new-field-order").value = "100";
        document.getElementById("new-field-required").checked = true;
        document.getElementById("new-field-school").value = "";

        // Reload fields locally to update list without page reloads
        localFieldsList = await API.getFields();
        UI.renderFieldsList(localFieldsList);

      } catch (err) {
        // Detailed Error messaging (Item 10)
        UI.showAlert(`Field Addition Failed: ${err.message}`, "error");
        console.error(`[AddField Error] Operation: Save, Supabase Msg:`, err);
      } finally {
        addBtn.disabled = false;
        addBtn.innerHTML = originalText;
      }
    });
  }

  // Toggle Active/Deactivate (using Event Delegation)
  const listEl = document.getElementById("fields-list");
  if (listEl) {
    listEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".action-btn");
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      const active = btn.getAttribute("data-active") === "true";
      const locked = btn.getAttribute("data-locked") === "true";
      
      const nextState = !active;

      // Core locked safety check (Item 5)
      if (locked) {
        UI.showAlert("Safety Violation: Locked core system fields cannot be modified.", "error");
        return;
      }

      // Deactivation confirmation dialog (Item 14)
      if (active) {
        const confirmDeactivate = confirm(`Are you sure you want to deactivate this field? Deactivating this will temporarily hide it on student registers.`);
        if (!confirmDeactivate) return;
      }

      // Add Loading State inline to button (Item 9)
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      try {
        await API.toggleFieldActive(id, nextState, locked);
        
        // Fast Inline UI State Update (Item 8 - avoids full DB reloads!)
        UI.updateFieldCardUI(id, nextState);
        
        // Update local fields memory structure quietly
        const idx = localFieldsList.findIndex(f => f.id === id);
        if (idx !== -1) localFieldsList[idx].active = nextState;

      } catch (err) {
        // Detailed Error messaging (Item 10)
        UI.showAlert(`Status Update Failed [ID: ${id}]: ${err.message}`, "error");
        console.error(`[ToggleActive Error] FieldID: ${id}, TargetState: ${nextState}`, err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = nextState ? 'Deactivate' : 'Activate';
      }
    });
  }
}
