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

  /* ── 2 · the garland: bulbs on a catenary with eucalyptus ──────── */
  (function garland() {
    const g = $('#garlandG'); if (!g) return;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    const sag = t => 10 + 48 * Math.sin(Math.PI * t);         // a gentle droop
    const pt = t => [t * 400, sag(t)];
    let d = 'M0 10';
    for (let i = 1; i <= 40; i++) { const [x, y] = pt(i / 40); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; }
    g.append(el('path', { d, fill: 'none', stroke: '#6A5D47', 'stroke-width': '.8', opacity: '.7' }));
    // leaves along the wire
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const t = (i + .5) / 46, [x, y] = pt(t), up = i % 2 ? -1 : 1;
      const a = (up * (35 + rnd() * 30)) + (t - .5) * 40, s = 5 + rnd() * 3;
      const leaf = el('path', {
        d: `M0 0C${s * .6} ${-s * .9} ${s * 1.8} ${-s * .7} ${s * 2.2} 0C${s * 1.8} ${s * .7} ${s * .6} ${s * .9} 0 0Z`,
        transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})`,
        fill: rnd() < .5 ? '#9AAC8A' : '#7F9470', opacity: (.7 + rnd() * .3).toFixed(2),
      });
      g.append(leaf);
    }
    // bulbs hang below the wire
    for (let i = 1; i < 10; i++) {
      const t = i / 10, [x, y] = pt(t);
      const b = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      b.append(el('path', { d: 'M0 0V6', stroke: '#6A5D47', 'stroke-width': '.8' }));
      b.append(el('circle', { cx: 0, cy: 14, r: 11, fill: '#F6D98B', opacity: '.22', class: 'bulb', style: `animation-delay:${(i * .37).toFixed(2)}s` }));
      b.append(el('rect', { x: -2.4, y: 5, width: 4.8, height: 3.5, rx: '.8', fill: '#8C7A5C' }));
      b.append(el('ellipse', { cx: 0, cy: 14, rx: 4.6, ry: 6.2, fill: '#FBEFC8', stroke: '#C9A65E', 'stroke-width': '.6' }));
      g.append(b);
    }
  })();

  /* ── 3 · the envelope → cartouche → lake ───────────────────────── */
  const cover = $('#cover');
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  let opened = false;
  async function open() {
    if (opened) return; opened = true;
    root.classList.add('opening');
    root.classList.remove('sealed');
    window.scrollTo(0, 0);
    await wait(380);  root.classList.add('flap-open');
    await wait(900);  root.classList.add('unveil');
    await wait(500);  root.classList.add('revealed');
    await wait(1700);
    cover.remove();
    root.classList.remove('opening', 'flap-open', 'unveil');
  }
  $('#seal').addEventListener('click', open);
  // tapping anywhere on the envelope opens it too — the seal is just the obvious target
  $('.env').addEventListener('click', e => { if (!e.target.closest('.seal')) open(); });
  document.addEventListener('keydown', e => {
    if (!opened && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); }
  });
  if (!root.classList.contains('sealed')) root.classList.add('revealed');

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

  /* ── 6 · add to calendar (.ics) ────────────────────────────────── */
  $('#calBtn').addEventListener('click', () => {
    const z = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(when.getTime() + 4 * 3600e3);
    const esc = s => String(s || '').replace(/([,;\\])/g, '\\$1');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//invite//AR', 'BEGIN:VEVENT',
      `UID:${z(when)}-${(C.groomEn || 'g').toLowerCase()}@invite`, `DTSTAMP:${z(new Date())}`,
      `DTSTART:${z(when)}`, `DTEND:${z(end)}`,
      `SUMMARY:${esc(`زفاف ${C.groomFullAr || C.groomAr} و${C.brideFullAr || C.brideAr}`)}`,
      `LOCATION:${esc(`${C.venueAr}، ${C.cityAr}`)}`,
      `DESCRIPTION:${esc(C.mapUrl || '')}`,
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })),
      download: 'wedding.ics',
    });
    document.body.append(a); a.click(); a.remove();
  });

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
