(function () {
  'use strict';

  /* ── NAV SCROLL ─────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────── */
  (function markActive() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href && path.includes(href.replace('../', '').replace('.html', ''))) {
        if (href !== 'index.html' && href !== '../index.html') {
          a.classList.add('active');
        }
      }
    });
  })();

  /* ── HAMBURGER ──────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    function openMenu() {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('open') ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ── SCROLL REVEAL ──────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = parseFloat(entry.target.dataset.delay || 0);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => obs.observe(el));
  }

  /* ── CONTACT FORM ───────────────────────────── */
  /*
    APPS SCRIPT SETUP:
    1. Go to script.google.com → New project
    2. Paste this code:

       function doPost(e) {
         try {
           var d = JSON.parse(e.postData.contents);
           GmailApp.sendEmail(
             'soluciones@qunox.net',
             'QUNOX | Contacto: ' + d.nombre,
             'Nombre: '  + d.nombre  + '\n' +
             'Empresa: ' + (d.empresa||'—') + '\n' +
             'Email: '   + d.email   + '\n\n' +
             'Mensaje:\n' + d.mensaje
           );
           return ContentService
             .createTextOutput(JSON.stringify({status:'ok'}))
             .setMimeType(ContentService.MimeType.JSON);
         } catch(err) {
           return ContentService
             .createTextOutput(JSON.stringify({status:'error'}))
             .setMimeType(ContentService.MimeType.JSON);
         }
       }

    3. Deploy → New deployment → Web app
       Execute as: Me | Access: Anyone
    4. Copy the URL and replace APPS_SCRIPT_URL below
  */
  const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

  const form = document.getElementById('contact-form');
  const formBtn = document.getElementById('form-btn');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre  = form.nombre.value.trim();
      const empresa = form.empresa ? form.empresa.value.trim() : '';
      const email   = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();

      if (!nombre || !email) {
        alert('Por favor completa nombre y email.');
        return;
      }

      formBtn.disabled = true;
      formBtn.textContent = 'Enviando...';

      try {
        if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
          await new Promise(r => setTimeout(r, 800));
        } else {
          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, empresa, email, mensaje })
          });
        }
        form.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
      } catch {
        formBtn.disabled = false;
        formBtn.textContent = 'Enviar mensaje';
        alert('Error al enviar. Escríbenos a soluciones@qunox.net');
      }
    });
  }

})();
