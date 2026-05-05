const express = require('express');
const dns = require('dns');
const path = require('path');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados em memória
const urlDatabase = {};
let currentId = 1;

// Rota GET para servir o HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rota POST para criar URL curta
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);
    
    // Validar protocolo
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.status(400).json({ error: 'invalid url' });
    }

    // Validar se o domínio existe
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.status(400).json({ error: 'invalid url' });
      }

      let existingId = null;
      
      // Procurar se a URL já existe
      for (let key in urlDatabase) {
        if (urlDatabase[key] === originalUrl) {
          existingId = parseInt(key);
          break;
        }
      }
      
      let id;
      if (existingId) {
        id = existingId;
      } else {
        id = currentId++;
        urlDatabase[String(id)] = originalUrl;
      }

      return res.status(200).json({
        original_url: originalUrl,
        short_url: id
      });
    });
  } catch (err) {
    return res.status(400).json({ error: 'invalid url' });
  }
});

// Rota GET para redirecionar URL curta
app.get('/api/shorturl/:id', (req, res) => {
  const shortId = req.params.id;
  const originalUrl = urlDatabase[shortId];

  if (!originalUrl) {
    return res.status(404).json({ error: 'short url not found' });
  }

  res.redirect(originalUrl);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
