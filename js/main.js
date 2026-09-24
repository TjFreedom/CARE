/* Care Esthetics Delaware: navigation, gallery, and optional analytics hooks. */
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.getElementById('header');
  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const dropdownButtons = document.querySelectorAll('.nav__link--dropdown');
  const closeDropdowns = () => {
    dropdownButtons.forEach(button => {
      button.setAttribute('aria-expanded', 'false');
      document.getElementById(button.getAttribute('aria-controls'))?.classList.remove('open');
    });
  };
  const closeNav = () => {
    nav?.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.documentElement.style.removeProperty('--mobile-nav-top');
    closeDropdowns();
  };
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      if (nav.classList.contains('open')) return closeNav();
      nav.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.documentElement.style.setProperty('--mobile-nav-top', `${Math.max(header?.getBoundingClientRect().bottom || 0, 0)}px`);
      document.body.style.overflow = 'hidden';
    });
    nav.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', closeNav));
  }
  dropdownButtons.forEach(button => button.addEventListener('click', () => {
    const dropdown = document.getElementById(button.getAttribute('aria-controls'));
    if (!dropdown) return;
    const open = button.getAttribute('aria-expanded') !== 'true';
    closeDropdowns();
    dropdown.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav__item--dropdown')) closeDropdowns();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (nav?.classList.contains('open')) { closeNav(); navToggle?.focus(); }
    else {
      const expanded = document.querySelector('.nav__link--dropdown[aria-expanded="true"]');
      closeDropdowns();
      expanded?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNav();
  });

  const normalizedPath = path => path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const currentPath = normalizedPath(window.location.pathname);
  document.querySelectorAll('.nav__link[href]').forEach(link => {
    const active = normalizedPath(new URL(link.href).pathname) === currentPath;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  dropdownButtons.forEach(button => button.classList.toggle('active', currentPath === '/services' || currentPath.startsWith('/services/')));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.service-card, .testimonial-card, .about__card, .product-brand, .trust-item, .provider-card, .ba-card, .plan-card').forEach(el => {
      el.classList.add('fade-up'); observer.observe(el);
    });
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  filterButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      filterButtons.forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active); other.setAttribute('aria-pressed', String(active));
      });
      const filter = button.dataset.filter;
      cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
    });
  });

  // These hooks use an EXISTING dataLayer only. They do not load analytics,
  // transmit form values, or classify clicks/attempts as completed leads.
  const track = (event, location) => {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, link_location: location });
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const location = link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : 'content';
    if (link.getAttribute('href').startsWith('tel:')) track('care_phone_click', location);
    if (link.hostname === 'asvwy.myaestheticrecord.com') track('care_booking_click', location);
  });
  // Native Netlify POST handles validation and delivery; no simulated success.
  document.querySelector('form[name="contact"]')?.addEventListener('submit', () => {
    track('care_contact_submit_attempt', 'contact_form');
  });
});
