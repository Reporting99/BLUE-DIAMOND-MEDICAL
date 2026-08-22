import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

/**
 * Locale-aware 404. Next.js can't pass the [locale] param into not-found.tsx
 * directly, so this renders bilingually rather than guessing the wrong
 * language — a safe default when the failing route's own locale is unknown.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="text-display-2 font-heading">
        Page not found <span className="text-text-secondary">·</span> الصفحة غير موجودة
      </h1>
      <p className="max-w-md text-body text-text-secondary">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        <br />
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <div className="mt-4 flex gap-3">
        <Button render={<Link href="/en" />}>English home</Button>
        <Button variant="outline" render={<Link href="/ar" />}>
          الصفحة الرئيسية
        </Button>
      </div>
    </Container>
  );
}
