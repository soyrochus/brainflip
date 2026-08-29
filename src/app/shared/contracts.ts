/**
 * The operations the Brainflip page may call on the Bun host, with the input it
 * sends and the output it receives. Kept in sync with `shared/validators.ts`
 * (runtime checks) and `host/handlers.ts` (implementation).
 */
export type AppOperations = {
  loadScores: {
    input: Record<string, never>;
    output: { scores: number[] };
  };
  saveScore: {
    input: { score: number };
    output: { scores: number[] };
  };
};
