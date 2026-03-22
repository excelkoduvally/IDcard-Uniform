/* ============================================================
   EXCEL ID CARDS & UNIFORMS — JavaScript
============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // NAVBAR — Scroll Effect & Active Link
  // ============================================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button
    const backToTop = document.getElementById('back-to-top');
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // Active nav link CSS
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active {
      background: rgba(255,255,255,0.18) !important;
      color: #fff !important;
    }
    .navbar.scrolled .nav-link.active {
      color: #25D366 !important;
      background: rgba(37,211,102,0.12) !important;
    }
  `;
  document.head.appendChild(style);

  // ============================================================
  // HAMBURGER MENU (Mobile)
  // ============================================================
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');

  hamburger.addEventListener('click', function () {
    navLinksContainer.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Close nav when a link is clicked
  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksContainer.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      navLinksContainer.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });

  // Hamburger animation CSS
  const hamStyle = document.createElement('style');
  hamStyle.textContent = `
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5.5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5.5px); }
  `;
  document.head.appendChild(hamStyle);

  // ============================================================
  // BACK TO TOP BUTTON
  // ============================================================
  const backToTopBtn = document.getElementById('back-to-top');
  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ============================================================
  // POPUP — 5 second delay
  // ============================================================
  const popupOverlay = document.getElementById('popup-overlay');
  const popupClose = document.getElementById('popup-close');
  const popupSkip = document.getElementById('popup-skip-btn');

  // Show popup only once per session
  if (!sessionStorage.getItem('popup_shown')) {
    setTimeout(function () {
      popupOverlay.classList.add('active');
      sessionStorage.setItem('popup_shown', 'true');
    }, 5000);
  }

  function closePopup() {
    popupOverlay.classList.remove('active');
  }

  popupClose.addEventListener('click', closePopup);
  popupSkip.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', function (e) {
    if (e.target === popupOverlay) closePopup();
  });

  // ============================================================
  // SMOOTH SCROLL for anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  // ============================================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ============================================================
  const animateElements = document.querySelectorAll(
    '.product-card, .why-card, .testimonial-card, .gallery-item, .bulk-mini-card, .contact-item, .bulk-trust-badge'
  );

  animateElements.forEach(el => {
    el.classList.add('animate-in');
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animateElements.forEach(el => observer.observe(el));

  // ============================================================
  // COUNTER ANIMATION for Hero Stats
  // ============================================================
  const counters = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  function animateCounter(el, target, suffix) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  const heroObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      animateCounter(counters[0], 500, '+');
      animateCounter(counters[1], 1, ' Million+');
      // Keep star rating static
    }
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) heroObserver.observe(heroStats);

  // ============================================================
  // GALLERY: Add scroll reveal with stagger
  // ============================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  galleryItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    galleryObserver.observe(item);
  });

  // ============================================================
  // FLOATING WA BUTTON — entrance animation
  // ============================================================
  setTimeout(() => {
    const floatWa = document.getElementById('float-wa');
    if (floatWa) {
      floatWa.style.animation = 'float-pulse 3s infinite';
    }
  }, 1000);

  // ============================================================
  // FEATURES CARD — Scroll reveal
  // ============================================================
  const featuresCard = document.querySelector('.features-card-inner');
  if (featuresCard) {
    featuresCard.style.opacity = '0';
    featuresCard.style.transform = 'translateY(40px)';
    featuresCard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

    const featuresObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        featuresCard.style.opacity = '1';
        featuresCard.style.transform = 'translateY(0)';
        featuresObserver.unobserve(entries[0].target);
      }
    }, { threshold: 0.2 });
    featuresObserver.observe(featuresCard);
  }

  // ============================================================
  // QUOTE SECTION — Scroll reveal
  // ============================================================
  const quoteSection = document.querySelector('.quote-grid');
  if (quoteSection) {
    quoteSection.style.opacity = '0';
    quoteSection.style.transform = 'translateY(30px)';
    quoteSection.style.transition = 'opacity 0.7s ease, transform 0.7s ease';

    const quoteObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        quoteSection.style.opacity = '1';
        quoteSection.style.transform = 'translateY(0)';
        quoteObserver.unobserve(entries[0].target);
      }
    }, { threshold: 0.15 });
    quoteObserver.observe(quoteSection);
  }

  // ============================================================
  // Console branding
  // ============================================================
  console.log('%c Excel ID Card & Uniforms', 'font-size: 18px; font-weight: bold; color: #16a34a;');
  console.log('%c School ID Card Manufacturer — Calicut, Kerala', 'font-size: 12px; color: #15803d;');
});

// ============================================================
// QUOTE FORM — Submit to WhatsApp (global function)
// ============================================================
function submitQuote() {
  const schoolName = document.getElementById('school-name').value.trim();
  const product = document.getElementById('product-select').value;

  let message = 'Hello, I need a quote';
  if (schoolName) message += ' for ' + schoolName;
  if (product) message += ' — Product: ' + product;
  message += '. Please share pricing details.';

  const encodedMessage = encodeURIComponent(message);
  window.open('https://wa.me/919995168026?text=' + encodedMessage, '_blank');
}

