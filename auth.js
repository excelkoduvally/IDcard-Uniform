import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON, ADMIN_EMAIL } from "./supabase-config.js";

// ── Supabase Client (shared across all pages) ──
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
export { ADMIN_EMAIL };

// ── Auth Guard: Check role and redirect accordingly ──
export async function guardPage(role) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    if (role !== 'public') window.location.href = "login.html";
    return null;
  }

  const isAdmin = user.email === ADMIN_EMAIL;

  if (role === 'public') {
    window.location.href = isAdmin ? "admin.html" : "upload.html";
    return null;
  }
  if (role === 'admin' && !isAdmin) {
    window.location.href = "upload.html";
    return null;
  }
  if (role === 'school' && isAdmin) {
    window.location.href = "admin.html";
    return null;
  }

  // Set UI display name
  document.querySelectorAll('.user-name-display').forEach(el => {
    el.textContent = user.email.split("@")[0].toUpperCase();
  });

  return user;
}

// ── Logout ──
window.handleLogout = async function () {
  await supabase.auth.signOut();
  window.location.href = "login.html";
};

// ── Login Page Logic ──
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  // If already logged in, redirect away
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    window.location.href = session.user.email === ADMIN_EMAIL ? "admin.html" : "upload.html";
  }

  function showAlert(msg, type = "error") {
    const el = document.getElementById("alert-box");
    if (!el) return;
    el.className = `alert alert-${type} show`;
    el.textContent = msg;
  }

  function setLoading(on) {
    loginBtn.disabled = on;
    const sp = document.getElementById("spinner");
    const bt = document.getElementById("btn-text");
    if (sp) sp.className = "spinner" + (on ? " show" : "");
    if (bt) bt.style.display = on ? "none" : "flex";
  }

  window.handleLogin = async function () {
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) { showAlert("Please enter your email and password."); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert(error.message);
      setLoading(false);
      return;
    }
    showAlert("Login successful! Redirecting…", "success");
    setTimeout(() => {
      window.location.href = data.user.email === ADMIN_EMAIL ? "admin.html" : "upload.html";
    }, 700);
  };

  document.addEventListener("keydown", e => { if (e.key === "Enter") window.handleLogin(); });
}
