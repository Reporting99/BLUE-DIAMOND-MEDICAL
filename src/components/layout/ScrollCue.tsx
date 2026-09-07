import { ChevronDown } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * CL-003 — a restrained continuation cue.
 *
 * The client's report was that Home and Medical Care look finished at the
 * first viewport, so visitors never scroll. Two changes answer that together:
 * the hero's minimum height is reduced so the next section's top edge is
 * already visible, and this cue sits at the hero's lower edge to say the page
 * continues.
 *
 * It is decorative and `aria-hidden`: the content below is reachable by
 * scrolling, by keyboard, and by the in-page links, so this adds nothing for
 * assistive technology and would only be one more thing to tab past. The
 * motion is `motion-safe:` only — reduced-motion users get the static mark.
 */
export function ScrollCue({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex select-none items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary",
        className,
      )}
    >
      {locale === "ar" ? "تابعوا التصفح" : "Scroll"}
      <ChevronDown className="size-4 motion-safe:animate-bounce" />
    </span>
  );
}
