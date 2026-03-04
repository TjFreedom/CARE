/* ============================================================
   CARE ESTHETICS DELAWARE — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- YEAR ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- HEADER SCROLL ----
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- MOBILE NAV TOGGLE ----
  const navToggle = document.getElementById('navToggle');
  const mainNav   = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav when clicking a non-dropdown link
    mainNav.querySelectorAll('.nav__link:not(.nav__link--dropdown)').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- MOBILE DROPDOWN TOGGLE ----
  document.querySelectorAll('.nav__link--dropdown').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = btn.closest('.nav__item--dropdown')?.querySelector('.dropdown');
      if (!dropdown) return;
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(dropdown.classList.contains('open')));
      }
    });
  });

  // ---- CLOSE DROPDOWN ON OUTSIDE CLICK ----
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item--dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  // ---- INTERSECTION OBSERVER — FADE UP ----
  const fadeEls = document.querySelectorAll(
    '.service-card, .testimonial-card, .about__card, .product-brand, .trust-item, .provider-card, .ba-card, .plan-card'
  );

  if ('IntersectionObserver' in window && fadeEls.length) {
    fadeEls.forEach(el => el.classList.add('fade-up'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  }

  // ---- SMOOTH SCROLL for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- ACTIVE NAV LINK ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link[href]').forEach(link => {
    const href = link.getAttribute('href').split('#')[0];
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ---- CONTACT FORM ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const origText = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulate form submission (replace with real endpoint)
      setTimeout(() => {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#22c55e';
        contactForm.reset();
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = origText;
          btn.style.background = '';
        }, 4000);
      }, 1200);
    });
  }

  // ---- BEFORE/AFTER FILTER ----
  const filterBtns = document.querySelectorAll('[data-filter]');
  const baCards    = document.querySelectorAll('[data-category]');

  if (filterBtns.length && baCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        baCards.forEach(card => {
          const match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // ---- RESIZE: reset mobile nav ----
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mainNav?.classList.contains('open')) {
      mainNav.classList.remove('open');
      navToggle?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

});
