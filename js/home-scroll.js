// ================================================
// home-scroll.js — GSAP ScrollTrigger animations
// ES Module
// ================================================

const SERVICES = [
  {
    index: 0,
    titleLines: ['Soporte', 'Especializado'],
    copy: 'Soporte técnico especializado con tiempos de respuesta garantizados. Equipos certificados disponibles para entornos críticos.',
    tags: ['L3 Support', 'SLA garantizado', '24/7'],
    accent: '#4361EE',
    link: 'servicios/soporte-especializado.html',
    label: '01'
  },
  {
    index: 1,
    titleLines: ['Optimización', 'Estratégica'],
    copy: 'Análisis profundo de tu stack actual. Reducción de costos sin comprometer rendimiento. Resultados medibles en 90 días.',
    tags: ['Rightsizing', 'Reducción de costos', '90 días'],
    accent: '#00B4D8',
    link: 'servicios/optimizacion-estrategica.html',
    label: '02'
  },
  {
    index: 2,
    titleLines: ['Implementación', 'Avanzada'],
    copy: 'Despliegue de clusters de alta disponibilidad con metodología probada. Zero-downtime. Rollback garantizado.',
    tags: ['Zero-downtime', 'Alta disponibilidad', 'Rollback'],
    accent: '#7209B7',
    link: 'servicios/implementacion-avanzada.html',
    label: '03'
  },
  {
    index: 3,
    titleLines: ['Diseño', 'de DR'],
    copy: 'Arquitecturas de Disaster Recovery diseñadas para tu RTO/RPO específico. Drills documentados. Runbooks completos.',
    tags: ['RTO / RPO', 'Runbooks', 'Drills'],
    accent: '#4361EE',
    link: 'servicios/diseno-dr.html',
    label: '04'
  },
  {
    index: 4,
    titleLines: ['Estrategia', 'Multi-Cloud'],
    copy: 'Diseño e implementación de estrategias multi-cloud. Evita vendor lock-in. Optimiza costos entre proveedores.',
    tags: ['AWS / Azure / GCP', 'Sin vendor lock-in', 'Cost optimized'],
    accent: '#00B4D8',
    link: 'servicios/multi-cloud.html',
    label: '05'
  },
  {
    index: 5,
    titleLines: ['Red y', 'Ciberseguridad'],
    copy: 'Auditorías de seguridad, hardening Fortinet, segmentación de red. Tu perímetro, redefinido.',
    tags: ['Fortinet', 'Auditoría', 'Hardening'],
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
  gsap.from('.diagnostic__intro', {
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
      transformOrigin: 'right'
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

  // ── SERVICES: fluid scroll — single scrub timeline ──────────────────────
  // All content (title, copy, image) is pre-rendered in the DOM.
  // One GSAP timeline drives all opacity transitions, linked to scroll via scrub: 1.
  // This makes every transition feel physically tied to scroll position (no timed pauses).

  const segDur  = 10;   // timeline units per service
  const fadeDur = 1.5;  // fade-in / fade-out duration in timeline units
  const overlap = 1.0;  // units the next service fades in before the current finishes fading out

  // Set initial opacity: service 0 visible, everything else hidden
  gsap.set('.svc-title, .svc-copy, .svc-img', { opacity: 0 });
  gsap.set(['.svc-title[data-svc="0"]', '.svc-copy[data-svc="0"]', '.svc-img[data-svc="0"]'], { opacity: 1 });

  // Set initial accent + counter + accent bar width + pointer-events
  const _accentBar = document.getElementById('services-accent-bar');
  _accentBar.style.background = SERVICES[0].accent;
  _accentBar.style.width = '100%';
  document.getElementById('services-progress').style.background = SERVICES[0].accent;
  document.querySelector('.svc-copy[data-svc="0"]').style.pointerEvents = 'auto';

  // Build the content transition timeline
  const svcTL = gsap.timeline();

  // Service 0: already visible — only needs to fade OUT
  svcTL.to(
    ['.svc-title[data-svc="0"]', '.svc-copy[data-svc="0"]', '.svc-img[data-svc="0"]'],
    { opacity: 0, duration: fadeDur, ease: 'none' },
    segDur - fadeDur  // t = 8.5
  );

  // Services 1–5: fade in (with overlap), then fade out (except last)
  for (let i = 1; i <= 5; i++) {
    const fadeInAt  = i * segDur - overlap;               // overlaps previous by 1 unit
    const fadeOutAt = i * segDur + (segDur - fadeDur);    // t = i*10 + 8.5

    svcTL.to(
      [`.svc-title[data-svc="${i}"]`, `.svc-copy[data-svc="${i}"]`, `.svc-img[data-svc="${i}"]`],
      { opacity: 1, duration: fadeDur, ease: 'none' },
      fadeInAt
    );

    if (i < 5) {
      svcTL.to(
        [`.svc-title[data-svc="${i}"]`, `.svc-copy[data-svc="${i}"]`, `.svc-img[data-svc="${i}"]`],
        { opacity: 0, duration: fadeDur, ease: 'none' },
        fadeOutAt
      );
    }
  }

  // Extend timeline to 60 units so each service maps to exactly 1/6 of scroll range
  const _pad = { v: 0 };
  svcTL.to(_pad, { v: 1, duration: 0.01 }, 59.99);

  // Single ScrollTrigger: pins panel + drives content timeline + side-effects
  let _svcIdx = 0;
  ScrollTrigger.create({
    trigger: '#scene-services',
    start: 'top top',
    end: 'bottom bottom',
    pin: '#services-sticky-panel',
    pinSpacing: false,
    anticipatePin: 1,
    scrub: 1,
    animation: svcTL,
    onUpdate: self => {
      const idx = Math.min(5, Math.floor(self.progress * 6));
      document.getElementById('svc-current').textContent = String(idx + 1).padStart(2, '0');
      const accent = SERVICES[idx].accent;
      _accentBar.style.background = accent;
      document.getElementById('services-progress').style.background = accent;
      if (idx !== _svcIdx) {
        qunoxScene.setServiceMode(idx);
        _svcIdx = idx;
        // Update pointer-events so only the active service's link is clickable
        document.querySelectorAll('.svc-copy').forEach((el, i) => {
          el.style.pointerEvents = i === idx ? 'auto' : 'none';
        });
      }
    }
  });

  // Progress bar fill (separate — no animation, just height scrub)
  gsap.to('#services-progress', {
    scrollTrigger: {
      trigger: '#scene-services',
      start: 'top top', end: 'bottom bottom',
      scrub: 0.5
    },
    height: '100%', ease: 'none'
  });

  // ── BACKGROUND CURTAIN: scrub per segment ────
  // 700vh / 6 ≈ 116.67vh per service. Wipe completes in first 30% of segment (~35vh).
  const segVh = 700 / 6;
  const wipeVh = segVh * 0.3;

  for (let i = 1; i <= 5; i++) {
    gsap.fromTo(`.svc-bg[data-bg="${i}"]`,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: '#scene-services',
          start: `top+=${i * segVh}vh top`,
          end:   `top+=${i * segVh + wipeVh}vh top`,
          scrub: true
        }
      }
    );
  }

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

// ================================================
// Diagnostic: click-to-expand panel + auto slideshow
// ================================================

export function initDiagnosticInteractions() {
  const INFO_DATA = [
    {
      problem: 'Las inconsistencias entre entornos (desarrollo, staging, producción) causan bugs difíciles de reproducir, despliegues fallidos y ventanas de vulnerabilidad abiertas sin saberlo.',
      solution: 'Auditamos el stack completo e implementamos gestión centralizada con IaC (Ansible, Terraform). Cada cambio pasa por validación automática y control de versiones — sin configuraciones manuales.'
    },
    {
      problem: 'Instancias sobredimensionadas, licencias sin usar y workloads mal distribuidos generan costos innecesarios. Las empresas desperdician entre 30–40% de su presupuesto cloud sin saberlo.',
      solution: 'Realizamos análisis de rightsizing y consolidamos workloads. Ajustamos capacidades al uso real e implementamos auto-scaling para que el costo siga al consumo efectivo.'
    },
    {
      problem: 'Sin redundancia, un single point of failure puede paralizar operaciones completas. Una caída de un componente no debería detener el negocio, pero en arquitecturas frágiles así ocurre.',
      solution: 'Diseñamos arquitecturas de alta disponibilidad con redundancia en cada capa crítica. Implementamos load balancing, failover automático y eliminamos dependencias únicas antes de que fallen.'
    },
    {
      problem: 'Sin un plan de recuperación documentado, ante un desastre el tiempo de respuesta es impredecible. Sin RTO/RPO definidos, la continuidad operativa queda al azar.',
      solution: 'Definimos estrategias de Disaster Recovery con RTO y RPO específicos. Backups automatizados, runbooks detallados y drills periódicos que garantizan la recuperación cuando más importa.'
    }
  ];

  const items = document.querySelectorAll('.diag-item');
  if (!items.length) return;

  items.forEach((item, i) => {
    const panelInner = item.querySelector('.diag-item__panel-inner');
    if (!panelInner) return;

    const d = INFO_DATA[i];
    panelInner.innerHTML = `<p class="diag-panel__text">${d.problem}</p>`;

    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('expanded');
      items.forEach(it => it.classList.remove('expanded'));
      if (!isOpen) item.classList.add('expanded');
    });
  });

  // ── Auto-slideshow: 6 images, every 4 seconds ──
  const allImages = document.querySelectorAll('.diag-img');
  if (!allImages.length) return;

  const slideLabels = [
    { num: '01', text: 'Conflicto de configuración activo' },
    { num: '02', text: 'Recursos críticos al límite' },
    { num: '03', text: 'Arquitectura sin redundancia detectada' },
    { num: '04', text: 'Sin plan de recuperación definido' },
    { num: '05', text: 'Red sin segmentación detectada' },
    { num: '06', text: 'Monitoreo reactivo en lugar de proactivo' }
  ];

  const labelNum  = document.querySelector('.diag-vl-num');
  const labelText = document.querySelector('.diag-vl-text');
  let slideshowIdx = 0;

  function showSlide(idx) {
    allImages.forEach(img => img.classList.remove('active'));
    slideshowIdx = idx % allImages.length;
    allImages[slideshowIdx].classList.add('active');
    if (labelNum && labelText && slideLabels[slideshowIdx]) {
      labelNum.textContent  = slideLabels[slideshowIdx].num;
      labelText.textContent = slideLabels[slideshowIdx].text;
    }
  }

  showSlide(0);
  setInterval(() => showSlide(slideshowIdx + 1), 4000);
}
