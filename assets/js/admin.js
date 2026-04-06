import { supabase } from "./auth.js";

async function loadStorageStats() {
  const statSchools = document.getElementById("stat-schools");
  const statStudents = document.getElementById("stat-students");
  const statPhotos = document.getElementById("stat-photos");
  const supabaseFill = document.getElementById("supabase-storage-fill");
  const supabaseText = document.getElementById("supabase-storage-text");
  const cloudinaryFill = document.getElementById("cloudinary-storage-fill");
  const cloudinaryText = document.getElementById("cloudinary-storage-text");
  const cleanupSelect = document.getElementById("cleanup-school-select");

  if (!statSchools) return;

  try {
    // 1. Fetch Schools
    const { data: schools, error: schErr } = await supabase
      .from("schools")
      .select("id, school_name");
      
    if (schErr) throw schErr;
    statSchools.textContent = schools ? schools.length : 0;

    // Populate dropdown
    if (cleanupSelect && schools) {
      cleanupSelect.innerHTML = '<option value="">Select School...</option>';
      schools.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.school_name || s.id;
        cleanupSelect.appendChild(opt);
      });
    }

    // 2. Fetch Students
    const { data: students, error: stuErr } = await supabase
      .from("students")
      .select("photo_url, student_data, name");

    if (stuErr) throw stuErr;
    statStudents.textContent = students ? students.length : 0;

    // 3. Count Photos
    const photos = (students || []).filter(s => s.photo_url);
    statPhotos.textContent = photos.length;

    // 4. Estimate Database Storage (Supabase)
    let stringifiedData = JSON.stringify(students || []);
    let sizeMB = stringifiedData.length / 1024 / 1024;
    let displayMB = sizeMB > 0 && sizeMB < 0.01 ? "< 0.01" : sizeMB.toFixed(2);
    
    const limitSupabase = 500;
    const percentSupabase = Math.min((sizeMB / limitSupabase) * 100, 100);

    if (supabaseFill) supabaseFill.style.width = Math.max(percentSupabase, 0.5) + "%";
    if (supabaseText) supabaseText.innerText = displayMB + " MB / 500 MB used";

    // 5. Estimate Media Storage (Cloudinary)
    // Assuming an average of 500KB per photo uploaded
    const cloudinarySizeMB = photos.length * 0.5;
    const limitCloudinary = 25000; // 25GB
    const percentCloudinary = Math.min((cloudinarySizeMB / limitCloudinary) * 100, 100);

    if (cloudinaryFill) cloudinaryFill.style.width = Math.max(percentCloudinary, 0.5) + "%";
    if (cloudinaryText) cloudinaryText.innerText = cloudinarySizeMB.toFixed(2) + " MB / 25 GB used";

  } catch (err) {
    console.error("Failed to load storage stats:", err);
  }
}

window.deleteOldData = async function(days) {
  if(!confirm(`Are you sure you want to delete ALL data older than ${days} days?`)) return;
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const { error } = await supabase
      .from("students")
      .delete()
      .lt("created_at", date.toISOString());

    if(error) throw error;
    alert("Old data deleted successfully.");
    loadStorageStats();
  } catch(err) {
    alert("Failed to delete old data: " + err.message);
  }
}

window.clearSchoolData = async function() {
  const schoolId = document.getElementById("cleanup-school-select").value;
  if(!schoolId) {
    alert("Please select a school first.");
    return;
  }
  if(!confirm("Are you incredibly sure you want to WIPE all student records for this school?")) return;

  try {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("school_id", schoolId);

    if(error) throw error;
    alert("School data cleared successfully.");
    document.getElementById("cleanup-school-select").value = "";
    loadStorageStats();
  } catch(err) {
    alert("Failed to clear data: " + err.message);
  }
}

loadStorageStats();

