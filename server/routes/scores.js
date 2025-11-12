import { Router } from 'express';
import { loadScores, saveScore } from '../services/scoresService.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const scores = loadScores();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load scores' });
  }
});

router.post('/', (req, res) => {
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
    res.json({ success: true, top_scores: topScores });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

export default router;
