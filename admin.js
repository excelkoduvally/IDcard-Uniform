import { supabase } from "./auth.js";

async function loadDashboardStats() {
  const statSchools = document.getElementById("stat-schools");
  const statStudents = document.getElementById("stat-students");
  const statToday = document.getElementById("stat-today");

  if (!statSchools) return;

  try {
    // Total schools
    const { count: schoolsCount, error: schErr } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (schErr) throw schErr;
    statSchools.textContent = schoolsCount || 0;

    // Total students
    const { data: students, error: stuErr } = await supabase
      .from('students')
      .select('created_at');
    
    if (stuErr) throw stuErr;
    statStudents.textContent = students ? students.length : 0;

    // Filter today
    const today = new Date().toDateString();
    const todayCount = (students || []).filter(s => {
      if (!s.created_at) return false;
      return new Date(s.created_at).toDateString() === today;
    }).length;

    statToday.textContent = todayCount;

  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }
}

loadDashboardStats();
