import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Use the absolute path to the dist directory
const distPath = path.join(__dirname, 'dist');

console.log(`[INFO] Server starting on port ${PORT}`);
console.log(`[INFO] Looking for static files in: ${distPath}`);

// Log existence of critical files
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`[INFO] Found ${files.length} files in dist/`);
} else {
  console.error(`[ERROR] Dist directory NOT found at ${distPath}`);
}

// 1. Serve static files with high priority
app.use(express.static(distPath));

// 2. Fallback for SPA routing (must come AFTER static files)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[ERROR] index.html not found at ${indexPath}`);
    res.status(404).send('Application build not found. Please ensure "npm run build" succeeded.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 App is live at http://0.0.0.0:${PORT}`);
});
