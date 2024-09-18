import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Load environment variables
const ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;
const INSTANCE_URL = process.env.MASTODON_INSTANCE_URL;

// Serve static files from the "public" folder
app.use(express.static('public'));

// API to fetch posts from a Mastodon instance
app.get('/api/toots', async (req, res) => {
    try {
        const response = await fetch(`${INSTANCE_URL}/api/v1/timelines/public?limit=100`);
        const posts = await response.json();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Endpoint to post a toot
app.post('/api/share/', async (req, res) => {
    
    const { status } = req.body;

  try {
    const response = await axios.post(
      `${INSTANCE_URL}/api/v1/statuses`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error sharing toot' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
