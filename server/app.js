import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import scoresRouter from './routes/scores.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 8000;

const app = express();
app.disable('x-powered-by');

app.use(express.json());

// Simple request logger for parity with the Flask dev output
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/scores', scoresRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Serve the game UI and assets
app.use(express.static(PUBLIC_DIR));

// Return JSON for missing API routes, simple text elsewhere
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.status(404).type('text/plain').send('Not found');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Brainflip server running on http://localhost:${PORT}`);
});
