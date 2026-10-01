/* ============================================================
   Polyglot Translate — upgrade.js
   Вау-ефекти: прелоадер, прогрес прокрутки, поява секцій,
   анімовані лічильники, 3D-нахил карток, кнопка «нагору».
   Ванільний JavaScript — залежностей немає.
   ============================================================ */

(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Прелоадер ---------- */
    function initPreloader() {
        var loader = document.getElementById('preloader');
        if (!loader) return;

        function hide() {
            loader.classList.add('is-hidden');
            setTimeout(function () { loader.remove(); }, 700);
        }

        if (document.readyState === 'complete') { hide(); }
        else {
            window.addEventListener('load', hide);
            setTimeout(hide, 2600);
        }
    }

    /* ---------- Прогрес прокрутки ---------- */
    function initProgress() {
        var bar = document.getElementById('scrollProgress');
        if (!bar) return;

        function update() {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var progress = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = 'scaleX(' + progress + ')';
        }

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();
    }

    /* ---------- Поява елементів при скролі ---------- */
    function initReveal() {
        if (reduceMotion) return;

        var targets = [];
        document.querySelectorAll('.page-section').forEach(function (section) {
            var head = section.querySelector(':scope > .container > .text-center');
            if (head) targets.push(head);
            section.querySelectorAll('.row > [class*="col"]').forEach(function (col) {
                targets.push(col);
            });
        });

        if (!targets.length || !('IntersectionObserver' in window)) return;

        targets.forEach(function (el, i) {
            el.classList.add('reveal');
            el.style.transitionDelay = (i % 6) * 70 + 'ms';
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Анімовані лічильники ---------- */
    function initCounters() {
        var numbers = document.querySelectorAll('.stat-number');
        if (!numbers.length || !('IntersectionObserver' in window)) return;

        function animate(el) {
            var original = el.textContent.trim();
            var match = original.match(/^(\d+)(.*)$/);
            if (!match) return;

            var target = parseInt(match[1], 10);
            var suffix = match[2];
            var duration = 1500;
            var start = null;

            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        numbers.forEach(function (el) { io.observe(el); });
    }

    /* ---------- 3D-нахил карток ---------- */
    function initTilt() {
        if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;

        var cards = document.querySelectorAll('.stat-card, #lang .lang-item');
        var MAX = 8;

        cards.forEach(function (card) {
            card.classList.add('tilt');

            card.addEventListener('pointermove', function (e) {
                var rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width - 0.5;
                var py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    'perspective(900px) rotateY(' + (px * MAX) + 'deg) rotateX(' + (-py * MAX) + 'deg)';
            });

            card.addEventListener('pointerleave', function () {
                card.style.transform = '';
            });
        });
    }

    /* ---------- Кнопка «нагору» ---------- */
    function initToTop() {
        var btn = document.getElementById('toTop');
        if (!btn) return;

        function onScroll() {
            btn.classList.toggle('is-visible', window.scrollY > 600);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Старт ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        initPreloader();
        initProgress();
        initReveal();
        initCounters();
        initTilt();
        initToTop();
    });
})();