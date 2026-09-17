import type { FeelStackErrorCode } from "./contracts";

/**
 * TRANSIENT vs INTEGRITY — the distinction that decides whether a FeelStack
 * failure may be retried at all.
 *
 * No `import "server-only"`: pure classification and arithmetic, no env or
 * secret access beyond one numeric tuning knob. The credentialed boundary is
 * `./client`.
 *
 * WHY THIS EXISTS. `contracts.ts` already separates a confirmed-absent page
 * (`NOT_FOUND`) from a CMS outage (`OUTAGE_ERROR_CODES`), and `./errors`
 * already maps upstream codes onto ours. Neither answers the question the
 * release pipeline kept getting wrong: *may this be tried again?* Those are
 * genuinely different axes. `INVALID_RESPONSE` is an outage-class code — a page
 * must not 404 on it — and is simultaneously the least retryable failure there
 * is, because a payload that failed schema validation will fail it identically
 * on the next attempt. Retrying it only spends the build's time before failing
 * in the same place.
 *
 * TRANSIENT means the request could plausibly succeed unchanged if repeated:
 * a timeout, a reset connection, a temporary DNS failure, a 429, a 502/503/504.
 * Those are properties of the moment, not of the request.
 *
 * INTEGRITY means the answer would be the same every time, and is about
 * CORRECTNESS rather than availability: a locale mismatch, a schema validation
 * failure, the wrong site key, a malformed payload, a configuration error.
 * Every one of these is a statement that the content we would serve is not the
 * content that was asked for — and for a bilingual medical site, serving it
 * anyway is worse than serving nothing. They fail closed, immediately, with no
 * retry and no fallback to a stale or static value when the caller specifically
 * asked for CMS content.
 */
export type FeelStackFailureClass = "TRANSIENT" | "INTEGRITY";

/**
 * The only codes that may be retried. Deliberately a positive list: a new error
 * code added to `FeelStackErrorCode` later defaults to INTEGRITY and therefore
 * to failing closed, which is the safe direction for a code this build has
 * never seen.
 */
const TRANSIENT_CODES: readonly FeelStackErrorCode[] = ["TIMEOUT", "NETWORK_ERROR", "UPSTREAM_ERROR"];

export function classifyFailure(code: FeelStackErrorCode): FeelStackFailureClass {
  return TRANSIENT_CODES.includes(code) ? "TRANSIENT" : "INTEGRITY";
}

export function isTransient(code: FeelStackErrorCode): boolean {
  return classifyFailure(code) === "TRANSIENT";
}

/**
 * HTTP statuses that are transient regardless of what envelope came with them.
 *
 * 429 belongs here: rate limiting is by definition temporary. It still
 * classifies as UPSTREAM_ERROR, so an exhausted retry surfaces as an outage and
 * never as a 404.
 *
 * 500 deliberately does NOT. A gateway status (502/503/504) says the upstream
 * was unreachable or overloaded — a property of the moment. A 500 says the
 * upstream's own application threw, which is a property of the request and
 * repeats identically. This repository has held that line since the original
 * request policy (tests/contracts/failure-classification.spec.ts: "500 is not
 * in the retryable status list"), and widening it here would silently turn a
 * deterministic upstream bug into three times the latency and three times the
 * load.
 */
const TRANSIENT_STATUSES: readonly number[] = [429, 502, 503, 504];

export function isTransientStatus(status: number): boolean {
  return TRANSIENT_STATUSES.includes(status);
}

export interface RetryPolicy {
  /** TOTAL attempts, including the first. 1 means "no retry". */
  attempts: number;
  baseMs: number;
  capMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = { attempts: 2, baseMs: 500, capMs: 4000 };

/**
 * Request-time and build-time want different budgets, and only one of them can
 * afford to wait.
 *
 * A page render that a visitor is waiting on should retry once and move on —
 * that is `DEFAULT_RETRY_POLICY`, and it is what the previous `MAX_RETRIES = 1`
 * did. A production BUILD is the opposite case: it happens once, nobody is
 * blocked on any individual request, and a single transient CMS blip failing it
 * costs a whole release. `FEELSTACK_RETRY_ATTEMPTS=3` is set only by ci.yml's
 * `release-artifact` job for exactly that reason.
 *
 * Clamped to 1..5 so a typo cannot turn a build into an unbounded wait.
 */
export function getRetryPolicy(): RetryPolicy {
  const raw = process.env.FEELSTACK_RETRY_ATTEMPTS;
  if (!raw) return DEFAULT_RETRY_POLICY;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_RETRY_POLICY;
  return { ...DEFAULT_RETRY_POLICY, attempts: Math.min(Math.max(parsed, 1), 5) };
}

/**
 * FULL JITTER exponential backoff — `random(0, min(cap, base * 2^n))`.
 *
 * Full jitter rather than the more obvious `base * 2^n` because every page of a
 * production build asks the same CMS at the same moment. Undithered backoff
 * makes a fleet of concurrent renders retry in lockstep, re-hitting an
 * already-struggling upstream in a synchronised wave — the retry storm that
 * turns a brief blip into a sustained outage. `attempt` is 0-based: the delay
 * BEFORE attempt n+1.
 */
export function backoffDelayMs(
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  random: () => number = Math.random,
): number {
  const ceiling = Math.min(policy.capMs, policy.baseMs * 2 ** Math.max(attempt, 0));
  return Math.round(random() * ceiling);
}

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

export interface RetryAttemptLog {
  attempt: number;
  attempts: number;
  code: FeelStackErrorCode;
  classification: FeelStackFailureClass;
  delayMs?: number;
}

export interface RetryTransientOptions<T> {
  /** Runs the operation; returns the outcome plus its classified code when failed. */
  run: (attempt: number) => Promise<T>;
  /** `undefined` when the outcome succeeded. */
  failureCode: (outcome: T) => FeelStackErrorCode | undefined;
  policy?: RetryPolicy;
  /** Injected in tests; real callers get Math.random and setTimeout. */
  random?: () => number;
  wait?: (ms: number) => Promise<void>;
  onAttempt?: (log: RetryAttemptLog) => void;
}

/**
 * Runs `run` until it succeeds, until a non-TRANSIENT failure is returned, or
 * until the attempt budget is spent — whichever comes first.
 *
 * Returns the LAST outcome rather than throwing: the caller already speaks
 * `FeelStackResult`, and converting a classified failure into an exception here
 * would lose the code that the whole classification exists to preserve.
 *
 * Every attempt is reported through `onAttempt` before the sleep, so an
 * eventually-successful retry still leaves evidence in the build log. A
 * transient failure that silently recovered is exactly the kind of thing that
 * becomes a mystery six releases later.
 */
export async function retryTransient<T>(options: RetryTransientOptions<T>): Promise<T> {
  const policy = options.policy ?? DEFAULT_RETRY_POLICY;
  const wait = options.wait ?? sleep;
  let outcome = await options.run(0);

  for (let attempt = 0; attempt < policy.attempts - 1; attempt += 1) {
    const code = options.failureCode(outcome);
    if (code === undefined) return outcome;

    const classification = classifyFailure(code);
    if (classification === "INTEGRITY") {
      // No retry, no backoff, no fallback: a wrong answer does not become
      // right by being asked for again.
      options.onAttempt?.({ attempt: attempt + 1, attempts: policy.attempts, code, classification });
      return outcome;
    }

    const delayMs = backoffDelayMs(attempt, policy, options.random);
    options.onAttempt?.({ attempt: attempt + 1, attempts: policy.attempts, code, classification, delayMs });
    await wait(delayMs);
    outcome = await options.run(attempt + 1);
  }

  const finalCode = options.failureCode(outcome);
  if (finalCode !== undefined) {
    options.onAttempt?.({
      attempt: policy.attempts,
      attempts: policy.attempts,
      code: finalCode,
      classification: classifyFailure(finalCode),
    });
  }
  return outcome;
}
