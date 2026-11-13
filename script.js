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
  set('#groomAr', C.groomAr); set('#brideAr', C.brideAr);
  set('#groomEn', C.groomEn); set('#brideEn', C.brideEn);
  set('#groomFull', C.groomFullAr); set('#brideFull', C.brideFullAr);
  set('.js-groomEn', C.groomEn); set('.js-brideEn', C.brideEn);
  set('.js-gi', (C.groomEn || 'M')[0]); set('.js-bi', (C.brideEn || 'A')[0]);
  set('#dTime', C.timeAr); set('#vName', C.venueAr); set('#vCity', C.cityAr);
  if (C.groomAr) document.title = `${C.groomAr} & ${C.brideAr} — دعوة زفاف`;
  if (C.mapUrl) $('#mapBtn').href = C.mapUrl;

  // dates in Arabic with Western digits — clearer on a phone than mixed numerals
  const tz = 'Asia/Amman';
  const fmt = o => new Intl.DateTimeFormat('ar-JO-u-nu-latn', { timeZone: tz, ...o }).format(when);
  const dd = fmt({ day: '2-digit' }), mm = fmt({ month: '2-digit' }), yy = fmt({ year: 'numeric' });
  set('#heroDate', `${dd} · ${mm} · ${yy}`);
  set('#dWeekday', fmt({ weekday: 'long' }));
  set('#dDay', fmt({ day: 'numeric' }));
  set('#dMonth', `${fmt({ month: 'long' })} ${yy}`);

  if (Array.isArray(C.letterAr) && C.letterAr.length) {
    $('#letterBody').replaceChildren(...C.letterAr.map(t => Object.assign(document.createElement('p'), { textContent: t })));
  }
  if (C.photo) {
    const img = $('#ovalPhoto');
    img.src = C.photo; img.alt = `${C.groomAr} و${C.brideAr}`; img.classList.add('is-photo');
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
  set('#cardDate', `${dd} · ${mm} · ${yy}`); set('#footDate', `${dd} · ${mm} · ${yy}`);

  /* ── 2 · the garland: Edison bulbs on a twisted wire, wrapped in eucalyptus ── */
  (function garland() {
    const g = $('#garlandG'); if (!g) return;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, a, kids = []) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); kids.forEach(c => e.append(c)); return e; };
    const stop = (o, c, op = 1) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op });
    let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    g.append(el('defs', {}, [
      el('radialGradient', { id: 'gGlass', cx: '42%', cy: '62%', r: '60%' }, [stop(0, '#FFFDF0'), stop(.4, '#FFEDB3'), stop(.8, '#F4C766', .95), stop(1, '#D59A3C', .9)]),
      el('radialGradient', { id: 'gGlow' }, [stop(0, '#FFD988', .75), stop(.45, '#FFD988', .28), stop(1, '#FFD988', 0)]),
      el('linearGradient', { id: 'gBrass', x1: 0, x2: 1 }, [stop(0, '#5B4626'), stop(.35, '#C8A86A'), stop(.6, '#9C7D45'), stop(1, '#4E3C20')]),
      el('radialGradient', { id: 'gLeaf', cx: '35%', cy: '30%', r: '80%' }, [stop(0, '#C3D0B5'), stop(.55, '#97A988'), stop(1, '#71856A')]),
      el('radialGradient', { id: 'gLeaf2', cx: '35%', cy: '30%', r: '80%' }, [stop(0, '#A9B99B'), stop(.6, '#7D9070'), stop(1, '#5C6F55')]),
    ]));

    const Y = t => 12 + 46 * Math.sin(Math.PI * t);          // the wire's droop
    const P = t => [6 + t * 388, Y(t)];
    const line = f => { let d = ''; for (let i = 0; i <= 120; i++) { const [x, y] = f(i / 120); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; } return d; };
    // two strands twisted round each other
    g.append(el('path', { d: line(t => { const [x, y] = P(t); return [x, y + .8 * Math.sin(t * 90)]; }), fill: 'none', stroke: '#3B3124', 'stroke-width': '.9' }));
    g.append(el('path', { d: line(t => { const [x, y] = P(t); return [x, y - .8 * Math.sin(t * 90)]; }), fill: 'none', stroke: '#5A4B36', 'stroke-width': '.7' }));
    // eucalyptus stem wandering along the wire
    g.append(el('path', { d: line(t => { const [x, y] = P(t); return [x, y + 2.2 * Math.sin(t * 23)]; }), fill: 'none', stroke: '#6E7B5C', 'stroke-width': '1.1', opacity: '.9' }));

    const leaf = (x, y, r, ang, front) => {
      const ry = r * (.82 + rnd() * .15);
      const grp = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)})`, opacity: (front ? .97 : .88).toFixed(2) });
      grp.append(el('path', { d: `M0 0L${(r * .55).toFixed(1)} 0`, stroke: '#6E7B5C', 'stroke-width': '.6' }));                // petiole
      grp.append(el('ellipse', { cx: (r * .55 + r).toFixed(1), cy: 0, rx: r.toFixed(1), ry: ry.toFixed(1), fill: rnd() < .55 ? 'url(#gLeaf)' : 'url(#gLeaf2)', stroke: '#5E6F52', 'stroke-width': '.3', 'stroke-opacity': '.6' }));
      grp.append(el('path', { d: `M${(r * .6).toFixed(1)} 0Q${(r * 1.5).toFixed(1)} ${(-ry * .12).toFixed(1)} ${(r * 2.3).toFixed(1)} 0`, stroke: '#E4ECD9', 'stroke-width': '.4', fill: 'none', opacity: '.75' }));
      return grp;
    };
    const back = [], front = [];
    for (let i = 0; i < 34; i++) {
      const t = (i + .3 + rnd() * .4) / 34, [x, y0] = P(t), y = y0 + 2.2 * Math.sin(t * 23);
      const r = 3.6 + rnd() * 3.2, tilt = (t - .5) * 50;
      back.push(leaf(x, y, r, -70 - rnd() * 50 + tilt, false));
      (rnd() < .4 ? front : back).push(leaf(x + 2, y, r * .9, 60 + rnd() * 50 + tilt, true));
    }
    back.forEach(n => g.append(n));

    // bulbs
    for (let i = 1; i < 10; i++) {
      const t = i / 10, [x, y] = P(t), cord = 5 + (i % 3) * 2.5 + rnd() * 2;
      const b = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((t - .5) * -14).toFixed(1)})` });
      const cy = cord + 6 + 8.5;
      b.append(el('circle', { cx: 0, cy: cy.toFixed(1), r: 22, fill: 'url(#gGlow)', class: 'bulb', style: `animation-delay:${(-rnd() * 4).toFixed(2)}s` }));
      b.append(el('path', { d: `M0 0V${cord.toFixed(1)}`, stroke: '#3B3124', 'stroke-width': '.8' }));
      b.append(el('rect', { x: -2.9, y: cord.toFixed(1), width: 5.8, height: 6.2, rx: 1, fill: 'url(#gBrass)' }));
      b.append(el('path', { d: `M-2.9 ${(cord + 2).toFixed(1)}h5.8M-2.9 ${(cord + 4).toFixed(1)}h5.8`, stroke: '#3E2F18', 'stroke-width': '.35', opacity: '.7' }));
      const gy = cord + 6.2;
      b.append(el('path', { d: `M-2.3 ${gy}C-2.3 ${gy + 2} -6.6 ${gy + 3.4} -6.6 ${gy + 8.5}A6.6 6.6 0 0 0 6.6 ${gy + 8.5}C6.6 ${gy + 3.4} 2.3 ${gy + 2} 2.3 ${gy}Z`,
        fill: 'url(#gGlass)', stroke: '#B88A3A', 'stroke-width': '.35', 'stroke-opacity': '.6' }));
      b.append(el('path', { d: `M-1.4 ${gy + .5}L-1.1 ${gy + 6}L-2.6 ${gy + 8.4}M1.4 ${gy + .5}L1.1 ${gy + 6}L2.6 ${gy + 8.4}`, stroke: '#9B5A1D', 'stroke-width': '.4', fill: 'none' }));
      b.append(el('path', { d: `M-2.6 ${gy + 8.4}q.65-1.3 1.3 0t1.3 0t1.3 0t1.3 0`, stroke: '#FF9E2C', 'stroke-width': '.9', fill: 'none', class: 'filament' }));
      b.append(el('path', { d: `M-4.6 ${gy + 6.5}Q-5.2 ${gy + 10} -3 ${gy + 12.6}`, stroke: '#fff', 'stroke-width': '.9', fill: 'none', opacity: '.8', 'stroke-linecap': 'round' }));
      g.append(b);
    }
    front.forEach(n => g.append(n));
  })();

  /* ── 3 · the envelope: seal → flap up → card rises → tap → lake ── */
  const cover = $('#cover'), hint = $('#envHint'), card = $('#card');
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  let stage = 0;   // 0 sealed · 1 opening · 2 card waiting · 3 gone
  async function openEnvelope() {
    if (stage) return; stage = 1;
    root.classList.add('opening');
    hint.style.opacity = 0;
    await wait(320);  root.classList.add('flap-open');
    await wait(460);  root.classList.add('flap-behind');
    await wait(400);  root.classList.add('card-up');
    await wait(1050); root.classList.add('card-out');
    await wait(500);
    hint.textContent = 'اضغط على البطاقة لفتح الدعوة'; hint.style.opacity = 1;
    card.tabIndex = 0; card.focus({ preventScroll: true });
    stage = 2;
  }
  async function enter() {
    if (stage !== 2) return; stage = 3;
    root.classList.remove('sealed');
    window.scrollTo(0, 0);
    root.classList.add('unveil');
    await wait(450);  root.classList.add('revealed');
    await wait(1800);
    cover.remove();
    root.classList.remove('opening', 'flap-open', 'flap-behind', 'card-up', 'card-out', 'unveil');
  }
  $('#seal').addEventListener('click', openEnvelope);
  $('#envelope').addEventListener('click', e => { if (!e.target.closest('#card')) openEnvelope(); });
  card.addEventListener('click', enter);
  document.addEventListener('keydown', e => {
    if (stage === 3 || !(e.key === 'Enter' || e.key === ' ')) return;
    e.preventDefault(); stage === 0 ? openEnvelope() : enter();
  });
  if (!root.classList.contains('sealed')) root.classList.add('revealed');

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

  function showThanks(att, name) {
    $('#thanksTitle').textContent = att === 'yes' ? `بانتظارك يا ${name.split(' ')[0]}` : 'وصلنا ردّك';
    $('#thanksText').textContent = att === 'yes'
      ? 'شكراً لك، حضورك سيكمل فرحتنا.'
      : 'سنفتقدك، ودعاؤك يكفينا. شكراً لأنك أخبرتنا.';
    form.hidden = true; thanks.hidden = false;
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
    if (!ok) { (name.length < 2 ? $('#fName') : form.querySelector('[name=attending]')).focus(); return; }

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
      showThanks(att, name);
      thanks.focus();
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
