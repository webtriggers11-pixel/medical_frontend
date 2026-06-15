import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Railway sits behind a proxy — needed so req.hostname reflects the real domain.
app.set('trust proxy', 1);

// Redirect naked domain → www (301 permanent, preserves path).
app.use((req, res, next) => {
  if (req.hostname === 'lifecarecorp.in') {
    return res.redirect(301, `https://www.lifecarecorp.in${req.originalUrl}`);
  }
  next();
});

// Serve the Vite build output.
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — all routes serve index.html.
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
