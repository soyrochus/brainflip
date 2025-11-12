# Brainflip To-Be Architecture: Migration to Node.js (Express)

## 1. Purpose & Goals

The goal of this migration is to move the server-side portion of Brainflip from a Python/Flask implementation to a Node.js/Express stack while preserving all current front-end behavior and user experience. The memory game UI, logic, and assets remain unchanged (HTML + Tailwind via CDN + vanilla JavaScript). The migration focuses on feature parity, maintainability, and easier integration with typical JavaScript tooling.

### Key Objectives

- Preserve all existing functionality (game play, scoring, sneak peek helper, debug mode)
- Maintain current REST API contract for scores (`GET /api/scores`, `POST /api/scores`)
- Serve existing static assets (images, favicon) and the single HTML template
- Introduce a clean server layering for future extensibility (e.g., adding auth, persistent DB)
- Use npm for dependency management (no Python runtime required)
- Keep deployment simple (single Node.js process)

### Non-Goals (Initial Phase)

- Changing front-end code to a SPA framework
- Introducing TypeScript (can be a later enhancement)
- Replacing file-based score storage with a database (phase 2)
- Changing scoring logic or UI design

## 2. Current State (As-Is Summary)

- Backend: Flask app in `main.py` exposing:
  - `GET /` → renders `templates/index.html`
  - `GET /api/scores` → returns JSON array of top 5 scores
  - `POST /api/scores` → accepts JSON `{ score: number }`, validates, appends, returns updated top scores
- Persistence: Plain text file `scores.txt` (one score per line, descending order maintained to top 5)
- Front-end: Single HTML file with embedded JavaScript controlling card flipping, scoring logic, helper features
- Assets: Served via `/static/images` (card faces, back image, favicon)

## 3. Target State Overview

- Backend replaced by Node.js with Express.
- Directory structure (proposed):

```text
brainflip/
├─ package.json
├─ server/
│  ├─ app.js             # Express app initialization
│  ├─ routes/
│  │  └─ scores.js       # Score API routes
│  ├─ services/
│  │  └─ scoresService.js# Score load/save logic
│  ├─ middleware/
│  │  └─ errorHandler.js # Centralized error formatting
│  └─ storage/
│     └─ scores.txt      # Persisted score file (same format)
├─ public/               # Static assets (images, favicon, index.html)
│  ├─ images/...         # Moved from static/images
│  └─ index.html         # Original template moved here
└─ to-be-architecture.md # This doc
```

### Rationale

- `public/` allows Express static middleware to serve assets and HTML.
- `routes/` vs `services/` separation keeps business logic independent of routing code.
- `storage/` isolating file persistence aids future DB migration.

## 4. Express Server Responsibilities

1. Serve static assets (images, HTML) via `express.static('public')`.
2. Provide JSON endpoints under `/api` for score operations.
3. Basic request logging and JSON parsing.
4. Graceful error handling with consistent JSON format.

## 5. API Contract (Parity)

| Endpoint | Method | Request Body | Response (Success) | Notes |
|----------|--------|--------------|--------------------|-------|
| `/` | GET | — | Serves `index.html` | Same URL as Flask |
| `/api/scores` | GET | — | `[number, ...]` (max 5) | Descending order |
| `/api/scores` | POST | `{ "score": number }` | `{ success: true, top_scores: [ ... ] }` | Validates non-negative integer |

### Error Responses

- `400` → `{ error: "Score is required" }` when missing
- `400` → `{ error: "Score must be non-negative" }` when < 0
- `400` → `{ error: "Invalid score format" }` when not an integer

## 6. Detailed Module Design

### 6.1 `scoresService.js`

Responsibilities:

- Load scores from `storage/scores.txt`
- Sanitize/validate format
- Append new score, sort descending, trim to top 5
- Persist changes atomically

Pseudo-code:

```javascript
import fs from 'node:fs';
const SCORE_FILE = new URL('../storage/scores.txt', import.meta.url);

export function loadScores() {
  if (!fs.existsSync(SCORE_FILE)) return [];
  try {
    const raw = fs.readFileSync(SCORE_FILE, 'utf8');
    return raw.split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => Number.isInteger(n))
      .sort((a, b) => b - a);
  } catch { return []; }
}

export function saveScore(newScore) {
  const scores = loadScores();
  scores.push(newScore);
  const top = scores.sort((a, b) => b - a).slice(0, 5);
  fs.writeFileSync(SCORE_FILE, top.join('\n') + '\n');
  return top;
}
```

### 6.2 `scores.js` (Router)

```javascript
import { Router } from 'express';
import { loadScores, saveScore } from '../services/scoresService.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(loadScores());
});

router.post('/', (req, res) => {
  const { score } = req.body || {};
  if (score === undefined) return res.status(400).json({ error: 'Score is required' });
  const n = Number(score);
  if (!Number.isInteger(n)) return res.status(400).json({ error: 'Invalid score format' });
  if (n < 0) return res.status(400).json({ error: 'Score must be non-negative' });
  const top = saveScore(n);
  res.json({ success: true, top_scores: top });
});

export default router;
```

### 6.3 `app.js`

```javascript
import express from 'express';
import path from 'node:path';
import scoresRouter from './routes/scores.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use('/api/scores', scoresRouter);

// Basic error fallback
app.use((err, _req, res, _next) => {
  console.error(err); // logging only
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Brainflip server running on http://localhost:${PORT}`);
});
```

## 7. Dependency Management (npm)

### `package.json` (initial)

```json
{
  "name": "brainflip",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server/app.js",
    "dev": "nodemon server/app.js"
  },
  "dependencies": {
    "express": "^4.21.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### Installation

```bash
npm install
npm run start
```

## 8. Migration Steps

1. Create Node.js project (add `package.json`).
2. Move `templates/index.html` → `public/index.html` unchanged.
3. Move `static/images/*` → `public/images/*`.
4. Implement server modules (`app.js`, `routes/scores.js`, `services/scoresService.js`).
5. Copy or move existing `scores.txt` into `server/storage/scores.txt` (or keep root and adjust path).
6. Test endpoints with curl / Postman for parity.
7. Update documentation (`README.md`) with Node start instructions (parallel run until cutover).
8. Remove Flask-specific files only after full parity confirmed.
9. Optional: Add simple health endpoint `GET /health` returning `{ status: 'ok' }`.

## 9. Parity & Validation Checklist

- [ ] Front page loads with Tailwind and images
- [ ] Card flipping, scoring, penalties, bonuses work
- [ ] Sneak peek button logic identical (ENABLE_HELPERS flag unaffected)
- [ ] Debug mode via `?debug=true` works
- [ ] Score POST persists values and trims top 5
- [ ] GET scores returns sorted list
- [ ] Invalid score payloads return correct errors
- [ ] Performance acceptable (<50ms typical local response)
- [ ] No 404s for images or favicon

## 10. Testing Approach

- Unit test `scoresService.js` (optional initial phase) using Node’s built-in test runner or Jest later.
- Integration tests using `supertest` against Express server for the two endpoints.
- Manual browser test for UI parity.

## 11. Security & Hardening (Future)

- Input rate limiting (scores endpoint)
- Validate content-type headers
- Add CORS policy if external front-end hosting emerges
- Replace file persistence with SQLite/PostgreSQL

## 12. Performance Considerations

Current traffic assumptions are low. File I/O on each score write is acceptable for MVP. Future optimization: keep in-memory cache and persist on interval / shutdown.

## 13. Risks & Mitigations

| Risk | Description | Mitigation |
|------|-------------|------------|
| Silent divergence | Front-end logic assumes Flask path specifics | Keep identical paths & test early |
| File permission issues | Node may run under different user | Validate write access on startup |
| Encoding issues | Windows vs Unix line endings | Normalize write (`\n`) and parse robustly |
| Future DB migration complexity | Hardcoded file path scattering | Centralize in `scoresService.js` |

## 14. Rollback Plan

If issues arise during migration:

- Keep Flask server running on alternate port (e.g., 8001) for quick fallback
- Maintain `scores.txt` synchronization (copy after Node test runs)
- Use DNS / reverse proxy switch only after smoke tests pass

## 15. Future Enhancements (Post-Migration)

- Convert to TypeScript for type safety
- Add WebSocket for real-time leaderboard updates
- Introduce environment-based configuration (`dotenv`)
- Add CI workflow (GitHub Actions) for lint/test
- Containerize with lightweight Node base image

## 16. Acceptance Criteria

- All user-visible game functionality unchanged
- API endpoints return identical JSON shapes
- Startup instructions documented in README
- No new runtime errors in browser console
- Scores persist identically across restart

## 17. Quick Start (After Migration)

```bash
npm install
npm run start
# Open http://localhost:8000/
```

## 18. Open Questions

```text
*[Info missing: expected production hosting environment]*
*[Info missing: concurrency requirements]*
```

---
Prepared: 2025-11-12
