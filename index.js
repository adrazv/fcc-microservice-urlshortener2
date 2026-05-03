require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlDatabase = {};
let currentId = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);
    if (!/^https?:\/\//.test(originalUrl)) {
      return res.json({ error: 'invalid url' });
    }

    const id = currentId++;
    urlDatabase[id] = originalUrl;

    return res.json({
      original_url: originalUrl,
      short_url: id
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const id = req.params.short_url;
  const destination = urlDatabase[id];

  if (destination) {
    res.writeHead(301, { Location: destination });
    return res.end();
  } else {
    return res.json({ error: "invalid url" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});