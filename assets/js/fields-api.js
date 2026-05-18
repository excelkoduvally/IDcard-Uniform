import { supabase } from "./auth.js";

let cachedSchools = [];

// Fetch all schools (cached in memory)
export async function getSchools() {
  if (cachedSchools.length > 0) return cachedSchools;
  const { data, error } = await supabase.from("schools").select("id, school_name");
  if (error) throw error;
  cachedSchools = data || [];
  return cachedSchools;
}

// Fetch all student fields
export async function getFields() {
  const { data, error } = await supabase
    .from("student_fields")
    .select("*, schools(school_name)")
    .order("display_order", { ascending: true })
    .order("created_at");
  if (error) throw error;
  return data || [];
}

// Initialize default student fields
export async function initDefaults() {
  const defaults = [
    { field_name: "Name", field_key: "name", field_type: "text", required: true, active: true, locked: true, display_order: 10 },
    { field_name: "Admission No", field_key: "admission_no", field_type: "text", required: true, active: true, locked: true, display_order: 20 },
    { field_name: "Class", field_key: "class", field_type: "text", required: true, active: true, locked: true, display_order: 30 },
    { field_name: "Division", field_key: "division", field_type: "text", required: true, active: true, locked: true, display_order: 40 },
    { field_name: "Parent Name", field_key: "parent_name", field_type: "text", required: true, active: true, locked: false, display_order: 50 },
    { field_name: "House", field_key: "house", field_type: "text", required: true, active: true, locked: false, display_order: 60 },
    { field_name: "Place", field_key: "place", field_type: "text", required: true, active: true, locked: false, display_order: 70 },
    { field_name: "Phone Number", field_key: "phone", field_type: "number", required: true, active: true, locked: false, display_order: 80 }
  ];
  const { error } = await supabase.from('student_fields').insert(defaults);
  if (error) throw error;
}

// Add a single custom student field
export async function addField(payload) {
  // 1. Enforce backend key sanitization & RLS-ready validation
  const cleanKey = payload.field_key
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  
  payload.field_key = cleanKey;

  // 2. Validate for duplicate field_key before insert
  const { data: existing, error: fetchErr } = await supabase
    .from("student_fields")
    .select("id")
    .eq("field_key", cleanKey);
    
  if (fetchErr) throw new Error("Could not check duplicate keys: " + fetchErr.message);
  if (existing && existing.length > 0) {
    throw new Error(`The field key "${cleanKey}" already exists!`);
  }

  // 3. Perform Insert
  const { data, error } = await supabase.from('student_fields').insert([payload]).select();
  if (error) throw error;

  // 4. Log Admin Activity
  await supabase.from("activity_logs").insert([{
    action: "field_changed",
    description: `Admin added field: ${payload.field_name} (${payload.school_id ? 'Specific School' : 'Global'})`
  }]);

  return data[0];
}

// Toggle field activity with locked field safety checks
export async function toggleFieldActive(id, newState, isLocked) {
  if (isLocked) {
    throw new Error("OPERATION_DENIED: Locked core system fields cannot be modified or deactivated.");
  }
  const { error } = await supabase
    .from('student_fields')
    .update({ active: newState })
    .eq('id', id);
    
  if (error) throw error;
}
