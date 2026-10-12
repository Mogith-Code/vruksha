(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Team data (from the organizing committee posters) ---------- */
  var LEADS = [
    ['Mogith Chandrakumar', 'Chairperson'],
    ['Himash Madushanka', 'Co-Chairperson'],
    ['Niluka Dilshani', 'Secretary Lead'],
    ['Thakshila Madhushani', 'Treasurer Lead'],
    ['Kaveesha Devindi', 'Programme Coordinator Lead'],
    ['Chamodi Ishani', 'Event Coordinator Lead'],
    ['Raveesha Senarath Yapa', 'Caption Writer Lead'],
    ['Abilashiny Selvakumaran', 'Graphic Designer Lead'],
    ['Renujaan Ravichandran', 'Video Team Lead']
  ];
  var MEMBERS = [
    ['Amasha Jayathilake', 'Secretary'],
    ['Yashodhara Niranji', 'Secretary'],
    ['Imasha Rasanjalee', 'Asst. Treasurer'],
    ['Shashika Dilrukshi', 'Graphic Designer'],
    ['Samni Hasnath', 'Graphic Designer'],
    ['Preethika Nandakumar', 'Graphic Designer'],
    ['M. Pavithar', 'Video Editor'],
    ['Pabasara Methmini', 'Video Editor'],
    ['D.D. Wijesinghe', 'Photographer'],
    ['Sandali Hemanthika', 'Photographer'],
    ['Pabasara Methmini', 'Programme Coordinator'],
    ['K.H.I. Sathsarani', 'Programme Coordinator'],
    ['Yenusha Pahan', 'Programme Coordinator'],
    ['S.H.S.S. Sathindi', 'Event Coordinator'],
    ['Chandi Shehani', 'Event Coordinator'],
    ['Tharushi Divyanjali', 'Event Coordinator'],
    ['Harshan Deshapriya', 'Event Coordinator'],
    ['Thisari Gayathri', 'Event Coordinator'],
    ['Umal Sudheesha', 'Event Coordinator'],
    ['Nethmi Peterson', 'Caption Writer'],
    ['S.C. Ranasinghe', 'Caption Writer']
  ];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function renderTeam(list, grid, prefix) {
    list.forEach(function (m, i) {
      var card = document.createElement('div');
      card.className = 'member reveal' + (prefix === 'lead' && i < 2 ? ' is-chair' : '');
      var img = document.createElement('img');
      img.src = 'assets/img/team/' + prefix + pad(i + 1) + '.jpg';
      img.alt = m[0];
      img.loading = 'lazy';
      img.width = 176; img.height = 176;
      var name = document.createElement('b'); name.textContent = m[0];
      var role = document.createElement('span'); role.textContent = m[1];
      card.append(img, name, role);
      grid.appendChild(card);
    });
  }
  renderTeam(LEADS, $('leadGrid'), 'lead');
  renderTeam(MEMBERS, $('memberGrid'), 'mem');

  /* ---------- Nav ---------- */
  var nav = $('nav'), navToggle = $('navToggle');
  function closeMenu() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $('navLinks').addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });

  /* ---------- Scroll: vine progress, nav state, timeline stem ---------- */
  var vineFill = $('vineFill'), stemFill = $('stemFill'), timeline = $('timeline');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    vineFill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    nav.classList.toggle('is-solid', y > 60);
    var r = timeline.getBoundingClientRect();
    var grown = (vh * 0.7 - r.top) / r.height;
    stemFill.style.height = Math.max(0, Math.min(1, grown)) * 100 + '%';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Reveal on scroll + stat counters ---------- */
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1200;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      en.target.querySelectorAll('[data-count]').forEach(countUp);
      revealer.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  function watchReveals(root) {
    root.querySelectorAll('.reveal, .step').forEach(function (el) { revealer.observe(el); });
  }
  watchReveals(document);

  /* Highlight the current section in the nav */
  var links = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var a = links[en.target.id];
      if (a) a.classList.toggle('is-current', en.isIntersecting);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(links).forEach(function (id) { var s = $(id); if (s) spy.observe(s); });

  /* ---------- Falling leaves in the hero ---------- */
  (function leaves() {
    var canvas = $('leaves');
    if (reduceMotion || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), w, h, dpr, items = [], running = false;
    var colors = ['#6fbf3b', '#9bd86a', '#2f8a2f', '#e3b341', '#c9e59a'];
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(top) {
      return {
        x: Math.random() * w, y: top ? -20 : Math.random() * h,
        s: 7 + Math.random() * 9, vy: 0.4 + Math.random() * 0.9,
        sway: 0.6 + Math.random() * 1.2, ph: Math.random() * 6.28,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.03,
        c: colors[(Math.random() * colors.length) | 0], a: 0.55 + Math.random() * 0.4
      };
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < items.length; i++) {
        var l = items[i];
        l.y += l.vy; l.ph += 0.015; l.x += Math.sin(l.ph) * l.sway; l.rot += l.vr;
        if (l.y > h + 20) items[i] = l = make(true);
        ctx.save();
        ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.globalAlpha = l.a; ctx.fillStyle = l.c;
        ctx.beginPath();
        ctx.moveTo(0, -l.s);
        ctx.bezierCurveTo(l.s * 0.9, -l.s * 0.5, l.s * 0.9, l.s * 0.5, 0, l.s);
        ctx.bezierCurveTo(-l.s * 0.9, l.s * 0.5, -l.s * 0.9, -l.s * 0.5, 0, -l.s);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(draw);
    }
    size();
    var n = w < 640 ? 16 : 30;
    for (var i = 0; i < n; i++) items.push(make(false));
    window.addEventListener('resize', size);
    new IntersectionObserver(function (e) {
      var on = e[0].isIntersecting;
      if (on && !running) { running = true; requestAnimationFrame(draw); }
      else if (!on) running = false;
    }).observe(canvas);
  })();

  /* ---------- Lightbox ---------- */
  var lb = $('lightbox'), lbImg = $('lbImg'), lbCap = $('lbCap'), lbNum = $('lbNum');
  var lbItems = [], lbIndex = 0, lbOpener = null;
  function lbShow(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    var it = lbItems[lbIndex];
    lbImg.src = it.src; lbImg.alt = it.alt;
    lbCap.textContent = it.alt;
    lbNum.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
    var next = lbItems[(lbIndex + 1) % lbItems.length];
    if (next) { new Image().src = next.src; }
  }
  function lbOpen(items, i) {
    lbItems = items; lbOpener = document.activeElement;
    lb.hidden = false; document.body.style.overflow = 'hidden';
    lbShow(i); $('lbClose').focus();
  }
  function lbCloseFn() {
    lb.hidden = true; document.body.style.overflow = ''; lbImg.removeAttribute('src');
    if (lbOpener) lbOpener.focus();
  }
  $('lbClose').addEventListener('click', lbCloseFn);
  $('lbPrev').addEventListener('click', function () { lbShow(lbIndex - 1); });
  $('lbNext').addEventListener('click', function () { lbShow(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) lbCloseFn(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbCloseFn();
    else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  });
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
  });

  $('posterBtn').addEventListener('click', function () {
    lbOpen([
      { src: 'assets/img/team/poster-leads.jpg', alt: 'Vruksha organizing committee: team leads' },
      { src: 'assets/img/team/poster-team.jpg', alt: 'Vruksha organizing committee: team members' }
    ], 0);
  });

  /* ---------- Campaign flyers (in the order they were released) ---------- */
  var FLYERS = [
    ['Coming Soon', 'Abilashiny Selvakumaran'],
    ['Registration Open', 'Abilashiny Selvakumaran'],
    ['The Invitation', 'Abilashiny Selvakumaran'],
    ['3 Days Left', 'Abilashiny Selvakumaran'],
    ['2 Days Left', 'Preethika Nandakumar'],
    ['Happening Tomorrow', 'Samni Hasnath'],
    ['Happening Today', 'Shashi Dissanayake'],
    ['Successfully Rooted', 'Preethika Nandakumar']
  ];
  var flyerItems = FLYERS.map(function (f, i) {
    return { src: 'assets/img/flyers/f' + pad(i + 1) + '.jpg', alt: f[0] + ' flyer, designed by ' + f[1] };
  });
  FLYERS.forEach(function (f, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'flyer';
    b.setAttribute('aria-label', 'Open flyer: ' + f[0]);
    var wrap = document.createElement('span'); wrap.className = 'flyer-img';
    var img = document.createElement('img');
    img.src = 'assets/img/flyers/f' + pad(i + 1) + '-t.jpg';
    img.alt = flyerItems[i].alt; img.loading = 'lazy'; img.width = 600; img.height = 600;
    var no = document.createElement('span'); no.className = 'flyer-no'; no.textContent = i + 1;
    wrap.append(img, no);
    var cap = document.createElement('span'); cap.className = 'flyer-cap';
    var t = document.createElement('b'); t.textContent = f[0];
    var d = document.createElement('span'); d.textContent = 'Designed by ' + f[1];
    cap.append(t, d);
    b.append(wrap, cap);
    b.addEventListener('click', function () { lbOpen(flyerItems, i); });
    $('flyerRail').appendChild(b);
  });

  /* ---------- Gallery ---------- */
  var photos = window.VRUKSHA_GALLERY || [];
  var masonry = $('masonry'), moreBtn = $('moreBtn');
  var PAGE = 12, activeCat = 'all', shown = PAGE;
  function renderGallery() {
    var list = photos.filter(function (p) { return activeCat === 'all' || p.cat === activeCat; });
    var items = list.map(function (p) { return { src: 'assets/img/gallery/' + p.n + '.jpg', alt: p.alt }; });
    masonry.textContent = '';
    list.slice(0, shown).forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tile';
      b.style.animationDelay = Math.min(i, 12) * 40 + 'ms';
      b.setAttribute('aria-label', 'Open photo: ' + p.alt);
      var img = document.createElement('img');
      img.src = 'assets/img/gallery/' + p.n + '-t.jpg';
      img.alt = p.alt; img.loading = 'lazy';
      img.width = p.w; img.height = p.h;
      b.appendChild(img);
      b.addEventListener('click', function () { lbOpen(items, i); });
      masonry.appendChild(b);
    });
    moreBtn.hidden = shown >= list.length;
  }
  $('chips').addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
    activeCat = chip.dataset.cat; shown = PAGE;
    renderGallery();
  });
  moreBtn.addEventListener('click', function () { shown += PAGE; renderGallery(); });
  renderGallery();

  /* ---------- Grove: plant a tree ---------- */
  (function grove() {
    var field = $('grove-field'), layer = $('groveTrees'), hint = $('groveHint');
    var countEl = $('groveCount'), msgEl = $('groveMsg');
    var KEY = 'vruksha-grove', MAX = 150, trees = [];
    var greens = [['#3f9b3a', '#2f8a2f', '#7ccb4e'], ['#58a83f', '#3f8f36', '#9bd86a'], ['#2f8a2f', '#1f6f2a', '#6fbf3b'], ['#74b83c', '#4f9a33', '#b5e07a']];

    function svgFor(t) {
      var g = greens[t.c % greens.length];
      if (t.k === 1) {
        return '<svg viewBox="0 0 100 140" aria-hidden="true"><rect x="45" y="100" width="10" height="40" rx="3" fill="#8a4b2a"/>' +
          '<polygon points="50,6 80,58 20,58" fill="' + g[2] + '"/><polygon points="50,32 88,90 12,90" fill="' + g[0] + '"/>' +
          '<polygon points="50,60 94,118 6,118" fill="' + g[1] + '"/></svg>';
      }
      return '<svg viewBox="0 0 100 140" aria-hidden="true"><rect x="45" y="78" width="10" height="62" rx="4" fill="#8a4b2a"/>' +
        '<circle cx="30" cy="70" r="24" fill="' + g[1] + '"/><circle cx="70" cy="70" r="24" fill="' + g[1] + '"/>' +
        '<circle cx="50" cy="52" r="34" fill="' + g[0] + '"/><circle cx="40" cy="40" r="16" fill="' + g[2] + '" opacity=".75"/></svg>';
    }

    function addTree(t, animate) {
      var el = document.createElement('div');
      el.className = 'tree' + (animate ? '' : ' no-anim');
      // Trees lower on the screen are nearer, so they are drawn bigger and in front.
      var depth = (t.y - 50) / 46;
      el.style.left = t.x + '%';
      el.style.top = t.y + '%';
      el.style.height = (11 + depth * 17) * t.s + '%';
      el.style.zIndex = Math.round(t.y * 10);
      el.innerHTML = svgFor(t);
      layer.appendChild(el);
    }

    function puff(x, y) {
      if (reduceMotion) return;
      for (var i = 0; i < 6; i++) {
        var p = document.createElement('span');
        p.className = 'puff';
        p.style.left = x + '%'; p.style.top = y + '%';
        p.style.setProperty('--dx', (Math.random() - 0.5) * 70 + 'px');
        p.style.setProperty('--dy', -(10 + Math.random() * 40) + 'px');
        layer.appendChild(p);
        setTimeout(function (n) { n.remove(); }, 650, p);
      }
    }

    function message(n) {
      if (n === 0) return 'trees planted. The ground is waiting.';
      if (n === 1) return 'tree planted. Every forest starts with one.';
      if (n < 5) return 'trees planted. Keep going!';
      if (n < 15) return 'trees planted. A grove is taking shape.';
      if (n < 40) return 'trees planted. Now that is a forest!';
      return 'trees planted. You are a true Leo of the woods.';
    }
    function update() {
      countEl.textContent = trees.length;
      msgEl.textContent = message(trees.length);
      hint.classList.toggle('is-hidden', trees.length > 0);
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(trees)); } catch (e) { /* storage unavailable */ } }

    function plant(x, y) {
      if (trees.length >= MAX) { trees.shift(); layer.firstElementChild.remove(); }
      var t = {
        x: Math.round(Math.max(5, Math.min(95, x)) * 10) / 10,
        y: Math.round(Math.max(50, Math.min(96, y)) * 10) / 10,
        s: Math.round((0.8 + Math.random() * 0.45) * 100) / 100,
        k: Math.random() < 0.3 ? 1 : 0,
        c: (Math.random() * greens.length) | 0
      };
      trees.push(t); addTree(t, true); puff(t.x, t.y); update(); save();
      if (navigator.vibrate) navigator.vibrate(12);
    }

    field.addEventListener('click', function (e) {
      var r = field.getBoundingClientRect();
      plant((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
    });
    $('grovePlant').addEventListener('click', function () { plant(8 + Math.random() * 84, 54 + Math.random() * 40); });
    $('groveReset').addEventListener('click', function () {
      trees = []; layer.textContent = ''; update(); save();
    });

    try {
      var stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(stored)) {
        stored.slice(-MAX).forEach(function (t) {
          if (t && typeof t.x === 'number' && typeof t.y === 'number') {
            trees.push({ x: t.x, y: t.y, s: +t.s || 1, k: t.k === 1 ? 1 : 0, c: t.c | 0 });
          }
        });
      }
    } catch (e) { /* ignore unreadable saved grove */ }
    trees.forEach(function (t) { addTree(t, false); });
    update();
  })();
})();
