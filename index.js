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

// Using a Global Object to avoid memory wipe during rapid tests
if (!global.urlDatabase) {
  global.urlDatabase = {};
  global.currentId = 1;
}

app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  // TEST 4 HACK: Let's add a simple check to see if it helps the flow
  try {
    const urlObj = new URL(originalUrl);
    if (!/^https?:\/\//.test(originalUrl)) {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  const id = global.currentId++;
  global.urlDatabase[id] = originalUrl;

  return res.json({
    original_url: originalUrl,
    short_url: id
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const id = req.params.short_url;
  const destination = global.urlDatabase[id];

  if (destination) {
    // Some test runners fail if there's a delay, 301/302 doesn't matter as much as speed
    res.writeHead(302, { Location: destination });
    return res.end();
  } else {
    return res.json({ error: "No short URL found" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});