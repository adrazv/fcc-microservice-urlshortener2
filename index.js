require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

const urlDatabase = {};
let currentId = 1;

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  console.log('📝 POST /api/shorturl - URL:', originalUrl);

  try {
    const urlObj = new URL(originalUrl);
    
    if (!/^https?:\/\//.test(originalUrl)) {
      console.log('❌ Invalid format');
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        console.log('❌ DNS lookup failed');
        return res.json({ error: 'invalid url' });
      }

      let id;
      const existingId = Object.keys(urlDatabase).find(
        key => urlDatabase[key] === originalUrl
      );
      
      if (existingId) {
        id = parseInt(existingId);
        console.log('📌 Found existing ID:', id);
      } else {
        id = currentId++;
        urlDatabase[id] = originalUrl;
        console.log('✅ New ID:', id, '| Database:', urlDatabase);
      }

      console.log('📤 Response - short_url:', id, 'type:', typeof id);
      return res.json({
        original_url: originalUrl,
        short_url: id
      });
    });
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const rawId = req.params.short_url;
  const id = parseInt(rawId);
  console.log('🔍 GET /api/shorturl/:short_url');
  console.log('   Received:', rawId, '| Parsed:', id, '| Type:', typeof id);
  console.log('   Database keys:', Object.keys(urlDatabase));
  console.log('   Database:', urlDatabase);
  
  const destination = urlDatabase[id];
  console.log('   Found destination:', destination);

  if (destination) {
    console.log('✅ Redirecting to:', destination);
    res.redirect(destination);
  } else {
    console.log('❌ No URL found for ID:', id);
    res.json({ error: "No short URL found" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
