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
  
  console.log('=== POST /api/shorturl ===');
  console.log('URL recebida:', originalUrl);
  console.log('Body completo:', req.body);

  try {
    const urlObj = new URL(originalUrl);
    console.log('URL válida, hostname:', urlObj.hostname);

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        console.log('❌ DNS error:', err.message);
        return res.status(400).json({ error: 'invalid url' });
      }

      console.log('✓ DNS OK');
      let existingId = null;
      
      for (let key in urlDatabase) {
        if (urlDatabase[key] === originalUrl) {
          existingId = parseInt(key);
          break;
        }
      }
      
      const id = existingId || currentId++;
      if (!existingId) {
        urlDatabase[id] = originalUrl;
        console.log('Nova URL criada - ID:', id);
      } else {
        console.log('URL já existe - ID:', id);
      }

      return res.status(200).json({
        original_url: originalUrl,
        short_url: id
      });
    });
  } catch (err) {
    console.log('❌ Erro ao parsear URL:', err.message);
    return res.status(400).json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const id = parseInt(req.params.short_url);
  console.log('=== GET /api/shorturl/:short_url ===');
  console.log('ID solicitado:', id);
  
  const destination = urlDatabase[id];

  if (!destination) {
    console.log('❌ ID não encontrado');
    return res.status(404).json({ error: "No short URL found" });
  }

  console.log('✓ Redirecionando para:', destination);
  res.redirect(destination);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
