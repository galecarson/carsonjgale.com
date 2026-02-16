/* ═══════════════════════════════════════════════════════════════
   THE DEN — Amazon Rainforest Interactive Scripts
   Mouse-tracking tilt, parallax, fireflies, scroll reveals
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Shared State ─────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  let smoothMouseX = 0, smoothMouseY = 0;
  const animals = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // ── Fireflies ──────────────────────────────────────────────
  function createFireflies() {
    const container = document.querySelector('.fireflies');
    if (!container) return;

    const count = window.innerWidth < 768 ? 12 : 25;

    for (let i = 0; i < count; i++) {
      const firefly = document.createElement('div');
      firefly.classList.add('firefly');

      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
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

      // Give some fireflies bioluminescent water colors
      if (Math.random() > 0.6) {
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
        if (index > 0 && selector.includes('card')) {
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

    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });

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
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ── Active Nav Link Highlighting ───────────────────────────
  function initActiveNav() {
    const sections = document.querySelectorAll('.env-layer[id]');
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

  // ── Parallax on Scroll ─────────────────────────────────────
  // Uses CSS custom properties so parallax composes with idle animations
  function initParallax() {
    if (reducedMotion) return;

    const animalEls = document.querySelectorAll('.animal');
    if (!animalEls.length) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;

      animalEls.forEach((animal, i) => {
        // Each animal scrolls at slightly different rate
        const speed = 0.015 + i * 0.008;
        const section = animal.closest('.env-layer');
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const relativeScroll = scrollY - sectionTop;

        // Only apply parallax when section is visible
        if (relativeScroll > -maxScroll && relativeScroll < sectionHeight + maxScroll) {
          const y = relativeScroll * speed;
          const opacity = Math.max(0.2, 1 - Math.abs(relativeScroll) / (sectionHeight * 1.5));
          animal.style.setProperty('--parallax-y', `${y}px`);
          animal.style.opacity = opacity;
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Mouse Tracking + 3D Tilt + Cursor Glow ─────────────────
  function initMouseTracking() {
    if (isTouch || reducedMotion) return;

    // Cursor glow
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(94, 184, 112, 0.035) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(glow);

    // Collect animal data
    const animalEls = document.querySelectorAll('.animal');
    animalEls.forEach((el) => {
      const svg = el.querySelector('.animal-svg');
      const tiltMax = parseFloat(el.dataset.tilt) || 10;
      animals.push({
        el,
        svg,
        tiltMax,
        currentRotateX: 0,
        currentRotateY: 0,
        rect: el.getBoundingClientRect(),
      });
    });

    // Track mouse
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Recalculate bounding rects on scroll/resize (debounced)
    let recalcTimeout;
    function recalcRects() {
      clearTimeout(recalcTimeout);
      recalcTimeout = setTimeout(() => {
        animals.forEach((a) => {
          a.rect = a.el.getBoundingClientRect();
        });
      }, 150);
    }
    window.addEventListener('scroll', recalcRects, { passive: true });
    window.addEventListener('resize', recalcRects, { passive: true });

    // Unified animation loop
    const INTERACTION_RADIUS = 350;
    const LERP = 0.08;

    function animate() {
      // Smooth mouse position
      smoothMouseX += (mouseX - smoothMouseX) * LERP;
      smoothMouseY += (mouseY - smoothMouseY) * LERP;

      // Update cursor glow
      glow.style.left = smoothMouseX + 'px';
      glow.style.top = smoothMouseY + 'px';

      // Update each animal
      animals.forEach((a) => {
        const rect = a.rect;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = smoothMouseX - centerX;
        const dy = smoothMouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetRotateX = 0;
        let targetRotateY = 0;

        if (distance < INTERACTION_RADIUS) {
          // Within radius: compute tilt
          const intensity = 1 - (distance / INTERACTION_RADIUS);
          // Tilt toward the mouse
          targetRotateY = (dx / INTERACTION_RADIUS) * a.tiltMax * intensity;
          targetRotateX = -(dy / INTERACTION_RADIUS) * a.tiltMax * intensity;

          if (!a.el.classList.contains('mouse-near')) {
            a.el.classList.add('mouse-near');
          }
        } else {
          if (a.el.classList.contains('mouse-near')) {
            a.el.classList.remove('mouse-near');
          }
        }

        // Lerp the rotation
        a.currentRotateX += (targetRotateX - a.currentRotateX) * LERP;
        a.currentRotateY += (targetRotateY - a.currentRotateY) * LERP;

        // Apply 3D transform to inner SVG (preserves outer idle animations)
        if (a.svg) {
          a.svg.style.transform =
            `rotateX(${a.currentRotateX.toFixed(2)}deg) rotateY(${a.currentRotateY.toFixed(2)}deg)`;
        }
      });

      requestAnimationFrame(animate);
    }

    // Start the loop
    animate();

    // Initial rect calculation after layout settles
    requestAnimationFrame(() => {
      animals.forEach((a) => {
        a.rect = a.el.getBoundingClientRect();
      });
    });
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    createFireflies();
    initScrollReveal();
    initHeaderScroll();
    initMobileNav();
    initSmoothScroll();
    initActiveNav();
    initParallax();
    initMouseTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
