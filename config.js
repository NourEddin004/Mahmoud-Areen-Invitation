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
  // full names — shown in small type under the big first names
  groomFullAr: 'محمود جواد صالح',
  brideFullAr: 'عرين وجيه شهوان',
  groomFullEn: 'Mahmoud Jawad Saleh',
  brideFullEn: 'Areen Wajeeh Shahwan',

  // ── the day ───────────────────────────────────────────────────────
  // ISO date-time in Jordan time (+03:00). Drives the date block,
  // the countdown and the "add to calendar" file.
  date    : '2026-11-28T17:00:00+03:00',   // Saturday 28 Nov 2026, 5 PM (guests arrive)
  timeAr  : 'الخامسة مساءً',

  // ── the place ─────────────────────────────────────────────────────
  venueAr : 'منتجع موفنبيك البحر الميت',
  cityAr  : 'البحر الميت — الأردن',
  mapUrl  : 'https://maps.app.goo.gl/6iPR6n12V6eGU8RT8',

  venueEn : 'Mövenpick Resort & Spa Dead Sea',
  addressAr: 'سويمة — البحر الميت، الأردن',
  lat     : 31.717054,                 // for the Apple Maps button
  lng     : 35.587433,

  // ── the invitation wording ────────────────────────────────────────
  familiesAr: ['صالح', 'شهوان'],       // آل صالح & آل شهوان
  whenAr  : 'يوم السبت، الثامن والعشرين من تشرين الثاني 2026',

  // ── programme ⚠️ SAMPLE TIMES — confirm with the couple ───────────
  programme: [
    ['5:00', 'استقبال الضيوف',  'نرحّب بكم على ضفاف البحر الميت'],
    ['6:00', 'زفّة العروسين',     'لنستقبلهما معاً بالفرح'],
    ['7:00', 'العشاء',           'على شرف الحضور الكريم'],
    ['8:30', 'قطع الكعكة',       'والرقصة الأولى'],
  ],

  // ── dress code ⚠️ SAMPLE — confirm with the couple ─────────────────
  attireAr: 'لباس رسمي',
  attireNoteAr: 'نرجو ترك اللون الأبيض والعاجي للعروس.',
  palette : [['#EFE6D2','شمبانيا'], ['#C9B48A','ذهبي'], ['#A9B79A','مريمية'], ['#6F7F5E','زيتي'], ['#8A7356','بنّي'], ['#2E2A22','أسود']],

  // ── optional photo for the oval frame (path or URL, '' = monogram) ─
  photo   : '',

  // ── RSVP ──────────────────────────────────────────────────────────
  rsvpBy  : '',             // e.g. '2026-11-22' — shown under the form; '' hides it
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
