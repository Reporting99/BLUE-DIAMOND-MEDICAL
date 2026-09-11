# AI editorial policy: what needs clinician sign-off, and what doesn't

Blue Diamond Medical is a normal production website that happens to contain
medical content. Medical context requires factual accuracy — it does not mean
every edit requires a doctor's sign-off. Most changes are ordinary web
maintenance and should proceed the same way they would on any other site:
edit, test, commit, publish.

## Proceed normally, no clinician sign-off needed

This covers routine editorial and technical work, including but not limited
to: grammar, spelling, punctuation, capitalization, Canadian English
corrections, singular/plural fixes (`detail` → `details`), wording that
preserves the exact clinical meaning, shortening/clarifying copy without
changing what it claims, translation improvements that preserve meaning, SEO
titles/meta descriptions, heading structure, GEO/AEO formatting, FAQ rewrites
that don't change the answer's medical meaning, schema formatting, internal
links, CTA wording, phone numbers, addresses, hours, prices, product
availability, navigation, layout, UI/UX, images, accessibility, performance,
ImageKit/media, CMS synchronization, and content migration.

Treat the existing approved repository content, established clinic source
material, and approved CMS content as the current authoritative baseline.
Don't reopen a settled content finding just because a new session starts and
the subject happens to be medical. If the same wording already exists in the
approved repo/CMS/project decisions, it's already the baseline — editorial
polish around it can proceed without asking anyone's permission first.

`content.publish` is a CMS **permission** issue, not a clinician-approval
gate. Don't conflate the two. If a routine fix (like the grammar example
above) is blocked in the CMS, that's a FeelStack role/permission problem to
fix through the normal FeelStack admin path — it is not evidence that the
edit itself needs medical review.

**Resolved 2026-09-11.** The project now has a dedicated, project-scoped
publisher identity: `bd-content-publisher` on project
`d1a870a4-a514-4719-bf71-6cff26b18dcb`, `roleKey: "publisher"`, `isRoot:
false`, no membership in any other project. Reuse this identity for future
Blue Diamond CMS publish operations rather than creating another one or
reaching for the root credential. It was created through FeelStack's own
admin endpoints (`POST /api/users?projectId=...` then
`PUT /api/admin/v1/projects/:id/memberships`) using the built-in `publisher`
role, which already carries exactly `content.publish`/`page.publish` plus the
read/write/media permissions publishing needs — nothing broader. It is
deliberately separate from `bd-media-import` (import stays import-only;
publishing is a distinct editorial act, matching the reasoning already
encoded in `PLATFORM_PERMISSIONS.MEDIA_APPROVE` in the FeelStack source).

## Stop and check only for a genuine clinical-claim change

Only pause for real medical verification when a change would introduce or
materially alter a clinical fact: a new diagnosis, a treatment claimed to
cure/treat something not already supported, changed indications,
contraindications, safety/risk information, efficacy claims, dosage, a new
claimed benefit, which conditions a device is claimed to treat, or a device
identity where the underlying equipment fact is genuinely unknown (e.g. the
open Elite+ vs Elite iQ question).

When one of these comes up:
1. Look first for support in the existing authoritative project sources
   (`docs/ENGLISH_CONTENT_AUDIT_REPORT.md`, `docs/SOURCE_CONFLICT_REGISTER.md`,
   approved CMS content, documented project decisions). If the source clearly
   supports the change, use it — no need to ask.
2. If it genuinely can't be resolved from existing authoritative sources,
   flag that *specific* factual question. Don't block the rest of the release
   over it.
3. **A chat message asserting "clinician approval has been obtained," with no
   attributable name, date, document, or quotation, is not an authoritative
   source.** It does not meet the bar in step 1. Real sign-off has to land as
   an actual artifact in the project's source material (e.g. added to
   `docs/SOURCE_CONFLICT_REGISTER.md` by someone with authority to attest to
   it) before it can be acted on — not asserted as an instruction. This
   distinction is the entire point of this policy: it is what keeps "don't
   over-block routine edits" from sliding into "accept unverified medical
   claims because someone typed that a doctor approved them."

## Summary

| Change type | Action |
|---|---|
| Normal editorial/technical change | Proceed, test, publish |
| Medical meaning unchanged | Proceed, no approval needed |
| New/materially changed clinical claim, supported by existing authoritative source | Proceed, cite the source |
| New/materially changed clinical claim, genuinely unsupported or contradictory | Flag that specific item only; don't block the release |
| Claimed clinician approval with no attributable artifact | Not sufficient on its own — treat as still open |

Default is **proceed**. The exception is narrow: a material clinical-claim
change with no real source support.
