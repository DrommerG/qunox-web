// ================================================
// home-scroll.js — GSAP ScrollTrigger animations
// ES Module
// ================================================

const SERVICES = [
  {
    index: 0,
    titleLines: ['Soporte', 'Especializado'],
    copy: 'Soporte técnico especializado con tiempos de respuesta garantizados. Equipos certificados disponibles para entornos críticos.',
    accent: '#4361EE',
    link: 'servicios/soporte-especializado.html',
    label: '01'
  },
  {
    index: 1,
    titleLines: ['Optimización', 'Estratégica'],
    copy: 'Análisis profundo de tu stack actual. Reducción de costos sin comprometer rendimiento. Resultados medibles en 90 días.',
    accent: '#00B4D8',
    link: 'servicios/optimizacion-estrategica.html',
    label: '02'
  },
  {
    index: 2,
    titleLines: ['Implementación', 'Avanzada'],
    copy: 'Despliegue de clusters de alta disponibilidad con metodología probada. Zero-downtime. Rollback garantizado.',
    accent: '#7209B7',
    link: 'servicios/implementacion-avanzada.html',
    label: '03'
  },
  {
    index: 3,
    titleLines: ['Diseño', 'de DR'],
    copy: 'Arquitecturas de Disaster Recovery diseñadas para tu RTO/RPO específico. Drills documentados. Runbooks completos.',
    accent: '#4361EE',
    link: 'servicios/diseno-dr.html',
    label: '04'
  },
  {
    index: 4,
    titleLines: ['Estrategia', 'Multi-Cloud'],
    copy: 'Diseño e implementación de estrategias multi-cloud. Evita vendor lock-in. Optimiza costos entre proveedores.',
    accent: '#00B4D8',
    link: 'servicios/multi-cloud.html',
    label: '05'
  },
  {
    index: 5,
    titleLines: ['Red y', 'Ciberseguridad'],
    copy: 'Auditorías de seguridad, hardening Fortinet, segmentación de red. Tu perímetro, redefinido.',
    accent: '#7209B7',
    link: 'servicios/red-ciberseguridad.html',
    label: '06'
  }
];

export function initScrollAnimations(qunoxScene) {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.config({
    fastScrollEnd: true,
    ignoreMobileResize: true
  });

  // ── NAV scrolled class ───────────────────────
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top-=80',
    onEnter:     () => document.getElementById('nav').classList.add('scrolled'),
    onLeaveBack: () => document.getElementById('nav').classList.remove('scrolled')
  });

  // ── HERO: initial entrance ───────────────────
  // Wrap each word's text in an inner span for clip-reveal
  document.querySelectorAll('.hero__headline .word').forEach(word => {
    const inner = document.createElement('span');
    inner.className = 'word-inner';
    inner.textContent = word.textContent;
    word.textContent = '';
    word.appendChild(inner);
  });

  const heroTL = gsap.timeline({ delay: 0.3 });

  heroTL
    .from('.hero__headline .word-inner', {
      y: '110%', duration: 1.0, stagger: 0.12, ease: 'power4.out'
    }, '-=0.6')
    .to('#hero-sub', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
    .to('#hero-scroll-hint', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');

  gsap.set('#hero-sub', { y: 20 });

  // ── HERO: camera push on scroll ─────────────
  ScrollTrigger.create({
    trigger: '#scene-hero',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.5,
    onUpdate: self => {
      qunoxScene.setCameraPush(self.progress);
      document.querySelector('.hero__grid-bg').style.opacity = 1 - self.progress;
      const op = Math.max(0, 1 - self.progress * 2.5);
      document.querySelector('.hero__copy').style.opacity = op;
    }
  });

  // ── DIAGNOSTIC: scan reveals ─────────────────
  gsap.from('.diagnostic__header', {
    scrollTrigger: { trigger: '#scene-diagnostic', start: 'top 75%', toggleActions: 'play none none reverse' },
    opacity: 0, y: 20, duration: 0.6, ease: 'power3.out'
  });

  const diagImageLabels = [
    'Conflicto de configuración activo',
    'Recursos críticos al límite',
    'Arquitectura sin redundancia detectada',
    'Sin plan de recuperación definido'
  ];

  document.querySelectorAll('.diag-item').forEach((item, i) => {
    const scanline = item.querySelector('.diag-item__scanline');
    gsap.to(scanline, {
      scrollTrigger: {
        trigger: '#scene-diagnostic',
        start: `top ${70 - i * 5}%`,
        toggleActions: 'play none none reverse'
      },
      scaleX: 0,
      duration: 0.9,
      delay: i * 0.18,
      ease: 'power4.inOut',
      transformOrigin: 'right',
      onComplete: () => {
        // Switch diagnostic image
        document.querySelectorAll('.diag-img').forEach(img => img.classList.remove('active'));
        const activeImg = document.querySelector(`.diag-img[data-idx="${i}"]`);
        if (activeImg) activeImg.classList.add('active');
        // Update label
        const numEl  = document.querySelector('.diag-vl-num');
        const textEl = document.querySelector('.diag-vl-text');
        if (numEl)  numEl.textContent  = String(i + 1).padStart(2, '0');
        if (textEl) textEl.textContent = diagImageLabels[i];
      }
    });
    const badge = item.querySelector('.diag-item__status');
    if (badge) {
      gsap.from(badge, {
        scrollTrigger: {
          trigger: '#scene-diagnostic',
          start: `top ${70 - i * 5}%`,
          toggleActions: 'play none none reverse'
        },
        scale: 0.8, opacity: 0, duration: 0.4,
        delay: i * 0.18 + 0.7,
        ease: 'back.out(2)'
      });
    }
  });

  gsap.to('#diag-progress', {
    scrollTrigger: {
      trigger: '#scene-diagnostic',
      start: 'top 60%', end: 'bottom 40%',
      scrub: 1
    },
    width: '100%', ease: 'none'
  });

  const statuses = ['ANALYZING', 'PROCESSING', 'FLAGGING', 'COMPLETE'];
  const statusEl = document.getElementById('diag-status');
  ScrollTrigger.create({
    trigger: '#scene-diagnostic',
    start: 'top 60%', end: 'bottom 40%',
    onUpdate: self => {
      if (!statusEl) return;
      const idx = Math.min(statuses.length - 1, Math.floor(self.progress * statuses.length));
      statusEl.textContent = statuses[idx];
    }
  });

  ScrollTrigger.create({
    trigger: '#scene-diagnostic',
    start: 'top 80%', end: 'bottom 20%',
    scrub: 2,
    onUpdate: self => qunoxScene.setDistortion(self.progress),
    onLeave: ()     => qunoxScene.setDistortion(0)
  });

  // ── SERVICES: sticky pin ─────────────────────
  ScrollTrigger.create({
    trigger: '#scene-services',
    start: 'top top',
    end: 'bottom bottom',
    pin: '#services-sticky-panel',
    pinSpacing: false,
    anticipatePin: 1
  });

  gsap.to('#services-progress', {
    scrollTrigger: {
      trigger: '#scene-services',
      start: 'top top', end: 'bottom bottom',
      scrub: 0.5
    },
    height: '100%', ease: 'none'
  });

  // ── SERVICE TRANSITIONS ──────────────────────
  let currentSvcIdx = -1;

  const INIT_CLIP = 'inset(100% 0% 0% 0%)';
  const DONE_CLIP = 'inset(0% 0% 0% 0%)';

  function transitionToService(newIdx, oldIdx) {
    const svc = SERVICES[newIdx];
    const dir  = newIdx > (oldIdx ?? -1) ? 1 : -1;

    // Counter
    document.getElementById('svc-current').textContent =
      String(newIdx + 1).padStart(2, '0');

    // Kill all title tweens and reset every title — prevents overlap on fast scroll
    document.querySelectorAll('.svc-title').forEach(t => {
      gsap.killTweensOf(t);
      t.classList.remove('active');
      gsap.set(t, { clearProps: 'all' });
    });

    const newTitle = document.querySelector(`.svc-title[data-svc="${newIdx}"]`);
    gsap.set(newTitle, { y: dir * 60, opacity: 0 });
    newTitle.classList.add('active');
    gsap.to(newTitle, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });

    // Image clip-path reveal
    const oldImg = oldIdx >= 0 ? document.querySelector(`.svc-img[data-svc="${oldIdx}"]`) : null;
    const newImg = document.querySelector(`.svc-img[data-svc="${newIdx}"]`);
    const frame  = document.getElementById('services-image-frame');

    if (oldImg) gsap.to(oldImg, { opacity: 0, duration: 0.3, ease: 'power2.in' });

    gsap.fromTo(frame,
      { clipPath: INIT_CLIP },
      {
        clipPath: DONE_CLIP, duration: 1.0, ease: 'power4.out',
        onStart: () => {
          if (newImg) { newImg.style.opacity = 1; newImg.classList.add('active'); }
          if (oldImg) oldImg.classList.remove('active');
        }
      }
    );

    gsap.fromTo('#services-image-inner',
      { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'power3.out' }
    );

    // Copy text
    const copyEl = document.getElementById('services-copy-text');
    const linkEl = document.getElementById('services-link');

    gsap.to([copyEl, linkEl], {
      opacity: 0, y: 12, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        copyEl.textContent = svc.copy;
        linkEl.href = svc.link;
        gsap.to([copyEl, linkEl], { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
      }
    });

    // Accent bar
    const bar = document.getElementById('services-accent-bar');
    bar.style.background = svc.accent;
    gsap.fromTo(bar,
      { width: '0%' },
      { width: '100%', duration: 0.9, ease: 'power4.out', transformOrigin: 'left' }
    );

    // Progress indicator color
    document.getElementById('services-progress').style.background = svc.accent;

    // Three.js
    qunoxScene.setServiceMode(newIdx);
  }

  // Scroll watcher
  ScrollTrigger.create({
    trigger: '#scene-services',
    start: 'top top', end: 'bottom bottom',
    onUpdate: self => {
      const newIdx = Math.min(5, Math.floor(self.progress * 6));
      if (newIdx !== currentSvcIdx) {
        transitionToService(newIdx, currentSvcIdx);
        currentSvcIdx = newIdx;
      }
    }
  });

  // First service on enter
  ScrollTrigger.create({
    trigger: '#scene-services',
    start: 'top 80%',
    once: true,
    onEnter: () => transitionToService(0, -1)
  });

  // ── CLOSING ──────────────────────────────────
  gsap.set('.closing__actions', { y: 20 });

  const closingTL = gsap.timeline({
    scrollTrigger: {
      trigger: '#scene-closing',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    }
  });

  closingTL
    .to('.closing__eyebrow',   { opacity: 1, duration: 0.5, ease: 'power2.out' })
    .from('.closing__headline',{ y: 40, duration: 1.0, ease: 'power4.out' }, '-=0.2')
    .to('.closing__headline',  { opacity: 1, duration: 0.8, ease: 'power2.out' }, '<')
    .to('.closing__body',      { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .to('.closing__actions',   { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }, '-=0.2');

  ScrollTrigger.create({
    trigger: '#scene-closing',
    start: 'top 80%',
    once: true,
    onEnter: () => qunoxScene.setClosingMode()
  });

  // Refresh after fonts
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  // Debounced resize refresh
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
}
