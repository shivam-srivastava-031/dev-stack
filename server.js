import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Health check for Railway
app.all('/health', (req, res) => {
  res.status(200).send('OK');
});

// Use PORT from environment variable (Railway/Heroku default) or 5000 as fallback
const PORT = process.env.PORT || 5000;

const distPath = path.join(__dirname, 'dist');

console.log(`[INFO] Server starting...`);
console.log(`[INFO] Port: ${PORT}`);
console.log(`[INFO] Static directory: ${distPath}`);

// Serve static files
app.use(express.static(distPath));

// Handle SPA routing - Catch-all
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`[INFO] Catch-all route hit: ${req.url}`);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('[ERROR] res.sendFile failed:', err);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
        }
      }
    });
  } else {
    console.error(`[ERROR] Build not found at ${indexPath}`);
    res.status(404).send('Build not found. Check deployment logs.');
  }
});

// Bind to PORT to ensure the platform can reach the container
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`[INFO] Current working directory: ${process.cwd()}`);
  console.log(`[INFO] Node version: ${process.version}`);
  console.log(`[INFO] Build index exists: ${fs.existsSync(path.join(distPath, 'index.html'))}`);
});
