import { test, expect } from "@playwright/test";
import { serializeJsonLd } from "../../src/lib/schema";

/**
 * `serializeJsonLd` is the single hardened boundary between JSON-LD data and
 * `dangerouslySetInnerHTML` (src/lib/schema/shared.ts, used by
 * src/components/shared/schema/JsonLd.tsx and
 * src/features/products/components/ProductTemplate.tsx). Plain
 * `JSON.stringify` never escapes `<`, so a string field sourced from content
 * (a product name, an FAQ answer) containing a literal `</script>` closes the
 * script tag early and lets subsequent text run as markup/script in the
 * document. This asserts the actual escaped output string, not just that the
 * call doesn't throw.
 */
test.describe("serializeJsonLd", () => {
  test("escapes an embedded </script> so it cannot close the JSON-LD tag", () => {
    const payload = {
      "@type": "FAQPage",
      name: "</script><script>alert(1)</script>",
    };

    const serialized = serializeJsonLd(payload);

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });

  test("round-trips to the exact same data once parsed back", () => {
    const payload = {
      "@type": "Product",
      description: "<b>bold</b> claim, and a literal </script> tag",
    };

    const serialized = serializeJsonLd(payload);
    expect(JSON.parse(serialized)).toEqual(payload);
  });
});
