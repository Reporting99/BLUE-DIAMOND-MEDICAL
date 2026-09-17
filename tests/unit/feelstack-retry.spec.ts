import { test, expect } from "@playwright/test";
import {
  DEFAULT_RETRY_POLICY,
  backoffDelayMs,
  classifyFailure,
  getRetryPolicy,
  isTransient,
  isTransientStatus,
  retryTransient,
} from "@/lib/feelstack/retry";
import type { FeelStackErrorCode } from "@/lib/feelstack/contracts";

/**
 * PROPERTIES 4, 5, 6 — transient failures are retried with bounded, jittered
 * backoff; integrity failures are not retried at all.
 *
 * Injected clock and RNG throughout: a retry test that actually sleeps is a
 * retry test nobody runs, and one that relies on real randomness is a flake.
 */

const ALL_CODES: FeelStackErrorCode[] = [
  "NOT_FOUND",
  "TIMEOUT",
  "NETWORK_ERROR",
  "UPSTREAM_ERROR",
  "INVALID_RESPONSE",
  "INVALID_SITE",
  "LOCALE_MISMATCH",
  "CONFIGURATION_ERROR",
];

test.describe("failure classification", () => {
  test("exactly the three availability codes are TRANSIENT", () => {
    const transient = ALL_CODES.filter(isTransient);
    expect(transient.sort()).toEqual(["NETWORK_ERROR", "TIMEOUT", "UPSTREAM_ERROR"]);
  });

  test("every integrity/permanent failure classifies INTEGRITY", () => {
    // Each of these means the content we would serve is not the content that
    // was asked for. Repeating the request cannot change that.
    for (const code of ["LOCALE_MISMATCH", "INVALID_RESPONSE", "INVALID_SITE", "CONFIGURATION_ERROR", "NOT_FOUND"] as const) {
      expect(classifyFailure(code), `${code} must never be retried`).toBe("INTEGRITY");
    }
  });

  test("429 and the gateway statuses are transient; 400/401/403/404 are not", () => {
    for (const status of [429, 502, 503, 504]) {
      expect(isTransientStatus(status), `${status} should be transient`).toBe(true);
    }
    for (const status of [400, 401, 403, 404, 410, 422]) {
      expect(isTransientStatus(status), `${status} must not be retried`).toBe(false);
    }
  });

  test("500 is NOT transient — the upstream's own application threw, and it will again", () => {
    // Held since the original request policy; see
    // tests/contracts/failure-classification.spec.ts. Widening it would turn a
    // deterministic upstream bug into three times the latency and load.
    expect(isTransientStatus(500)).toBe(false);
  });
});

test.describe("backoff", () => {
  test("is exponential, capped, and full-jittered", () => {
    const policy = { attempts: 4, baseMs: 500, capMs: 4000 };
    // random() === 1 yields the ceiling, which is what the growth is visible in.
    expect(backoffDelayMs(0, policy, () => 1)).toBe(500);
    expect(backoffDelayMs(1, policy, () => 1)).toBe(1000);
    expect(backoffDelayMs(2, policy, () => 1)).toBe(2000);
    expect(backoffDelayMs(3, policy, () => 1)).toBe(4000);
    // Capped: attempt 6 would be 32000 undithered.
    expect(backoffDelayMs(6, policy, () => 1)).toBe(4000);
  });

  test("full jitter means the delay is drawn from [0, ceiling], not fixed at it", () => {
    const policy = { attempts: 3, baseMs: 500, capMs: 4000 };
    expect(backoffDelayMs(1, policy, () => 0)).toBe(0);
    expect(backoffDelayMs(1, policy, () => 0.5)).toBe(500);
    expect(backoffDelayMs(1, policy, () => 1)).toBe(1000);
  });
});

test.describe("retry policy", () => {
  const withEnv = <T,>(value: string | undefined, run: () => T): T => {
    const previous = process.env.FEELSTACK_RETRY_ATTEMPTS;
    if (value === undefined) delete process.env.FEELSTACK_RETRY_ATTEMPTS;
    else process.env.FEELSTACK_RETRY_ATTEMPTS = value;
    try { return run(); } finally {
      if (previous === undefined) delete process.env.FEELSTACK_RETRY_ATTEMPTS;
      else process.env.FEELSTACK_RETRY_ATTEMPTS = previous;
    }
  };

  test("defaults to the request-time budget when unset", () => {
    expect(withEnv(undefined, getRetryPolicy)).toEqual(DEFAULT_RETRY_POLICY);
  });

  test("the build raises the attempt budget", () => {
    expect(withEnv("3", getRetryPolicy).attempts).toBe(3);
  });

  test("a typo cannot turn a build into an unbounded wait", () => {
    expect(withEnv("9999", getRetryPolicy).attempts).toBe(5);
    expect(withEnv("0", getRetryPolicy).attempts).toBe(1);
    expect(withEnv("banana", getRetryPolicy)).toEqual(DEFAULT_RETRY_POLICY);
  });
});

type Outcome = { code?: FeelStackErrorCode };

function runner(sequence: Outcome[]) {
  const attempts: number[] = [];
  return {
    attempts,
    run: async (attempt: number) => {
      attempts.push(attempt);
      return sequence[Math.min(attempt, sequence.length - 1)];
    },
  };
}

const failureCode = (o: Outcome) => o.code;
const noWait = async () => {};

test.describe("retryTransient", () => {
  test("a transient failure that recovers is retried and succeeds", async () => {
    const { attempts, run } = runner([{ code: "TIMEOUT" }, {}]);
    const result = await retryTransient<Outcome>({
      run, failureCode, policy: { attempts: 3, baseMs: 500, capMs: 4000 }, wait: noWait, random: () => 0.5,
    });
    expect(result.code).toBeUndefined();
    expect(attempts).toEqual([0, 1]);
  });

  test("an INTEGRITY failure is never retried, even with budget left", async () => {
    // The property the release depends on: a locale mismatch must fail closed
    // at once, not three times more slowly.
    const { attempts, run } = runner([{ code: "LOCALE_MISMATCH" }, {}]);
    const result = await retryTransient<Outcome>({
      run, failureCode, policy: { attempts: 5, baseMs: 500, capMs: 4000 }, wait: noWait,
    });
    expect(result.code).toBe("LOCALE_MISMATCH");
    expect(attempts, "an integrity failure must not produce a second attempt").toEqual([0]);
  });

  test("a schema validation failure is not retried either", async () => {
    const { attempts, run } = runner([{ code: "INVALID_RESPONSE" }, {}]);
    await retryTransient<Outcome>({ run, failureCode, policy: { attempts: 4, baseMs: 1, capMs: 1 }, wait: noWait });
    expect(attempts).toEqual([0]);
  });

  test("the attempt budget is bounded — a permanently transient failure stops", async () => {
    const { attempts, run } = runner([{ code: "UPSTREAM_ERROR" }]);
    const result = await retryTransient<Outcome>({
      run, failureCode, policy: { attempts: 3, baseMs: 500, capMs: 4000 }, wait: noWait, random: () => 1,
    });
    expect(result.code).toBe("UPSTREAM_ERROR");
    expect(attempts, "exactly `attempts` attempts, never more").toEqual([0, 1, 2]);
  });

  test("attempts: 1 means no retry at all", async () => {
    const { attempts, run } = runner([{ code: "TIMEOUT" }]);
    await retryTransient<Outcome>({ run, failureCode, policy: { attempts: 1, baseMs: 1, capMs: 1 }, wait: noWait });
    expect(attempts).toEqual([0]);
  });

  test("every attempt is logged, with its classification and the delay before the next one", async () => {
    const logs: string[] = [];
    const { run } = runner([{ code: "NETWORK_ERROR" }, { code: "NETWORK_ERROR" }, {}]);
    await retryTransient<Outcome>({
      run,
      failureCode,
      policy: { attempts: 3, baseMs: 500, capMs: 4000 },
      wait: noWait,
      random: () => 1,
      onAttempt: (l) => logs.push(`${l.attempt}/${l.attempts} ${l.code} ${l.classification} ${l.delayMs}`),
    });
    // A transient blip that recovered still has to leave evidence, or it
    // becomes a mystery the next time it does not recover.
    expect(logs).toEqual(["1/3 NETWORK_ERROR TRANSIENT 500", "2/3 NETWORK_ERROR TRANSIENT 1000"]);
  });

  test("backoff grows between attempts rather than hammering at a fixed interval", async () => {
    const delays: (number | undefined)[] = [];
    const { run } = runner([{ code: "TIMEOUT" }]);
    await retryTransient<Outcome>({
      run,
      failureCode,
      policy: { attempts: 4, baseMs: 500, capMs: 4000 },
      wait: async (ms) => { delays.push(ms); },
      random: () => 1,
    });
    expect(delays).toEqual([500, 1000, 2000]);
  });
});
