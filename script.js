/* ═══════════════════════════════════════════════════════════════
   THE DEN — Interactive Scripts
   Fireflies, scroll reveals, navigation, parallax
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Fireflies ──────────────────────────────────────────────
  function createFireflies() {
    const container = document.querySelector('.fireflies');
    if (!container) return;

    const count = window.innerWidth < 768 ? 15 : 30;

    for (let i = 0; i < count; i++) {
      const firefly = document.createElement('div');
      firefly.classList.add('firefly');

      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 60; // mostly in the upper (forest) area
      const duration = Math.random() * 10 + 8;
      const delay = Math.random() * 10;
      const dx = (Math.random() - 0.5) * 150;
      const dy = (Math.random() - 0.5) * 100;

      firefly.style.cssText = `
        --size: ${size}px;
        --duration: ${duration}s;
        --delay: ${delay}s;
        --dx: ${dx}px;
        --dy: ${dy}px;
        left: ${x}%;
        top: ${y}%;
      `;

      // Alternate some fireflies to have ocean bioluminescent colors
      if (y > 50 || Math.random() > 0.7) {
        const colors = [
          { bg: '#44aaff', shadow: 'rgba(68, 170, 255, 0.4)' },
          { bg: '#22ffdd', shadow: 'rgba(34, 255, 221, 0.4)' },
          { bg: '#aa77ff', shadow: 'rgba(170, 119, 255, 0.4)' },
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        firefly.style.background = color.bg;
        firefly.style.boxShadow = `0 0 6px 2px ${color.shadow}, 0 0 20px 4px ${color.shadow.replace('0.4', '0.15')}`;
      }

      container.appendChild(firefly);
    }
  }

  // ── Scroll Reveal ──────────────────────────────────────────
  function initScrollReveal() {
    // Add reveal class to elements
    const revealSelectors = [
      '.section-header',
      '.about-portrait',
      '.about-text',
      '.about-details',
      '.writing-card',
      '.project-card',
      '.social-card',
      '.contact-message',
      '.section-cta',
    ];

    revealSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        el.classList.add('reveal');
        // Stagger cards
        if (index > 0 && (selector.includes('card'))) {
          el.classList.add(`reveal-delay-${Math.min(index, 4)}`);
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  // ── Header Scroll Effect ───────────────────────────────────
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      if (window.scrollY > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Mobile Navigation ──────────────────────────────────────
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      }
    });
  }

  // ── Smooth Scroll for Anchor Links ─────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 80; // header height
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ── Parallax on Hero Animals ───────────────────────────────
  function initParallax() {
    const animals = document.querySelectorAll('.animal');
    if (!animals.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;

      if (scrollY < maxScroll * 1.5) {
        animals.forEach((animal, i) => {
          const speed = 0.02 + i * 0.015;
          const y = scrollY * speed;
          const opacity = Math.max(0, 1 - scrollY / maxScroll);
          animal.style.transform = `translateY(${y}px)`;
          animal.style.opacity = opacity;
        });
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Cursor Glow Effect (Desktop only) ──────────────────────
  function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;

    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(122, 184, 146, 0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ── Active Nav Link Highlighting ───────────────────────────
  function initActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    createFireflies();
    initScrollReveal();
    initHeaderScroll();
    initMobileNav();
    initSmoothScroll();
    initParallax();
    initCursorGlow();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
