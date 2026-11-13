/* ═══════════════════════════════════════════════════════════════════
   Everything that changes per client lives in this one file.
   Both pages read it: the invitation (index.html) and the couple's
   list (list/index.html).

   After editing, bump ?v= on the <script src="config.js?v=…"> tags in
   index.html and list/index.html so phones that already opened the link
   don't keep the old copy.
   ═══════════════════════════════════════════════════════════════════ */

window.INVITE = {
  // ── the couple ────────────────────────────────────────────────────
  groomAr : 'محمود',
  brideAr : 'عرين',
  groomEn : 'Mahmoud',
  brideEn : 'Areen',

  // ── the day ───────────────────────────────────────────────────────
  // ISO date-time in Jordan time (+03:00). Drives the date block,
  // the countdown and the "add to calendar" file.
  date    : '2027-06-18T19:30:00+03:00',
  timeAr  : 'السابعة والنصف مساءً',

  // ── the place ─────────────────────────────────────────────────────
  venueAr : 'قاعة الحديقة',
  cityAr  : 'عمّان',
  mapUrl  : 'https://maps.google.com/?q=Amman',

  // ── the letter (keep it short — three or four lines read best) ────
  letterAr: [
    'بعد سنواتٍ من الأحلام الصغيرة، اخترنا أن نكمل الطريق معاً.',
    'وليس لفرحتنا أن تكتمل من دونكم — أنتم الذين كنتم معنا في كل خطوة.',
    'شاركونا الليلة التي ننتظرها، ودعاءكم الذي نحمله معنا.',
  ],

  // ── optional photo for the oval frame (path or URL, '' = monogram) ─
  photo   : '',

  // ── RSVP ──────────────────────────────────────────────────────────
  rsvpBy  : '2027-06-01',   // shown under the form; '' hides it
  maxGuests: 5,             // the stepper's ceiling (incl. the guest)
  whatsapp: '',             // e.g. '9627XXXXXXXX' — fallback if the network call fails
};

/* ── Supabase ─────────────────────────────────────────────────────────
     url — Supabase → Project Settings → Data API → Project URL
     key — same page → API keys → anon / publishable

   The anon key is meant to be public: the policies in sql/setup.sql let
   it INSERT a reply and nothing else. Never put the service_role key here.
   While url is empty the invitation runs in preview mode (the form thanks
   the guest but sends nothing) and /list shows sample data.
   ──────────────────────────────────────────────────────────────────── */
window.INVITE_DB = {
  url  : 'https://cbcbowwsqobxyhssxboj.supabase.co',
  key  : '',   // ← paste the anon / publishable key here
  table: 'rsvp',
};
