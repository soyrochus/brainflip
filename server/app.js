import express from 'express';
import scoresRouter from './routes/scores.js';

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/scores', scoresRouter);

// Placeholder root to avoid conflicting with Flask; will serve static later
app.get('/', (req, res) => {
  res.type('text/plain').send('Brainflip Node/Express scaffold is running.');
});

app.listen(PORT, () => {
  console.log(`Brainflip Node server listening on http://localhost:${PORT}`);
});
