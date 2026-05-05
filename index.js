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

  try {
    const urlObj = new URL(originalUrl);

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

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
      }

      return res.json({
        original_url: originalUrl,
        short_url: id
      });
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const id = parseInt(req.params.short_url);
  const destination = urlDatabase[id];

  if (!destination) {
    return res.json({ error: "No short URL found" });
  }

  return res.status(301).redirect(destination);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
