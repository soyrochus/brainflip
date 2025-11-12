import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const SCORES_FILE = path.join(STORAGE_DIR, 'scores.txt');
const MAX_TOP_SCORES = 5;

function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, '');
  }
}

export function loadScores() {
  ensureStorage();
  try {
    const data = fs.readFileSync(SCORES_FILE, 'utf8');
    const scores = data
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isInteger(n));
    return scores.sort((a, b) => b - a).slice(0, MAX_TOP_SCORES);
  } catch {
    return [];
  }
}

export function saveScore(n) {
  ensureStorage();
  const scores = loadScores();
  scores.push(n);
  const top = scores.sort((a, b) => b - a).slice(0, MAX_TOP_SCORES);
  const text = top.map((s) => String(s)).join('\n') + '\n';
  fs.writeFileSync(SCORES_FILE, text, 'utf8');
  return top;
}

export default { loadScores, saveScore };
