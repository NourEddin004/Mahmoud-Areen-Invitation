/* Mahmoud & Areen — the invitation's behaviour.
   No framework, no build. Reads window.INVITE and window.INVITE_DB from config.js. */
(() => {
  'use strict';
  const C  = window.INVITE || {};
  const DB = window.INVITE_DB || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const when = new Date(C.date || '2027-06-18T19:30:00+03:00');

  /* ── 1 · fill the page from config ─────────────────────────────── */
  const set = (sel, v) => { if (v != null) $$(sel).forEach(n => (n.textContent = v)); };
  set('.js-groomEn', C.groomEn); set('.js-brideEn', C.brideEn);
  set('.js-gi', (C.groomAr || 'م')[0]); set('.js-bi', (C.brideAr || 'ع')[0]);
  set('#vName', C.venueAr); set('#vCity', C.cityAr);
  if (C.groomAr) document.title = `${C.groomAr} & ${C.brideAr} — دعوة زفاف`;
  if (C.mapUrl) $('#mapBtn').href = C.mapUrl;

  // dates in Arabic with Western digits — clearer on a phone than mixed numerals
  const tz = 'Asia/Amman';
  const fmt = o => new Intl.DateTimeFormat('ar-JO-u-nu-latn', { timeZone: tz, ...o }).format(when);
  const dd = fmt({ day: '2-digit' }), mm = fmt({ month: '2-digit' }), yy = fmt({ year: 'numeric' });
  // the first screen
  set('#hMonth', fmt({ month: 'long' })); set('#hDay', fmt({ day: 'numeric' })); set('#hYear', yy);
  set('#hWeekday', fmt({ weekday: 'long' }));
  set('#hVenue', C.venueAr);
  set('#hTime', C.timeAr);

  // the invitation wording and venue card
  if (C.hostsAr) { set('#hostA', C.hostsAr[0]); set('#hostB', C.hostsAr[1]); }
  set('.js-hTitle', C.hostsTitleAr);
  set('#vName2', C.venueAr); set('#vEn', C.venueEn); set('#vAddr', C.addressAr);
  set('#vArrive', C.timeAr);
  if (C.photo) {
    const img = $('#ovalPhoto');
    img.src = C.photo; img.alt = `${C.groomAr} و${C.brideAr}`; img.classList.add('is-photo');
    $('#ovalFx').remove();
  }
  if (C.rsvpBy) {
    const by = new Intl.DateTimeFormat('ar-JO-u-nu-latn', { day: 'numeric', month: 'long', timeZone: tz })
      .format(new Date(C.rsvpBy + 'T12:00:00+03:00'));
    set('#rsvpBy', `نرجو تأكيد حضوركم قبل ${by}`);
  }

  // a personal link: ?to=اسم shows the guest's name on the envelope and prefills the form
  const to = new URLSearchParams(location.search).get('to');
  if (to && to.trim()) {
    const name = to.trim().slice(0, 60);
    set('#envName', name);
    $('#fName').value = name;
  }

  set('.js-gAr', C.groomAr); set('.js-bAr', C.brideAr);
  ['#cardDate', '#footDate', '#stubDate'].forEach(id => set(id, `${dd} · ${mm} · ${yy}`));

  /* ── 2 · the dividers: an olive branch — a slim twig, silver-green leaves, a few olives ── */
  (function olive() {
    const g = $('#garlandG'); if (!g) return;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, a, kids = []) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); kids.forEach(c => e.append(c)); return e; };
    const stop = (o, c) => el('stop', { offset: o, 'stop-color': c });
    let seed = 41; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const f = n => n.toFixed(1);

    g.append(el('defs', {}, [
      el('linearGradient', { id: 'oTop', x1: 0, x2: 1 }, [stop(0, '#5F6E47'), stop(.6, '#74835A'), stop(1, '#8A9870')]),
      el('linearGradient', { id: 'oUnder', x1: 0, x2: 1 }, [stop(0, '#9AA88C'), stop(1, '#C3CDB6')]),
      el('radialGradient', { id: 'oDark', cx: '35%', cy: '30%', r: '75%' }, [stop(0, '#7A6577'), stop(.55, '#4A3946'), stop(1, '#2E2330')]),
      el('radialGradient', { id: 'oGreen', cx: '35%', cy: '30%', r: '75%' }, [stop(0, '#B9BE7A'), stop(.6, '#8C934C'), stop(1, '#626A32')]),
    ]));

    // the twig: a long, gentle S from left to right, thinning toward the tip
    const Y = t => 40 + 8 * Math.sin(t * Math.PI * 1.6 - .5);
    const P = t => [8 + t * 384, Y(t)];
    const ang = t => { const [x1, y1] = P(t - .005), [x2, y2] = P(t + .005); return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; };
    const W = t => 3.2 * (1 - .7 * t) + .5;
    let top = '', bot = '';
    for (let i = 0; i <= 80; i++) { const t = i / 80, [x, y] = P(t), w = W(t); top += `${i ? 'L' : 'M'}${f(x)} ${f(y - w / 2)}`; bot = `L${f(x)} ${f(y + w / 2)}` + bot; }
    const twig = el('path', { d: top + bot + 'Z', fill: '#6E604A' });

    const leaf = (x, y, a, L, under) => {
      const w = L * .24, bend = (rnd() - .5) * L * .18;
      const grp = el('g', { transform: `translate(${f(x)} ${f(y)}) rotate(${f(a)})` });
      grp.append(el('path', { d: `M0 0C${f(L * .25)} ${f(-w)} ${f(L * .7)} ${f(-w * .8 + bend)} ${f(L)} ${f(bend)}C${f(L * .7)} ${f(w * .7 + bend)} ${f(L * .25)} ${f(w * .9)} 0 0Z`,
        fill: under ? 'url(#oUnder)' : 'url(#oTop)', stroke: under ? '#8E9C80' : '#56653F', 'stroke-width': '.3', 'stroke-opacity': '.5' }));
      grp.append(el('path', { d: `M${f(L * .06)} 0Q${f(L * .5)} ${f(bend * .4)} ${f(L * .94)} ${f(bend * .95)}`, fill: 'none', stroke: under ? '#E6EBDD' : '#A9B592', 'stroke-width': '.45', opacity: '.8' }));
      return grp;
    };
    const olives = (x, y, a, n) => {
      const grp = el('g', { transform: `translate(${f(x)} ${f(y)}) rotate(${f(a)})` });
      for (let k = 0; k < n; k++) {
        const dx = (k - (n - 1) / 2) * 7, len = 7 + rnd() * 4;
        grp.append(el('path', { d: `M0 0Q${f(dx * .4)} ${f(len * .5)} ${f(dx)} ${f(len)}`, fill: 'none', stroke: '#6E604A', 'stroke-width': '.7' }));
        const dark = rnd() < .6;
        grp.append(el('ellipse', { cx: f(dx), cy: f(len + 5.4), rx: 4.3, ry: 5.7, fill: dark ? 'url(#oDark)' : 'url(#oGreen)' }));
        grp.append(el('ellipse', { cx: f(dx - 1.4), cy: f(len + 3.6), rx: 1.2, ry: 1.7, fill: '#fff', opacity: '.35' }));
      }
      return grp;
    };

    const under = [], over = [];
    // leaves in pairs-ish along the twig, alternating sides, shorter toward the tip
    for (let i = 0; i < 46; i++) {
      const t = .015 + i * .0215 + rnd() * .008; if (t > .975) break;
      const [x, y] = P(t), side = i % 2 ? 1 : -1, L = (40 - 16 * t) * (.8 + rnd() * .35);
      const a = ang(t) + side * (24 + rnd() * 26) + (t - .5) * 10;
      (rnd() < .4 ? under : over).push(leaf(x, y, a, L, rnd() < .4));
    }
    // a tip leaf pointing on along the branch
    { const [x, y] = P(.985); over.push(leaf(x - 3, y, ang(.985) - 6, 22, false)); }
    // olive clusters hanging under the twig
    const fruit = [[.14, 2], [.36, 3], [.58, 2], [.8, 2]].map(([t, n]) => { const [x, y] = P(t); return olives(x, y + .5, ang(t) * .4 + (rnd() - .5) * 14, n); });

    under.forEach(n => g.append(n));
    fruit.forEach(n => g.append(n));
    g.append(twig);
    over.forEach(n => g.append(n));
  })();

  /* ── 3 · the envelope: seal → flap opens → invitation ── */
  const cover = $('#cover'), hint = $('#envHint');
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  let stage = 0;   // 0 sealed · 1 opening · 2 open · 3 gone
  async function openEnvelope() {
    if (stage) return; stage = 1;
    root.classList.add('opening');
    window.__driftPaused = true;                             // give the phone every frame for the envelope
    await wait(500);  root.classList.add('flap-open');      // flap swings out toward the guest, seal and all — slowly
    await wait(1500); root.classList.add('card-up');        // the card starts lifting while the flap is still swinging
    await wait(2100); root.classList.add('flap-done');
    await wait(1100); stage = 2; enter();                    // a breath with the envelope open, then the invitation                    // a moment to read it, then the invitation opens on its own
  }
  async function enter() {
    if (stage !== 2) return; stage = 3;
    root.classList.remove('sealed');
    window.scrollTo(0, 0);
    root.classList.add('unveil');
    await wait(900);  root.classList.add('revealed');
    await wait(2400);
    cover.remove();
    window.__driftPaused = false;
    // tell the guest there is more below; the first scroll puts it away for good
    setTimeout(() => { if (scrollY < 40) root.classList.add('hint-on'); }, 600);
    root.classList.remove('opening', 'flap-open', 'flap-done', 'card-up', 'unveil');
  }
  $('#seal').addEventListener('click', openEnvelope);
  $('#envelope').addEventListener('click', openEnvelope);
  document.addEventListener('keydown', e => {
    if (stage === 3 || !(e.key === 'Enter' || e.key === ' ')) return;
    e.preventDefault(); openEnvelope();
  });
  if (!root.classList.contains('sealed')) root.classList.add('revealed');

  addEventListener('scroll', function off() {
    if (scrollY > 40) { root.classList.remove('hint-on'); removeEventListener('scroll', off); }
  }, { passive: true });
  if (!root.classList.contains('sealed')) setTimeout(() => root.classList.add('hint-on'), 1500);

  /* ── 3b · background motion: a few eucalyptus leaves drifting down ── */
  (function drift() {
    if (reduce) return;
    const cv = Object.assign(document.createElement('canvas'), { className: 'drift', ariaHidden: 'true' });
    document.body.append(cv);
    const ctx = cv.getContext('2d');
    let W, H, dpr;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const N = W < 700 ? 9 : 14;
    const tones = ['#93A585', '#7F9470', '#A9B99B', '#C9B88E'];
    const make = top => ({
      x: Math.random() * W, y: top ? -20 - Math.random() * H : Math.random() * H,
      r: 4 + Math.random() * 5, vy: .18 + Math.random() * .3, sway: 12 + Math.random() * 22,
      ph: Math.random() * 6.3, spin: (Math.random() - .5) * .02, a: Math.random() * 6.3,
      c: tones[(Math.random() * tones.length) | 0], o: .35 + Math.random() * .35,
    });
    const leaves = Array.from({ length: N }, () => make(false));
    let last = performance.now();
    function frame(now) {
      if (window.__driftPaused || document.hidden) { ctx.clearRect(0, 0, W, H); last = now; return requestAnimationFrame(frame); }
      const dt = Math.min(48, now - last) / 16.7; last = now;
      ctx.clearRect(0, 0, W, H);
      for (const l of leaves) {
        l.y += l.vy * dt; l.ph += .012 * dt; l.a += l.spin * dt;
        const x = l.x + Math.sin(l.ph) * l.sway;
        if (l.y > H + 20) Object.assign(l, make(true), { y: -20 });
        ctx.save(); ctx.translate(x, l.y); ctx.rotate(l.a); ctx.scale(Math.cos(l.ph * 1.7), 1);
        ctx.globalAlpha = l.o; ctx.fillStyle = l.c;
        ctx.beginPath(); ctx.ellipse(0, 0, l.r, l.r * .8, 0, 0, 6.283); ctx.fill();
        ctx.globalAlpha = l.o * .7; ctx.strokeStyle = '#EEF2E6'; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(-l.r * .8, 0); ctx.lineTo(l.r * .8, 0); ctx.stroke();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ── 4 · scroll reveals ────────────────────────────────────────── */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('[data-reveal]').forEach(n => io.observe(n));
  } else $$('[data-reveal]').forEach(n => n.classList.add('in'));

  /* ── 5 · countdown ─────────────────────────────────────────────── */
  const cd = { D: $('#cD'), H: $('#cH'), M: $('#cM'), S: $('#cS') };
  function tick() {
    let s = Math.floor((when - Date.now()) / 1000);
    if (s <= 0) { $('.count').hidden = true; $('#countDone').hidden = false; return false; }
    const D = Math.floor(s / 86400); s -= D * 86400;
    const H = Math.floor(s / 3600);  s -= H * 3600;
    const M = Math.floor(s / 60);    s -= M * 60;
    cd.D.textContent = D; cd.H.textContent = String(H).padStart(2, '0');
    cd.M.textContent = String(M).padStart(2, '0'); cd.S.textContent = String(s).padStart(2, '0');
    return true;
  }
  if (tick()) { const t = setInterval(() => { if (!tick()) clearInterval(t); }, 1000); }

  /* ── 7 · RSVP ──────────────────────────────────────────────────── */
  const form = $('#form'), thanks = $('#thanks'), status = $('#status'), send = $('#send');
  const gField = $('#guestsField'), gOut = $('#gOut'), gMinus = $('#gMinus'), gPlus = $('#gPlus');
  const MAX = Math.max(1, +C.maxGuests || 5);
  let guests = 1;
  const paint = () => { gOut.textContent = guests; gMinus.disabled = guests <= 1; gPlus.disabled = guests >= MAX; };
  gMinus.onclick = () => { guests = Math.max(1, guests - 1); paint(); };
  gPlus.onclick  = () => { guests = Math.min(MAX, guests + 1); paint(); };
  paint();

  form.addEventListener('change', e => {
    if (e.target.name === 'attending') {
      gField.hidden = e.target.value !== 'yes';
      $('#eAtt').textContent = '';
    }
  });
  $('#fName').addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); $('#eName').textContent = ''; });

  const live = !!(DB.url && DB.key);
  const KEY = 'ma-rsvp';

  function showThanks(att, name, play) {
    const first = name.split(' ')[0];
    $('#thanksTitle').textContent = att === 'yes' ? `بانتظارك يا ${first}` : 'وصلنا ردّك';
    $('#thanksText').textContent = att === 'yes'
      ? 'شكراً لك، حضورك سيكمل فرحتنا.'
      : 'سنفتقدك، ودعاؤك يكفينا. شكراً لأنك أخبرتنا.';
    $('#sentName').textContent = name.length > 22 ? first : name;
    $('#sentAns').textContent = att === 'yes' ? 'سأحضر بكل سرور' : 'أعتذر عن الحضور';
    form.hidden = true; form.classList.remove('leaving'); thanks.hidden = false;

    const burst = $('#burst'); burst.textContent = '';
    thanks.classList.remove('play');
    if (!play || reduce) return;
    void thanks.offsetWidth;                // restart the animation if it played before
    thanks.classList.add('play');
    if (att !== 'yes') return;              // a gentle seal for "no", a little celebration for "yes"
    const kinds = ['leaf', 'leaf', 'petal', 'petal', 'spark', 'spark', 'spark'];
    for (let i = 0; i < 22; i++) {
      const a = -Math.PI * (0.06 + 0.88 * (i / 21)) + (Math.random() - .5) * .25;   // fan out upward
      const d = 60 + Math.random() * 70;
      const b = document.createElement('span');
      b.className = `bit bit--${kinds[i % kinds.length]}`;
      b.style.cssText = `--x:${(Math.cos(a) * d * 1.1).toFixed(0)}px;--y:${(Math.sin(a) * d + 30).toFixed(0)}px;` +
                        `--r:${(Math.random() * 540 - 270).toFixed(0)}deg;--d:${(Math.random() * .25).toFixed(2)}s`;
      burst.append(b);
    }
  }
  try { const prev = JSON.parse(localStorage.getItem(KEY) || 'null'); if (prev) showThanks(prev.att, prev.name); } catch {}

  $('#again').onclick = () => {
    try { localStorage.removeItem(KEY); } catch {}
    thanks.hidden = true; form.hidden = false; form.reset(); gField.hidden = true; guests = 1; paint();
    $('#fName').focus();
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#fName').value.trim().replace(/\s+/g, ' ');
    const att  = (form.querySelector('[name=attending]:checked') || {}).value;
    const note = $('#fNote').value.trim();
    let ok = true;
    if (name.length < 2) { $('#eName').textContent = 'اكتب اسمك من فضلك'; $('#fName').setAttribute('aria-invalid', 'true'); ok = false; }
    if (!att) { $('#eAtt').textContent = 'اختر أحد الخيارين'; ok = false; }
    if (!ok) { (form.querySelector('[aria-invalid=true]') || form.querySelector('[name=attending]')).focus(); return; }

    const row = { name, attending: att, guests: att === 'yes' ? guests : 0, note: note || null };
    send.disabled = true; send.textContent = 'جارٍ الإرسال…'; status.textContent = '';

    try {
      if (live) {
        const r = await fetch(`${DB.url.replace(/\/$/, '')}/rest/v1/${DB.table || 'rsvp'}`, {
          method: 'POST',
          headers: { apikey: DB.key, Authorization: `Bearer ${DB.key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify(row),
        });
        if (!r.ok) throw new Error(r.status);
      } else {
        await new Promise(r => setTimeout(r, 600));   // preview mode: nothing is sent
        console.info('[preview] RSVP not sent — fill INVITE_DB in config.js', row);
      }
      try { localStorage.setItem(KEY, JSON.stringify({ att, name })); } catch {}
      form.classList.add('leaving');
      await wait(350);
      showThanks(att, name, true);
      thanks.focus({ preventScroll: true });
      $('#rsvp').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } catch (err) {
      // never lose a reply: hand it to WhatsApp if the network call failed
      if (C.whatsapp) {
        const msg = `RSVP — ${name}: ${att === 'yes' ? `سأحضر (${row.guests})` : 'أعتذر'}${note ? ` — ${note}` : ''}`;
        status.innerHTML = '';
        const a = Object.assign(document.createElement('a'), {
          href: `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`, target: '_blank', rel: 'noopener',
          textContent: 'تعذّر الإرسال — أرسل ردّك عبر واتساب',
        });
        status.append(a);
      } else {
        status.textContent = 'تعذّر الإرسال، تأكد من الاتصال وحاول مرة أخرى.';
      }
    } finally {
      send.disabled = false; send.textContent = 'أرسِل الرد';
    }
  });
})();
