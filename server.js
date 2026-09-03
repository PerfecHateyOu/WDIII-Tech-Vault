import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static assets from the current directory
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Route for root entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route aliases
app.get(['/Document V5.2.3.htm', '/Document%20V5.2.3.htm'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/fodder-archive', '/fodder-archive.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'fodder-archive.html'));
});

app.get(['/Fodder Archive V2.htm', '/Fodder%20Archive%20V2.htm'], (req, res) => {
  res.sendFile(path.join(__dirname, 'Fodder Archive V2.htm'));
});

app.listen(PORT, HOST, () => {
  console.log(`Consumer Tech Documentation server listening at http://${HOST}:${PORT}`);
});
