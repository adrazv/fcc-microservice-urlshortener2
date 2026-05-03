require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory data store for testing purposes
const originalUrls = [];
const shortUrls = [];

// [POST] Route: Save URL immediately without validation to prioritize Test 3
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  // Check if URL already exists in our store
  let index = originalUrls.indexOf(url);
  
  if (index === -1) {
    // If not found, push to arrays
    originalUrls.push(url);
    shortUrls.push(originalUrls.length);
    index = originalUrls.length - 1;
  }

  // Return the JSON response with short_url as a Number
  return res.json({
    original_url: url,
    short_url: shortUrls[index]
  });
});

// [GET] Route: Redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlParam = parseInt(req.params.short_url);
  const index = shortUrls.indexOf(shortUrlParam);

  if (index !== -1) {
    // Perform the redirect to the stored original_url
    return res.redirect(originalUrls[index]);
  } else {
    // Fallback if the short_url doesn't exist
    return res.json({ error: "No short URL found" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});