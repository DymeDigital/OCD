// THE ORDER LEDGER — shared interaction layer.
// Ink draw-on reveals, tick-selection rows, and the stamped form flow.

(function () {
  'use strict';

  // Reveal-on-scroll: one authored moment (ink draw-on), not per-element novelty.
  var revealTargets = document.querySelectorAll('.reveal');
  if (revealTargets.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Tally: a ledger figure totting itself up once, the moment it enters view.
  var tallyTargets = document.querySelectorAll('[data-tally]');
  if (tallyTargets.length && 'IntersectionObserver' in window) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var tallyIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tallyIo.unobserve(entry.target);
          var el = entry.target;
          var target = parseInt(el.dataset.tally, 10);
          var prefix = el.dataset.tallyPrefix || '';
          var suffix = el.dataset.tallySuffix || '';
          if (reduceMotion || !target) {
            el.textContent = prefix + target.toLocaleString('en-ZA') + suffix;
            return;
          }
          var start = performance.now();
          var duration = 900;
          var step = function (now) {
            var t = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - t, 3);
            var value = Math.round(target * eased);
            el.textContent = prefix + value.toLocaleString('en-ZA') + suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );
    tallyTargets.forEach(function (el) { tallyIo.observe(el); });
  }

  // Tick rows that expand a detail field when checked (e.g. "Cake Pop Colour & Theme").
  document.querySelectorAll('.tick-row').forEach(function (row) {
    var checkbox = row.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    var sync = function () { row.classList.toggle('is-open', checkbox.checked); };
    checkbox.addEventListener('change', sync);
    sync();
  });

  // Ledger order forms: client-side validation + stamped confirmation.
  // No backend is wired up yet (see PRODUCT.md — CMS/email delivery is a
  // deliberate next step, not an oversight); this proves the flow for the demo.
  document.querySelectorAll('[data-ledger-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var valid = true;
      var firstInvalid = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        if (!field) return;
        var filled = input.type === 'checkbox' ? input.checked : input.value.trim().length > 0;
        field.classList.toggle('is-error', !filled);
        field.classList.toggle('is-valid', filled);
        if (!filled) {
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var panel = document.querySelector(form.dataset.ledgerForm);
      if (panel) {
        form.setAttribute('hidden', '');
        panel.hidden = false;
        var stamp = panel.querySelector('.stamp');
        if (stamp) {
          // restart the impact animation even if this fires more than once
          stamp.classList.remove('stamp--confirm');
          void stamp.offsetWidth;
          stamp.classList.add('stamp--confirm');
        }
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
})();
