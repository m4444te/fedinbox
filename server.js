import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 8080;

// Serve static files from the "public" folder
app.use(express.static('public'));

// API to fetch posts from a Mastodon instance
app.get('/api/posts', async (req, res) => {
  try {
    const response = await fetch('https://bzh.social/api/v1/timelines/public?limit=10');
    const posts = await response.json();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
