import { Globe, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  AESTHETICS_CONSULTATION_NOTE,
  getBookingUrl,
  isBookable,
  type BookingChannel,
} from "@/config/booking";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * CL-005 / CL-007 / CL-018 / CL-027 — the three ways into the clinic, stated
 * together wherever a booking decision is made.
 *
 * Why one component: the client's complaint was that the site explained
 * online booking, mentioned the phone only in the Botox context, and never
 * said "you can just come in". Fixing that per-page would produce three
 * different answers. This block always shows all three routes, and marks
 * which patient type each online destination is for.
 *
 * `online` semantics:
 *  - a channel whose destination resolves     → a real online button
 *  - a channel whose URL has not been supplied → the online row is OMITTED,
 *    and the caller's `pendingNote` explains that this patient type books by
 *    phone or in person for now (CL-007 — never a guessed URL, never a dead
 *    button)
 *  - `online: null`                            → this service has no online
 *    route at all by policy (CL-018, minor procedures)
 */
export type AccessAudience = "registered" | "new-patient" | "aesthetics" | "none";

const COPY = {
  en: {
    heading: "How to book",
    online: "Book online",
    phone: "Book by phone",
    phoneBody: "Call the clinic during opening hours and reception will book you in.",
    inPerson: "Visit the clinic",
    inPersonBody: "Come to reception at",
    registered: "Registered and current patients",
    newPatient: "New patients and walk-ins",
    aesthetics: "Aesthetic treatment consultations",
    noOnline: "This appointment cannot be booked online.",
    pending:
      "Online booking for new patients and walk-ins is being set up. Until it is live, please call the clinic or come in — walk-ins are welcome.",
  },
  ar: {
    heading: "كيفية الحجز",
    online: "الحجز عبر الإنترنت",
    phone: "الحجز عبر الهاتف",
    phoneBody: "اتصلوا بالعيادة خلال ساعات العمل وسيقوم الاستقبال بحجز موعدكم.",
    inPerson: "زيارة العيادة",
    inPersonBody: "توجهوا إلى الاستقبال في",
    registered: "المرضى المسجّلون والحاليون",
    newPatient: "المرضى الجدد والزيارات بدون موعد",
    aesthetics: "استشارات العلاجات التجميلية",
    noOnline: "لا يمكن حجز هذا الموعد عبر الإنترنت.",
    pending:
      "يجري حاليًا تفعيل الحجز الإلكتروني للمرضى الجدد والزيارات بدون موعد. وحتى ذلك الحين، يُرجى الاتصال بالعيادة أو الحضور مباشرة — الزيارات بدون موعد مُرحَّب بها.",
  },
} as const;

const AUDIENCE_KEY: Record<Exclude<AccessAudience, "none">, keyof typeof COPY.en> = {
  registered: "registered",
  "new-patient": "newPatient",
  aesthetics: "aesthetics",
};

export function AccessOptions({
  locale,
  channels,
  heading = true,
  className,
}: {
  locale: Locale;
  /** Online destinations to offer, each labelled by the patient type it serves. */
  channels: { channel: BookingChannel; audience: AccessAudience }[];
  heading?: boolean;
  className?: string;
}) {
  const t = COPY[locale];

  /* CL-042 - the phone row must be the line that actually answers for
     THIS block. Blue Diamond publishes two genuinely different numbers
     (docs/SOURCE_CONFLICT_REGISTER.md CONF-001): the general medical /
     walk-in line, and the aesthetics reception line. This component is
     rendered on both medical routes and the aesthetic-consultation
     flow, and it used to hardcode the medical line - so an aesthetics
     page told visitors to call the medical booking desk.

     A block is the aesthetics one only when EVERY online destination it
     offers is an aesthetic one; a mixed block is a medical surface that
     happens to mention aesthetics, and keeps the medical line. The
     address is always the clinic's - the aesthetics reception sits at
     the same address, and Elite iQ's off-site venue is stated by the
     treatment page itself, never inferred here. */
  const isAestheticsBlock =
    channels.length > 0 &&
    channels.every((c) => c.audience === "aesthetics" || c.channel === "phone-aesthetics");
  const phoneLine = isAestheticsBlock ? siteConfig.aesthetics : siteConfig.clinic;
  const phone = { ...siteConfig.clinic, ...phoneLine, address: siteConfig.clinic.address };

  const resolved = channels.map((c) => ({ ...c, destination: getBookingUrl(c.channel) }));
  const online = resolved.filter((c) => c.destination.type === "url" && isBookable(c.destination));
  const pending = resolved.filter((c) => c.destination.type === "pending");
  const aesthetics = resolved.find((c) => c.audience === "aesthetics");

  return (
    <section className={cn("rounded-lg border border-border bg-surface p-5 sm:p-6", className)}>
      {heading ? <h2 className="text-h4 font-heading">{t.heading}</h2> : null}

      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {/* 1 — ONLINE */}
        <li className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {t.online}
          </p>
          {online.length ? (
            <div className="flex flex-col gap-2">
              {online.map((c) => (
                <span key={c.channel} className="flex flex-col gap-1">
                  {c.audience !== "none" ? (
                    <span className="text-xs font-medium uppercase tracking-[0.06em] text-text-secondary">
                      {t[AUDIENCE_KEY[c.audience]]}
                    </span>
                  ) : null}
                  <a
                    href={c.destination.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {c.destination.label[locale]}
                  </a>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">{t.noOnline}</p>
          )}
          {pending.length ? <p className="text-sm text-text-secondary">{t.pending}</p> : null}
        </li>

        {/* 2 — PHONE */}
        <li className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {t.phone}
          </p>
          <p className="text-sm text-text-secondary">{t.phoneBody}</p>
          <a
            href={`tel:${phone.phone}`}
            className="ltr-run inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
          >
            {phone.phoneDisplay}
          </a>
          {/* CL-042 - name the line, so a phone number is never
              context-free. */}
          <span className="text-xs text-text-secondary">{phone.name}</span>
        </li>

        {/* 3 — IN PERSON */}
        <li className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {t.inPerson}
          </p>
          <p className="text-sm text-text-secondary">
            {t.inPersonBody} {phone.address.line1}, {phone.address.city} {phone.address.region}{" "}
            {phone.address.postalCode}.
          </p>
        </li>
      </ul>

      {/* CL-008 — the client's exact approved sentence, shown wherever the
          aesthetics consultation channel is offered. No approved Arabic
          rendering was supplied, so Arabic renders nothing here rather than a
          machine translation of a clinical instruction. */}
      {aesthetics && AESTHETICS_CONSULTATION_NOTE[locale] ? (
        <p className="mt-4 rounded-md border border-border bg-background px-4 py-3 text-sm">
          {AESTHETICS_CONSULTATION_NOTE[locale]}
        </p>
      ) : null}
    </section>
  );
}
