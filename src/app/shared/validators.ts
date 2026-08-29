import { expectNoKeys, expectOnlyKeys, ValidationError } from "../../kit/shared/validation";

const MAX_SCORE = 1_000_000;

/**
 * Runtime checks for messages arriving from the WebView. Types do not exist at
 * runtime and page messages can be malformed or hostile, so the host runs a
 * handler only after its validator accepts the input.
 */
export const validators = {
  loadScores(raw: unknown): Record<string, never> {
    return expectNoKeys(raw);
  },

  saveScore(raw: unknown): { score: number } {
    const input = expectOnlyKeys(raw, ["score"]);
    const score = input.score;
    if (
      typeof score !== "number" ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > MAX_SCORE
    ) {
      throw new ValidationError(`Expected score to be an integer between 0 and ${MAX_SCORE}`);
    }
    return { score };
  },
};
