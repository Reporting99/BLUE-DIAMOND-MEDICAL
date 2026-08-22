# Booking Systems

Blue Diamond Medical has **no internal booking calendar, form, or patient-data collection**, by design — every "Book" CTA on the site resolves through the single source of truth at `src/config/booking.ts`, never a hardcoded URL in a component. This keeps PHI entirely off this codebase.

## Channels

| Channel | Provider | Destination | Used by |
|---|---|---|---|
| `family-doctor` | Mika | `https://mika.care` | Book with your family doctor (header, homepage, `/medical`) |
| `walk-in` | Mika | `https://mika.care` | "Skip the Waiting Room" walk-in / new-patient booking |
| `eye-screening` | Euclid Telehealth | `https://euclidtelehealth.org/book-now` | `/medical/eye-screening` |
| `aesthetics-consultation` | Jane App | `https://bluediamondmedical.janeapp.com` | Aesthetics treatment pages, `/aesthetics`, `/aesthetics/consultation` (gated) |
| `phone-medical-botox` | Telephone | `tel:+18254131113` | Medical Botox (migraine/TMJ/hyperhidrosis) — no online booking supplied for this service line |
| `phone-aesthetics` | Telephone | `tel:+14032471418` | General aesthetics phone line, distinct from the medical line per `docs/DATA_APPROVAL_BLOCKERS.md` |

## Enforcement

- `getBookingUrl(channel)` is the only supported way to render a booking CTA; every template (`MedicalServiceTemplate`, `AestheticTreatmentTemplate`, doctor profiles, homepage, `/book-appointment` hub) imports it rather than inlining a URL.
- `allowedBookingHosts` (`mika.care`, `euclidtelehealth.org`, `bluediamondmedical.janeapp.com`) is validated by `src/lib/security/booking-allowlist.ts` — any future channel pointing outside this allowlist fails a check rather than silently linking out to an unreviewed host.
- All URL-type destinations open in a new tab (`target="_blank" rel="noopener noreferrer"`) so leaving the site to book is an explicit, visible action, not a silent redirect.
- `/book-appointment` is a routing hub, not a form: it presents the channel choices above and links out — it does not itself collect name, contact info, or health information.
- The general `ContactForm` (`/contact`) is validated (`src/lib/validation/`) to reject health/medical free-text content by design, keeping it a pure contact-request form, not a de facto intake form.

## Arabic-language accommodation note — planned for Part 2, not yet implemented

The brief allows Arabic pages to note that an external booking system may open in English. This was checked, not assumed: `mika.care` redirects (server-side, on Mika's own infrastructure) to `chat.mikatahealth.com`, which could not be confirmed either way for Arabic support via an automated fetch (likely a JS-rendered app). No approved source confirms or denies Arabic support for any of the three providers (Mika, Euclid Telehealth, Jane App).

Rather than assert an unverified fact ("this system is English-only") or invent a workaround, the recommended copy uses honest, qualified language that's true regardless of the actual answer — for Part 2 to implement as a small `sr-only`-adjacent or visible caption near each external-booking CTA on **Arabic pages only**:

> **AR**: "سيتم فتح هذا النظام في نافذة جديدة، وقد لا يكون متوفرًا باللغة العربية." — **EN equivalent for reference**: "This system opens in a new window and may not be available in Arabic."

This is a content/copy addition, not a visual redesign — tracked here as a Part 2 implementation item rather than implemented during this content-and-research phase.

## What is deliberately absent

- No appointment calendar or slot picker.
- No patient portal or login.
- No form field anywhere on the site asks for date of birth, health card number, symptoms, or medical history.
- No booking data is stored, logged, or transmitted anywhere by this codebase — the three providers (Mika, Euclid, Jane) each run their own HIPAA/PIPEDA-appropriate systems independently of this site.
