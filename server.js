const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set your Mastodon instance URL
const MASTODON_URL = 'https://bzh.social'; // Change this to your desired instance

// API Route to fetch posts from Mastodon
app.get('/api/posts', async (req, res) => {
  try {
    // Fetch public posts (toots) from the Mastodon public timeline
    const response = await axios.get(`${MASTODON_URL}/api/v1/timelines/public`);

    // Return posts in the response
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching posts from Mastodon:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
