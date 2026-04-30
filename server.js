import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
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
