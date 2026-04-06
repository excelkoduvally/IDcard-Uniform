import { supabase } from './auth.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Select the desktop and mobile login buttons using their specific classes
    const desktopBtn = document.querySelector('.nav-login-btn');
    const mobileBtn = document.querySelector('.mobile-login-item a');

    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // User is logged in
            let dashLink = "../backend/upload.html"; // Default school link
            // If they are an admin, redirect them to admin.html instead
            if(session.user.email === 'admin@excel.com' || session.user.email === 'excelkdly@gmail.com') {
                dashLink = "../backend/admin.html";
            }

            if(desktopBtn) {
                desktopBtn.href = dashLink;
                desktopBtn.innerHTML = '<i class="fas fa-user-circle"></i> Account';
                desktopBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                desktopBtn.style.border = '1px solid rgba(255, 255, 255, 0.6)';
            }

            if(mobileBtn) {
                mobileBtn.href = dashLink;
                mobileBtn.innerHTML = '<i class="fas fa-user-circle"></i> My Account';
                mobileBtn.style.color = '#1FA971'; // Theme secondary green
            }
        }
    } catch (err) {
        console.error("Auth check failed:", err);
    }
});
