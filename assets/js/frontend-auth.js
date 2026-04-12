import { supabase } from './auth.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Select the desktop and mobile login buttons using their new IDs
    const desktopBtn = document.getElementById('accountBtn');
    const mobileBtn = document.getElementById('mobileLoginBtn');

    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // User is logged in
            let dashLink = "../backend/upload.html"; // Default school link
            
            // If they are an admin, redirect them to admin.html instead
            if(session.user.email === 'admin@excel.com' || session.user.email === 'excelkdly@gmail.com') {
                dashLink = "../backend/admin.html";
            }

            // Update Desktop menu
            if(desktopBtn) {
                desktopBtn.href = dashLink;
                desktopBtn.innerHTML = '<i class="fas fa-user-circle"></i> Account';
            }

            // Update Mobile menu
            if(mobileBtn) {
                mobileBtn.href = dashLink;
                mobileBtn.innerHTML = '<i class="fas fa-user-circle"></i> Account';
            }
        }
    } catch (err) {
        console.error("Auth check failed:", err);
    }
});
