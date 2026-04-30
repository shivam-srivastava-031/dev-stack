import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const distPath = path.resolve(__dirname, 'dist');

console.log('Server starting...');
console.log('Checking dist directory at:', distPath);

if (fs.existsSync(distPath)) {
  console.log('✅ Dist directory found.');
  console.log('Contents:', fs.readdirSync(distPath));
} else {
  console.error('❌ Dist directory NOT found! Build might have failed.');
}

// Serve static files
app.use(express.static(distPath));

// Handle SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please check deployment logs.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
