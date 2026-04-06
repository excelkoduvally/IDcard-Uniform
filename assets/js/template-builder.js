import { guardPage, supabase } from "./auth.js";

guardPage('admin');

let fields = [];

async function initializeSchools() {
  try {
    const { data: schools, error } = await supabase.from('schools').select('id, school_name');
    if (error) throw error;
    
    const sel = document.getElementById("template-school-select");
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Choose a School --</option>';
    
    (schools || []).forEach(s => {
      sel.appendChild(new Option(s.school_name || s.id, s.id));
    });
  } catch(e) {
    console.error("Failed loading schools", e);
  }
}
initializeSchools();

window.loadExistingTemplate = async function() {
  const schoolId = document.getElementById("template-school-select").value;
  if (!schoolId) {
    fields = [];
    render();
    return;
  }
  try {
    const { data } = await supabase.from("templates").select("*").eq("school_id", schoolId).order("order_no");
    fields = data || [];
    render();
  } catch(e) {
    console.error("Error loading template", e);
  }
}

window.addField = function () {
  const name = document.getElementById("field-name").value.trim();
  const type = document.getElementById("field-type").value;
  const required = document.getElementById("field-required").checked;

  if (!name) {
    alert("Please enter a field name.");
    return;
  }

  fields.push({
    field_name: name,
    field_type: type,
    required: required
  });

  document.getElementById("field-name").value = "";
  render();
};

function render() {
  const tbody = document.getElementById("field-list");
  
  if (fields.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3"><div class="empty-state"><p>No fields added yet.</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = fields.map(f => `
    <tr>
      <td>${f.field_name}</td>
      <td><span class="badge badge-blue">${f.field_type}</span></td>
      <td>${f.required ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-gray">No</span>'}</td>
    </tr>
  `).join("");
}

window.saveTemplate = async function () {
  if (fields.length === 0) {
    alert("Add at least one field before saving.");
    return;
  }

  const schoolId = document.getElementById("template-school-select").value;
  if (!schoolId) {
    alert("Please select a target school to assign this template to.");
    return;
  }

  const btn = document.querySelector(".btn-primary.btn-full");
  if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    // Delete existing template fields first so we cleanly rebuild it
    await supabase.from("templates").delete().eq("school_id", schoolId);

    const insertions = fields.map((f, i) => ({
      school_id: schoolId,
      field_name: f.field_name,
      field_type: f.field_type,
      required: f.required,
      order_no: i
    }));

    const { error } = await supabase.from("templates").insert(insertions);
    if(error) throw error;

    alert("Template saved successfully for this school!");
  } catch (err) {
    alert("Error saving template: " + err.message);
  } finally {
    if(btn) btn.innerHTML = '<i class="fas fa-save"></i> Save Template';
  }
};
