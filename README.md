# محمود & عرين — Mahmoud & Areen

An online wedding invitation, mobile first, with two links:

| Link | Who gets it | What it is |
|---|---|---|
| `/` | everyone the couple invites | the invitation + RSVP form |
| `/list/#s=SECRET` | the couple only | live list of who is coming, who isn't, and how many people |

Personal links also work: `/?to=أبو خالد` writes the guest's name on the envelope and pre-fills the RSVP.

## Section order

Follows the client's "The Arch" invitation, redrawn in this design:
envelope (opens on its own after the card rises) → Save the Date lake →
engraved invitation wording → countdown → venue card → ticket-style RSVP (name, attendance, guests, note) → moonlit footer.

## The design — a blend of the two references

* **Château reference:** the cream blind-embossed envelope sealed with a sage wax monogram, the string-light garlands, the countdown, the "a word from us" letter card, the RSVP flow.
* **Swan reference:** the scalloped cartouche that opens onto a sepia engraved lake, *Save the Date* in script, the filigree oval frame, two swans whose necks make a heart, and the closing olive card with the monogram.

The palette is the meeting point of both: engraving sepia on cream paper, sage from the seal and the greenery, olive for the close. Arabic leads (Aref Ruqaa for display, Amiri for reading, never under 15px); Pinyon Script and Cormorant Garamond carry the Latin accents.

All artwork is original. `tools/scene.py` draws the lake as SVG; `tools/render.sh` bakes the still painting into `assets/lake.webp` (96 KB) and only the moving parts (swans, ripples, birds) stay live in `assets/lake-fx.svg` — that split is what keeps the opening smooth on phones.

## Files

```
index.html  style.css  script.js   the invitation
list/index.html                    the couple's dashboard (self-contained)
config.js                          ← every client detail + Supabase settings
sql/setup.sql                      database setup (secret placeholder)
tools/scene.py + tools/render.sh   regenerate assets/lake.webp + lake-fx.svg
```

## Going live — checklist

1. **Details:** edit `config.js` (date, time, venue, map link, letter, optional photo, WhatsApp fallback).
2. **Supabase:** run `sql/setup.local.sql` (git-ignored, has the real secret) in the SQL Editor.
   Paste the project's **anon / publishable** key into `config.js → INVITE_DB.key`.
3. Bump `?v=` on the `config.js` script tags in `index.html` and `list/index.html`.
4. Send `/` to guests. Send the `/list/#s=…` link (in `COUPLE-LINK.local.txt`) to the couple privately.

Until the key is filled in, the invitation runs in **preview mode** (the form thanks the guest but sends nothing) and `/list/` shows sample data with a banner.

The anon key is public by design — the policies only let it insert a reply. The `service_role` key must never go in this repo.

## Run locally

```bash
python3 -m http.server 8731
```
