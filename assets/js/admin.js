import { supabase } from "./auth.js";

async function loadStorageStats() {
  const statSchools  = document.getElementById("stat-schools");
  const statStudents = document.getElementById("stat-students");
  const statPhotos   = document.getElementById("stat-photos");
  const statToday    = document.getElementById("stat-today");
  const supabaseFill  = document.getElementById("supabase-storage-fill");
  const supabaseText  = document.getElementById("supabase-storage-text");
  const cloudinaryFill = document.getElementById("cloudinary-storage-fill");
  const cloudinaryText = document.getElementById("cloudinary-storage-text");
  const cleanupSelect  = document.getElementById("cleanup-school-select");

  if (!statSchools) return;

  try {
    // ── Schools Count & Options ──────────────────────────────
    const { data: schools, error: schErr } = await supabase
      .from("schools")
      .select("id, school_name, email");
    if (schErr) throw schErr;

    statSchools.textContent = schools ? schools.length : 0;

    if (cleanupSelect && schools) {
      cleanupSelect.innerHTML = '<option value="">Select School...</option>';
      schools.forEach(school => {
        const option = document.createElement("option");
        option.value = school.id;
        option.textContent = school.school_name || school.email || "Unnamed School";
        cleanupSelect.appendChild(option);
      });
    }

    // ── High Performance Students Count (No rows downloaded) ──
    const { count: totalStudents, error: stuErr } = await supabase
      .from("students")
      .select("id", { count: 'exact', head: true });
    if (stuErr) throw stuErr;

    statStudents.textContent = totalStudents || 0;

    // ── High Performance Photos Count ──────────────────────────
    const { count: photoCount, error: photoErr } = await supabase
      .from("students")
      .select("id", { count: 'exact', head: true })
      .not("photo_url", "is", null)
      .neq("photo_url", "");
    if (photoErr) throw photoErr;

    statPhotos.textContent = photoCount || 0;

    // ── High Performance Today's Count ───────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayCount, error: todayErr } = await supabase
      .from("students")
      .select("id", { count: 'exact', head: true })
      .gte("created_at", today.toISOString());
    if (todayErr) throw todayErr;

    if (statToday) statToday.textContent = todayCount || 0;

    // ── Database & Cloud Storage Estimates ────────────────────
    // Dynamic database storage estimate (average 0.75 KB per student record + metadata)
    const sizeMB = ((totalStudents || 0) * 0.75) / 1024;
    const displayMB = sizeMB < 0.01 ? "<0.01" : sizeMB.toFixed(2);
    const pctSupa = Math.min((sizeMB / 500) * 100, 100);
    if (supabaseFill) supabaseFill.style.width = Math.max(pctSupa, 0.5) + "%";
    if (supabaseText) supabaseText.innerText   = `${displayMB} MB / 500 MB`;

    // Dynamic Cloudinary assets estimate (average 0.5 MB per compressed photo)
    const cloudMB  = (photoCount || 0) * 0.5;
    const pctCloud = Math.min((cloudMB / 25000) * 100, 100);
    if (cloudinaryFill) cloudinaryFill.style.width = Math.max(pctCloud, 0.5) + "%";
    if (cloudinaryText) cloudinaryText.innerText   = `${cloudMB.toFixed(2)} MB / 25 GB`;

    // ── Activity Log feed ─────────────────────────────────────
    loadActivityLog();

  } catch (err) {
    console.error("Failed to load storage stats:", err.message);
  }
}

async function loadActivityLog() {
  const logEl = document.getElementById("activity-log");
  if (!logEl) return;
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, description, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      logEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem">No activity yet.</p>';
      return;
    }

    const icons = { school_created: "fa-school", student_added: "fa-user-plus", field_changed: "fa-list" };
    logEl.innerHTML = data.map(log => {
      const icon = icons[log.action] || "fa-info-circle";
      const time = log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '';
      return `<div style="display:flex; gap:0.75rem; padding:0.6rem 0; border-bottom:1px solid var(--border); align-items:flex-start;">
        <i class="fas ${icon}" style="color:var(--primary); margin-top:0.15rem; flex-shrink:0;"></i>
        <div>
          <span style="font-size:0.88rem">${log.description || log.action}</span>
          <small style="display:block; color:var(--text-muted); font-size:0.75rem">${time}</small>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    const logEl = document.getElementById("activity-log");
    if (logEl) logEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem">Activity log table not set up yet.</p>';
  }
}

window.deleteOldData = async function(days) {
  if (!confirm(`Delete ALL data older than ${days} days? This cannot be undone.`)) return;
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const { error } = await supabase.from("students").delete().lt("created_at", date.toISOString());
    if (error) throw error;
    alert("Old data deleted.");
    loadStorageStats();
  } catch(err) {
    alert("Failed: " + err.message);
  }
};

window.clearSchoolData = async function() {
  const schoolId = document.getElementById("cleanup-school-select").value;
  if (!schoolId) { alert("Please select a school first."); return; }
  if (!confirm("WIPE all student records for this school? This cannot be undone.")) return;
  try {
    const { error } = await supabase.from("students").delete().eq("school_id", schoolId);
    if (error) throw error;
    alert("School data cleared.");
    loadStorageStats();
  } catch(err) {
    alert("Failed: " + err.message);
  }
};

loadStorageStats();
