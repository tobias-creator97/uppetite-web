/* ============================================================
   UPPETITE LANDING PAGE — INTERACTIONS v3
   ============================================================ */

(function () {
  'use strict';

  // --- Supabase config ---
  var SUPABASE_URL = 'https://rqqebqspzzupznokoekh.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcWVicXNwenp1cHpub2tvZWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc5MDEsImV4cCI6MjA4NTIwMzkwMX0.krQwQ_5qTCxoyCsuFHo4oNNmm_Suv7Kdn36DaIDbzkg';

  // --- Nav scroll effect ---
  var nav = document.getElementById('nav');

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 32);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // --- Hero reveal on load ---
  var heroEls = document.querySelectorAll('.reveal-hero, .reveal-phone');
  requestAnimationFrame(function () {
    heroEls.forEach(function (el) { el.classList.add('visible'); });
  });

  // --- Scroll reveal (Intersection Observer) ---
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) { observer.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Email form → Supabase waitlist ---
  var form = document.getElementById('cta-form');
  var success = document.getElementById('cta-success');

  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var input = form.querySelector('input[type="email"]');
      var email = input ? input.value.trim() : '';
      if (!email) return;

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '...';
      }

      fetch(SUPABASE_URL + '/rest/v1/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email: email, source: 'landing_page' })
      })
      .then(function (res) {
        if (res.ok || res.status === 409) {
          // 409 = duplicate email, still show success
          form.hidden = true;
          success.hidden = false;
        } else {
          throw new Error('Status ' + res.status);
        }
      })
      .catch(function () {
        // Fallback: save locally and show success anyway
        try {
          var existing = JSON.parse(localStorage.getItem('uppetite_waitlist') || '[]');
          if (existing.indexOf(email) === -1) {
            existing.push(email);
            localStorage.setItem('uppetite_waitlist', JSON.stringify(existing));
          }
        } catch (_) {}

        form.hidden = true;
        success.hidden = false;
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
