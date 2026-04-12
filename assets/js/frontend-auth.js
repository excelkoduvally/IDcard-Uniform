import { supabase } from './auth.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // User is logged in
            let dashLink = "../backend/upload.html"; // Default school link
            
            // If they are an admin, redirect them to admin.html instead
            if(session.user.email === 'admin@excel.com' || session.user.email === 'excelkdly@gmail.com') {
                dashLink = "../backend/admin.html";
            }

            // Find EVERY link pointing to the login page (mobile, desktop, sticky menus, etc.)
            const loginLinks = document.querySelectorAll('a[href*="login.html"]');
            
            loginLinks.forEach(btn => {
                btn.href = dashLink;
                btn.innerHTML = '<i class="fas fa-user-circle"></i> Account';
            });
        }
    } catch (err) {
        console.error("Auth check failed:", err);
    }
});
