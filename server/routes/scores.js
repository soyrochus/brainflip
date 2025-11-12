import { Router } from 'express';
import { loadScores, saveScore } from '../services/scoresService.js';

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const scores = loadScores();
    res.json(scores);
  } catch (error) {
    const wrapped = new Error('Failed to load scores');
    wrapped.cause = error;
    wrapped.status = 500;
    next(wrapped);
  }
});

router.post('/', (req, res, next) => {
  const { score } = req.body || {};
  if (score === undefined) {
    return res.status(400).json({ error: 'Score is required' });
  }
  const n = Number(score);
  if (!Number.isInteger(n)) {
    return res.status(400).json({ error: 'Invalid score format' });
  }
  if (n < 0) {
    return res.status(400).json({ error: 'Score must be non-negative' });
  }
  try {
    const topScores = saveScore(n);
    return res.json({ success: true, top_scores: topScores });
  } catch (error) {
    const wrapped = new Error('Failed to save score');
    wrapped.cause = error;
    wrapped.status = 500;
    return next(wrapped);
  }
});

export default router;
