(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // ---------- mobile nav ----------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement;
      if (window.innerWidth <= 1020 && li.classList.contains('has-sub') && a === li.firstElementChild) {
        e.preventDefault(); li.classList.toggle('open'); return;
      }
      nav.classList.remove('open');
    });
  });

  // ---------- slide-out quote panel ----------
  var panel = document.getElementById('quote-panel'), bg = document.getElementById('panel-bg'),
      hint = document.getElementById('quote-hint');
  function openPanel(e) { if (e) e.preventDefault(); panel.classList.add('open'); bg.classList.add('open'); hint.hidden = true; }
  function closePanel() { panel.classList.remove('open'); bg.classList.remove('open'); }
  $('[data-open-quote]').forEach(function (b) { b.addEventListener('click', openPanel); });
  bg.addEventListener('click', closePanel);
  document.querySelector('.panel-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
  hint.querySelector('.x').addEventListener('click', function () { hint.hidden = true; });
  setTimeout(function () { if (!panel.classList.contains('open')) hint.hidden = false; }, 2500);

  // ---------- forms ----------
  function valid(scope) {
    var ok = true;
    $('[required]', scope).forEach(function (f) {
      var bad = !f.value.trim(); f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    return ok;
  }
  var form = document.getElementById('quote');
  var s1 = form.querySelector('.step-1'), s2 = form.querySelector('.step-2'), done = form.querySelector('.step-done');
  var bar = document.getElementById('progress-bar');
  document.getElementById('next').addEventListener('click', function () {
    if (!valid(s1)) return; s1.hidden = true; s2.hidden = false; bar.style.width = '60%';
  });
  document.getElementById('back').addEventListener('click', function () {
    s2.hidden = true; s1.hidden = false; bar.style.width = '18%';
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!valid(s2)) return;
    s2.hidden = true; done.hidden = false; bar.style.width = '100%';
    // TODO: connect to your form handler / CRM here
  });
  var cf = document.getElementById('contact-form');
  cf.addEventListener('submit', function (e) {
    e.preventDefault(); if (!valid(cf)) return;
    cf.querySelector('.form-ok').hidden = false;
    // TODO: connect to your form handler / CRM here
  });

  // ---------- sliders ----------
  function slider(trackId, prevId, nextId, step) {
    var t = document.getElementById(trackId);
    document.getElementById(nextId).addEventListener('click', function () { t.scrollBy({ left: step(t), behavior: 'smooth' }); });
    document.getElementById(prevId).addEventListener('click', function () { t.scrollBy({ left: -step(t), behavior: 'smooth' }); });
    return t;
  }
  var pf = slider('pf-track', 'pf-prev', 'pf-next', function (t) { return t.clientWidth + 20; });
  slider('team-track', 'tm-prev', 'tm-next', function (t) { return t.firstElementChild.offsetWidth + 22; });
  if (!reduce) {
    setInterval(function () {
      if (pf.matches(':hover')) return;
      var end = pf.scrollLeft + pf.clientWidth >= pf.scrollWidth - 4;
      pf.scrollTo({ left: end ? 0 : pf.scrollLeft + pf.clientWidth + 20, behavior: 'smooth' });
    }, 5000);
  }

  // ---------- hero slider ----------
  (function () {
    var box = document.getElementById('hero-slider'), slides = $('.slide', box), dots = document.getElementById('hero-dots'), cur = 0, timer;
    slides.forEach(function (_, i) {
      var b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (i + 1));
      b.addEventListener('click', function () { show(i); restart(); }); dots.appendChild(b);
    });
    function show(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === cur); });
      $('button', dots).forEach(function (b, i) { b.classList.toggle('on', i === cur); });
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1); }, 4500); }
    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (sx === null) return; var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) { show(cur + (d < 0 ? 1 : -1)); restart(); } sx = null; });
    show(0); restart();
  })();

  // ---------- hero entrance ----------
  var hero = document.querySelector('.hero');
  $('.hero-copy > *').forEach(function (e, i) { e.style.setProperty('--i', i); });
  function go() { hero.classList.add('loaded'); }
  window.addEventListener('load', go); setTimeout(go, 600);

  // ---------- reveal on scroll ----------
  [['.s-card', 0], ['.pillar', 0], ['.brand', 0], ['.r-card', 0], ['.stat', 0], ['.photo-pill', 0], ['.locs li', 0]].forEach(function (g) {
    $(g[0]).forEach(function (el, i) { el.setAttribute('data-reveal', ''); el.style.setProperty('--d', (i % 4) * 0.12 + 's'); });
  });
  $('.split-head > div, .pf-text, .about-text, .areas-text, .contact-text').forEach(function (e) { e.setAttribute('data-reveal', 'left'); });
  $('.split-head > p, .pf-slider, .team, .contact-form, .map-card').forEach(function (e) { e.setAttribute('data-reveal', 'right'); });
  $('.cta-inner, .brands .center, details, .small-note, .test-head').forEach(function (e, i) { e.setAttribute('data-reveal', ''); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $('[data-reveal]').forEach(function (e) { io.observe(e); });

  // ---------- count-up ----------
  $('[data-count]').forEach(function (el) {
    if (reduce) return;
    var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1500;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  // ---------- scroll loop ----------
  var progress = document.getElementById('scroll-progress'), header = document.querySelector('.site-header'),
      heroImg = document.getElementById('hero-slider'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (!reduce && y < 900) heroImg.style.setProperty('--py', (y * 0.08) + 'px');
    header.classList.toggle('hide', y > lastY && y > 500 && !nav.classList.contains('open'));
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
