app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);
    
    // test 
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.status(400).json({ error: 'invalid url' });
    }

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.status(400).json({ error: 'invalid url' });
      }

      let existingId = null;
      
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
