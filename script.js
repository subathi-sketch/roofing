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

  // ---------- logo / "#top" links scroll to the very top ----------
  $('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      nav.classList.remove('open');
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // ---------- slide-out quote panel ----------
  var panel = document.getElementById('quote-panel'), bg = document.getElementById('panel-bg');
  function openPanel(e) { if (e) e.preventDefault(); panel.classList.add('open'); bg.classList.add('open'); }
  function closePanel() { panel.classList.remove('open'); bg.classList.remove('open'); }
  $('[data-open-quote]').forEach(function (b) { b.addEventListener('click', openPanel); });
  bg.addEventListener('click', closePanel);
  document.querySelector('.panel-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

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
    e.preventDefault(); if (cf.dataset.wizard) return; if (!valid(cf)) return;
    cf.classList.add('sent');
    // TODO: connect to your form handler / CRM here
  });

  // ---------- contact wizard ----------
  (function () {
    var form = cf; if (!form || !form.querySelector('.wz-step')) return;
    form.dataset.wizard = '1';
    var steps = $('.wz-step', form), dots = $('.wz-dot', form), fill = document.getElementById('wz-fill'),
        next = form.querySelector('.wz-next'), back = form.querySelector('.wz-back'), send = form.querySelector('.wz-send'), cur = 0;
    function show(n, dir) {
      cur = n;
      steps.forEach(function (s, i) { s.classList.toggle('on', i === n); s.classList.toggle('back', dir === 'back'); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === n); d.classList.toggle('done', i < n); });
      fill.style.width = (n / (steps.length - 1) * 100) + '%';
      back.hidden = n === 0; next.hidden = n === steps.length - 1; send.hidden = n !== steps.length - 1;
      var f = steps[n].querySelector('input[type=text],input[type=tel],input[type=email]');
      if (f && n > 0) setTimeout(function () { f.focus({ preventScroll: true }); }, 350);
    }
    function err(msg, el) {
      var p = steps[cur].querySelector('.wz-err'); if (p) p.textContent = msg || '';
      if (el && msg) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    }
    function check() {
      err('');
      if (cur === 0) {
        if (!form.querySelector('input[name=topic]:checked')) { err('Please choose what you need help with.', steps[0].querySelector('.wz-opts')); return false; }
      }
      if (cur === 1) {
        var z = form.querySelector('#zip'), ok = /^\d{5}$/.test(z.value.trim());
        z.classList.toggle('invalid', !ok);
        if (!ok) { err('Please enter a 5-digit ZIP code.', steps[1].querySelector('.wz-zip')); return false; }
      }
      if (cur === 2) {
        var bad = false;
        $('input[required]', steps[2]).forEach(function (f) {
          var v = f.value.trim(), isBad = !v || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
          f.classList.toggle('invalid', isBad); if (isBad) bad = true;
        });
        if (bad) { err('Please complete your name, phone and a valid email.'); return false; }
      }
      return true;
    }
    function go() { if (check()) show(cur + 1, 'fwd'); }
    next.addEventListener('click', go);
    back.addEventListener('click', function () { err(''); show(cur - 1, 'back'); });
    var zip = form.querySelector('#zip');
    zip.addEventListener('input', function () { zip.value = zip.value.replace(/\D/g, '').slice(0, 5); });
    $('input[name=topic]', form).forEach(function (r) { r.addEventListener('change', function () { err(''); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (cur < steps.length - 1) { go(); return; }
      if (!check()) return;
      form.classList.add('sent');
      // TODO: connect to your form handler / CRM here
    });
    form.addEventListener('reset', function () { setTimeout(function () { show(0, 'back'); }, 0); });
    show(0);
  })();

  var again = document.querySelector('.ct-again');
  if (again) again.addEventListener('click', function () { cf.reset(); cf.classList.remove('sent'); $('.invalid', cf).forEach(function (x) { x.classList.remove('invalid'); }); });

  // ---------- sliders ----------
  function slider(trackId, prevId, nextId, step) {
    var t = document.getElementById(trackId);
    document.getElementById(nextId).addEventListener('click', function () { t.scrollBy({ left: step(t), behavior: 'smooth' }); });
    document.getElementById(prevId).addEventListener('click', function () { t.scrollBy({ left: -step(t), behavior: 'smooth' }); });
    return t;
  }
  var pf = slider('pf-track', 'pf-prev', 'pf-next', function (t) { return t.clientWidth + 20; });
  if (!reduce) {
    setInterval(function () {
      if (document.hidden || pf.matches(':hover') || pf.querySelector('.drag')) return;
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
      var old = slides.findIndex(function (s) { return s.classList.contains('active'); });
      slides.forEach(function (s, i) { s.classList.toggle('prev', i === old && i !== cur); s.classList.toggle('active', i === cur); });
      $('button', dots).forEach(function (b, i) { b.classList.toggle('on', i === cur); });
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!document.hidden) show(cur + 1); }, 4500); }
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
  [['.s-card', 0], ['.pillar', 0], ['.brand', 0], ['.r-card', 0], ['.ring-stat', 0], ['.nb-stat', 0], ['.nb-circle .nb-clip', 0], ['.nb-photo .nb-clip', 0], ['.photo-pill', 0], ['.locs li', 0]].forEach(function (g) {
    $(g[0]).forEach(function (el, i) { el.setAttribute('data-reveal', ''); el.style.setProperty('--d', (i % 4) * 0.12 + 's'); });
  });
  $('.split-head > div, .pf-text, .about-text, .svc-map, .tm-intro, .ct-info').forEach(function (e) { e.setAttribute('data-reveal', 'left'); });
  $('.split-head > p, .cta-media, .pf-slider, .about-collage, .ct-form, .tm-stage, .svc-side').forEach(function (e) { e.setAttribute('data-reveal', 'right'); });
  $('.cta-inner, .numbers-head, .brands .center, .faq-item, .faq-intro, .small-note, .test-head').forEach(function (e, i) { e.setAttribute('data-reveal', ''); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $('[data-reveal]').forEach(function (e) { io.observe(e); });

  // ---------- before / after slider ----------
  (function () {
    Array.prototype.forEach.call(document.querySelectorAll('.ba-box'), function (box) {
    var pos = 50, dragging = false;
    function set(p) {
      pos = Math.max(0, Math.min(100, p));
      box.style.setProperty('--pos', pos + '%'); box.setAttribute('aria-valuenow', Math.round(pos));
    }
    function fromEvent(e) { var r = box.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); }
    box.addEventListener('pointerdown', function (e) {
      dragging = true; box.classList.remove('hint'); box.classList.add('drag');
      box.setPointerCapture(e.pointerId); fromEvent(e);
    });
    box.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    function end() { dragging = false; box.classList.remove('drag'); }
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); }
    });
    if (!reduce) {
      var o = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; o.disconnect();
        box.classList.add('hint');
        setTimeout(function () { set(30); }, 300);
        setTimeout(function () { set(70); }, 1700);
        setTimeout(function () { set(50); }, 3000);
        setTimeout(function () { box.classList.remove('hint'); }, 4300);
      }, { threshold: 0.5 });
      o.observe(box);
    }
    });
  })();

  // ---------- progress rings ----------
  $('.ring').forEach(function (ring) {
    var bar = ring.querySelector('.bar'), pct = parseFloat(ring.dataset.pct) / 100;
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; o.disconnect();
      bar.style.strokeDashoffset = reduce ? 327 * (1 - pct) : 327 * (1 - pct);
    }, { threshold: 0.5 });
    o.observe(ring);
  });

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


  // ---------- Base-style pinned effects ----------
  (function () {
    // word-by-word statement
    var st = document.querySelector('.statement'), words = [];
    if (st) {
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var f = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
              var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; f.appendChild(sp); words.push(sp);
            });
            node.replaceChild(f, n);
          } else if (n.nodeType === 1) wrap(n);
        });
      })(st.querySelector('[data-words]'));
    }
    // tile grid
    var grid = document.getElementById('tile-grid'), tiles = [], cols = 6, rows = 4;
    var ratio = 1.5;
    function build() {
      grid.innerHTML = ''; tiles = [];
      var small = window.innerWidth <= 640; cols = small ? 4 : 6; rows = small ? 6 : 4;
      // size each tile's background so the whole grid shows the photo like object-fit: cover (no stretching, nothing cut off unevenly)
      var W = grid.clientWidth || window.innerWidth, H = grid.clientHeight || window.innerHeight;
      var iw, ih;
      if (W / H > ratio) { iw = W; ih = W / ratio; } else { ih = H; iw = H * ratio; }
      var ox = (iw - W) / 2, oy = (ih - H) / 2, tw = W / cols, th = H / rows;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var t = document.createElement('i');
        t.style.backgroundImage = 'url(' + grid.dataset.img + ')';
        t.style.backgroundSize = iw + 'px ' + ih + 'px';
        t.style.backgroundPosition = (-(c * tw + ox)) + 'px ' + (-(r * th + oy)) + 'px';
        t.dataset.d = Math.hypot(c - (cols - 1) / 2, r - (rows - 1) / 2).toFixed(2);
        grid.appendChild(t); tiles.push(t);
      }
    }
    var probe = new Image();
    probe.onload = function () { ratio = probe.naturalWidth / probe.naturalHeight; build(); };
    probe.src = grid.dataset.img;
    build();
    window.addEventListener('resize', function () { build(); });
    var lastSmall = window.innerWidth <= 640;
    window.addEventListener('resize', function () { var s = window.innerWidth <= 640; if (s !== lastSmall) { lastSmall = s; build(); } });
    var sc = document.getElementById('showcase'), heroCopy = document.querySelector('.hero-copy'), heroEl = document.querySelector('.hero');
    var tick = false;
    function frame() {
      tick = false;
      if (!reduce) {
        // hero copy fade
        var y = window.scrollY;
        if (y < 900) { heroCopy.style.setProperty('--cy', (-y * 0.1) + 'px'); heroCopy.style.setProperty('--co', Math.max(1 - y / (heroEl.offsetHeight * 0.85), 0.1)); }
        // statement
        if (st) {
          var r = st.getBoundingClientRect(), tot = r.height - window.innerHeight, p = Math.min(Math.max(-r.top / tot, 0), 1);
          var n = Math.round(Math.min(p / 0.8, 1) * words.length);
          words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
          st.classList.toggle('done', p > 0.55);
          var cards = document.querySelectorAll('.pt-card'), cur = -1;
          cards.forEach(function (cd, i) {
            var on = p > 0.18 + i * 0.2; cd.classList.toggle('on', on); if (on) cur = i;
          });
          cards.forEach(function (cd, i) { cd.classList.toggle('cur', i === cur); });
          var pb = document.getElementById('pt-bar'); if (pb) pb.style.width = Math.min(p / 0.85, 1) * 100 + '%';
        }
        // showcase: tiles assemble into one photo
        var r2 = sc.getBoundingClientRect(), t2 = r2.height - window.innerHeight, q = Math.min(Math.max(-r2.top / t2, 0), 1);
        var a = Math.min(q / 0.55, 1), e = 1 - Math.pow(1 - a, 3);
        grid.style.setProperty('--gap', (18 * (1 - e)) + 'px');
        grid.style.setProperty('--pad', ((window.innerWidth <= 640 ? 16 : 56) * (1 - e)) + 'px');
        grid.style.setProperty('--tr', (14 * (1 - e)) + 'px');
        tiles.forEach(function (t) {
          var d = parseFloat(t.dataset.d), local = Math.min(Math.max((q * 1.6 - d * 0.06), 0), 1);
          t.style.transform = 'scale(' + (0.88 + 0.125 * local) + ')';
          t.style.opacity = 0.25 + 0.75 * Math.min(local * 1.6, 1);
        });
        sc.style.setProperty('--cap', Math.min(Math.max((q - 0.62) / 0.25, 0), 1));
      }
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    window.addEventListener('resize', frame);
    frame();
  })();

  // ---------- coverflow cards ----------
  (function () {
    var root = document.getElementById('cf'); if (!root) return;
    var cards = $('.cf-card', root), n = cards.length, active = 2, timer, dots = document.getElementById('cf-dots');
    cards.forEach(function (_, i) {
      var b = document.createElement('button'); b.setAttribute('aria-label', 'Show ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); }); dots.appendChild(b);
    });
    function go(i) {
      active = (i + n) % n; var half = Math.floor(n / 2);
      cards.forEach(function (c, k) {
        var o = ((k - active + n + half) % n) - half;
        c.style.setProperty('--cfo', o); c.style.setProperty('--cfa', Math.abs(o));
        c.setAttribute('data-a', Math.abs(o)); c.classList.toggle('on', o === 0);
        c.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
      });
      $('button', dots).forEach(function (b, k) { b.classList.toggle('on', k === active); });
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { if (!document.hidden && !root.matches(':hover')) go(active + 1); }, 4500); }
    cards.forEach(function (c, k) {
      c.addEventListener('click', function (e) { if (k !== active && !e.target.closest('a')) { go(k); restart(); } });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(k); restart(); } });
    });
    document.getElementById('cf-prev').addEventListener('click', function () { go(active - 1); restart(); });
    document.getElementById('cf-next').addEventListener('click', function () { go(active + 1); restart(); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(active - 1); restart(); } if (e.key === 'ArrowRight') { go(active + 1); restart(); }
    });
    var sx = null;
    root.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    root.addEventListener('pointerup', function (e) {
      if (sx === null) return; var d = e.clientX - sx; sx = null;
      if (Math.abs(d) > 50) { go(active + (d < 0 ? 1 : -1)); restart(); }
    });
    go(active); restart();
  })();

  // ---------- FAQ accordion ----------
  (function () {
    var items = $('.faq-item');
    items.forEach(function (it) {
      var q = it.querySelector('.faq-q');
      q.addEventListener('click', function () {
        var open = it.classList.contains('open');
        items.forEach(function (o) { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
        if (!open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
      });
    });
  })();

  // ---------- testimonials carousel ----------
  (function () {
    var box = document.getElementById('tm'); if (!box) return;
    var cards = $('.tm-card', box), picks = $('.tm-pick', box), bar = document.getElementById('tm-bar'), cur = 0, timer, t0, raf, DUR = 7000;
    function go(i) {
      cur = (i + cards.length) % cards.length;
      cards.forEach(function (c, k) { c.classList.toggle('on', k === cur); c.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      picks.forEach(function (p, k) { p.classList.toggle('on', k === cur); });
      restart();
    }
    function tick(t) {
      if (!t0) t0 = t;
      if (box.matches(':hover')) { t0 = t - (parseFloat(bar.style.width) || 0) / 100 * DUR; }
      var p = Math.min((t - t0) / DUR, 1); bar.style.width = (p * 100) + '%';
      if (p >= 1) { go(cur + 1); return; }
      raf = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(raf); t0 = 0; bar.style.width = '0%';
      if (!reduce) raf = requestAnimationFrame(tick);
    }
    picks.forEach(function (p, k) { p.addEventListener('click', function () { go(k); }); });
    document.getElementById('tm-prev').addEventListener('click', function () { go(cur - 1); });
    document.getElementById('tm-next').addEventListener('click', function () { go(cur + 1); });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'ArrowRight') go(cur + 1); });
    var sx = null;
    box.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    box.addEventListener('pointerup', function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1)); });
    restart();
  })();

  // ---------- service area map ----------
  (function () {
    var map = document.getElementById('svc-map'); if (!map) return;
    var pins = $('.mpin', map), rows = $('.loc-row');
    function pick(i) {
      pins.forEach(function (p) { p.classList.toggle('on', +p.dataset.i === i); });
      rows.forEach(function (r) { r.classList.toggle('on', +r.dataset.i === i); });
    }
    pins.forEach(function (p) { p.addEventListener('click', function () { pick(+p.dataset.i); }); });
    rows.forEach(function (r) {
      r.addEventListener('click', function () { pick(+r.dataset.i); });
      r.addEventListener('mouseenter', function () { pick(+r.dataset.i); });
    });
    pick(0);
    var form = document.getElementById('zip-form'), input = document.getElementById('zip-in'), msg = document.getElementById('zip-msg');
    input.addEventListener('input', function () { input.value = input.value.replace(/\D/g, '').slice(0, 5); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = input.value.trim();
      if (!/^\d{5}$/.test(z)) { msg.className = 'zip-msg bad'; msg.textContent = 'Please enter a 5-digit ZIP code.'; return; }
      // demo only: replace with a real ZIP lookup
      msg.className = 'zip-msg ok'; msg.innerHTML = 'Good news, we serve ' + z + '. <a href="#contact">Request your free inspection</a>';
    });
  })();

  // ---------- click-to-select card stroke ----------
  $('.s-card, .brand, .r-card, .pillar').forEach(function (card) {
    card.setAttribute('tabindex', '0');
    function pick() {
      $('.is-active', card.parentElement).forEach(function (x) { if (x !== card) x.classList.remove('is-active'); });
      card.classList.toggle('is-active');
    }
    card.addEventListener('click', pick);
    card.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); pick(); }
    });
  });

  // ---------- stats band: light parallax on the photos ----------
  (function () {
    var band = document.querySelector('.numbers'); if (!band || reduce) return;
    var t = false;
    function upd() {
      t = false;
      var r = band.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      band.style.setProperty('--nbp', Math.max(-1, Math.min(1, p)).toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd); upd();
  })();

  // ---------- scroll loop ----------
  var progress = document.getElementById('scroll-progress'), header = document.querySelector('.site-header'),
      heroImg = document.getElementById('hero-slider'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (!reduce && y < 900) heroImg.style.setProperty('--py', (y * 0.08) + 'px');
    // header stays visible while scrolling (no auto-hide)
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
