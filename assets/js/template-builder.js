import { guardPage, supabase } from "./auth.js";

guardPage('admin');

let fields = [];

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

  const { data: { user } } = await supabase.auth.getUser();

  // Show loading state if present
  const btn = document.querySelector(".btn-primary.btn-full");
  if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    for (let i = 0; i < fields.length; i++) {
      await supabase
        .from("templates")
        .insert({
          school_id: user.id,
          field_name: fields[i].field_name,
          field_type: fields[i].field_type,
          required: fields[i].required,
          order_no: i
        });
    }
    alert("Template saved successfully!");
  } catch (err) {
    alert("Error saving template: " + err.message);
  } finally {
    if(btn) btn.innerHTML = '<i class="fas fa-save"></i> Save Template';
  }
};
