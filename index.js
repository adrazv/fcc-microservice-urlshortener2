require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const originalUrls = [];
const shortUrls = [];

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  try {
    const urlObj = new URL(url);
    
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        let index = originalUrls.indexOf(url);

        if (index === -1) {
          originalUrls.push(url);
          shortUrls.push(originalUrls.length);
          index = originalUrls.length - 1;
        }

        return res.json({
          original_url: url,
          short_url: shortUrls[index]
        });
      }
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlParam = parseInt(req.params.short_url);
  const index = shortUrls.indexOf(shortUrlParam);

  if (index === -1) {
    return res.json({ error: 'No short URL found for the given input' });
  } else {
    return res.redirect(originalUrls[index]);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});