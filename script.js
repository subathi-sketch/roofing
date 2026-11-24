(function () {
  // mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement;
      if (window.innerWidth <= 960 && li.classList.contains('has-sub') && a === li.firstElementChild) {
        e.preventDefault();
        li.classList.toggle('open');
        return;
      }
      nav.classList.remove('open');
    });
  });

  // photo strip arrows
  var strip = document.getElementById('strip');
  document.querySelector('.strip-btn.next').addEventListener('click', function () {
    strip.scrollBy({ left: 300, behavior: 'smooth' });
  });
  document.querySelector('.strip-btn.prev').addEventListener('click', function () {
    strip.scrollBy({ left: -300, behavior: 'smooth' });
  });

  // quote form (2 steps)
  var form = document.getElementById('quote');
  var s1 = form.querySelector('.step-1'), s2 = form.querySelector('.step-2'), done = form.querySelector('.step-done');
  var bar = document.getElementById('progress-bar'), icon = document.getElementById('progress-icon');
  function progress(p) { bar.style.width = p + '%'; icon.style.left = 'calc(' + p + '% - 12px)'; }
  function valid(scope) {
    var ok = true;
    scope.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim();
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }
  document.getElementById('next').addEventListener('click', function () {
    if (!valid(s1)) return;
    s1.hidden = true; s2.hidden = false; progress(60);
  });
  document.getElementById('back').addEventListener('click', function () {
    s2.hidden = true; s1.hidden = false; progress(18);
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valid(s2)) return;
    s2.hidden = true; done.hidden = false; progress(100);
    // TODO: connect to your form handler / CRM here
  });

  // contact form
  var cf = document.getElementById('contact');
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valid(cf)) return;
    cf.querySelector('.form-ok').hidden = false;
    // TODO: connect to your form handler / CRM here
  });
})();

// ================= MOTION =================
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // hero entrance
  window.addEventListener('load', function () { document.querySelector('.hero').classList.add('loaded'); });
  setTimeout(function () { document.querySelector('.hero').classList.add('loaded'); }, 600);

  // tag elements for scroll reveal (staggered inside grids)
  var groups = [
    ['.trust-row > div', 'up'], ['.service-grid .card', 'up'], ['.mat', 'up'], ['.step-box', 'up'],
    ['.why-item', 'up'], ['blockquote', 'up'], ['.blog-grid article', 'up'], ['.footer-grid > div', 'up']
  ];
  groups.forEach(function (g) {
    $(g[0]).forEach(function (el, i) { el.setAttribute('data-reveal', ''); el.style.setProperty('--d', (i % 3) * 0.12 + 's'); });
  });
  $('.select-best .text').forEach(function (e) { e.setAttribute('data-reveal', 'left'); });
  $('.local .text').forEach(function (e) { e.setAttribute('data-reveal', 'left'); });
  $('.contact-form').forEach(function (e) { e.setAttribute('data-reveal', 'right'); });
  $('.section-head, .cta-row, .faq details, .strip-track').forEach(function (e, i) { e.setAttribute('data-reveal', ''); });
  $('.faq details').forEach(function (e, i) { e.style.setProperty('--d', i * 0.08 + 's'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $('[data-reveal]').forEach(function (e) { io.observe(e); });

  // tile-grid photo reveal
  $('[data-tiles]').forEach(function (wrap) {
    var t = document.createElement('div'); t.className = 'tiles';
    var order = [];
    for (var i = 0; i < 15; i++) order.push(i);
    order.sort(function () { return Math.random() - 0.5; });
    order.forEach(function (n, k) { var c = document.createElement('i'); c.style.setProperty('--td', (k * 0.05) + 's'); t.appendChild(c); });
    wrap.appendChild(t);
    var o2 = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { setTimeout(function () { wrap.classList.add('shown'); }, 150); o2.disconnect(); }
    }, { threshold: 0.35 });
    o2.observe(wrap);
  });

  // count-up numbers
  $('.trust-row strong').forEach(function (el) {
    var m = el.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m || reduce) return;
    var end = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, suffix = m[2];
    var o3 = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; o3.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * e).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    o3.observe(el);
  });

  // word-by-word statement
  var st = document.querySelector('.statement'), words = [];
  if (st) {
    var p = st.querySelector('[data-words]');
    (function wrapWords(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) { wrapWords(n); }
      });
    })(p);
  }

  // scroll loop: progress bar, hero parallax, statement, header hide
  var bar = document.getElementById('scroll-progress'), hero = document.querySelector('.hero'),
      header = document.querySelector('.site-header'), mnav = document.querySelector('.main-nav'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (!reduce && y < hero.offsetHeight + 200) {
      hero.style.setProperty('--py', (y * 0.22) + 'px');
      hero.style.setProperty('--hs', (1.08 - Math.min(y / 4000, 0.06)));
      hero.style.setProperty('--cy', (-y * 0.08) + 'px');
      hero.style.setProperty('--co', Math.max(1 - y / (hero.offsetHeight * 0.9), 0.15));
    }
    if (st && !reduce) {
      var r = st.getBoundingClientRect(), total = r.height - window.innerHeight;
      var prog = Math.min(Math.max(-r.top / total, 0), 1);
      var n = Math.round(Math.min(prog / 0.8, 1) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
      st.classList.toggle('done', prog > 0.55);
    }
    var down = y > lastY && y > 400;
    header.classList.toggle('hide', down && !mnav.classList.contains('open'));
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
