import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Trusted Bun-side work for Brainflip: a small persisted top-scores list.
 *
 * This replaces the former Express `/api/scores` routes. The scores live in a
 * per-user data directory so the relocated executable keeps them across runs
 * without writing inside its own bundle.
 */

const MAX_TOP_SCORES = 5;

function scoresFile(): string {
  const xdg = process.env.XDG_DATA_HOME?.trim();
  const base =
    process.platform === "darwin"
      ? join(homedir(), "Library", "Application Support", "brainflip")
      : xdg
        ? join(xdg, "brainflip")
        : join(homedir(), ".local", "share", "brainflip");
  return join(base, "scores.txt");
}

function topScores(values: readonly number[]): number[] {
  return [...values].sort((a, b) => b - a).slice(0, MAX_TOP_SCORES);
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

async function readScores(): Promise<number[]> {
  try {
    const text = await readFile(scoresFile(), "utf8");
    return text
      .split("\n")
      .map((line) => Number.parseInt(line.trim(), 10))
      .filter((value) => Number.isInteger(value) && value >= 0);
  } catch (error: unknown) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

export const handlers = {
  async loadScores(): Promise<{ scores: number[] }> {
    return { scores: topScores(await readScores()) };
  },

  async saveScore({ score }: { score: number }): Promise<{ scores: number[] }> {
    const next = topScores([...(await readScores()), score]);
    const file = scoresFile();
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, `${next.join("\n")}\n`, "utf8");
    return { scores: next };
  },
};
