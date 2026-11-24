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
