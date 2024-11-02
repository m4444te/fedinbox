import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import basicAuth from 'express-basic-auth';

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Load environment variables
const ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;
const INSTANCE_URL = process.env.MASTODON_INSTANCE_URL;
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

// Basic Authentication middleware
const basicAuthMiddleware = basicAuth({
    users: { [AUTH_USERNAME]: AUTH_PASSWORD },
    challenge: true,
    realm: 'Mastodon API Proxy',
});

// Apply Basic Auth to all routes
app.use(basicAuthMiddleware);

// Serve static files from the "public" folder
app.use(express.static('public'));

// Middleware to log request details
app.use((req, res, next) => {
    console.log('Request received:');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// API to fetch posts from a Mastodon instance
app.get('/api/toots', async (req, res) => {
    try {
        const response = await fetch(`${INSTANCE_URL}/api/v1/timelines/public?limit=100`);
        const posts = await response.json();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts', details: error.message });
    }
});

// Endpoint to post a toot
app.post('/api/share', async (req, res) => {
    console.log('Received share request. Body:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error('Request body is empty');
        return res.status(400).json({ error: 'Request body is empty' });
    }

    const { postContent } = req.body;
    if (!postContent) {
        console.error('Missing postContent in request body');
        return res.status(400).json({ error: 'Missing postContent in request body' });
    }

    console.log('Content to share:', postContent);
    
    try {
        const response = await axios.post(
            `${INSTANCE_URL}/api/v1/statuses`,
            { status: postContent },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Mastodon API response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error sharing toot:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Error sharing toot',
            details: error.response ? error.response.data : error.message
        });
    }
});

// NEW: Endpoint to favorite a toot
app.post('/api/favorite', async (req, res) => {
    console.log('Received favorite request. Body:', req.body);

    if (!req.body || !req.body.id) {
        console.error('Missing toot ID in request body');
        return res.status(400).json({ error: 'Missing toot ID in request body' });
    }

    const { id } = req.body;
    
    try {
        const response = await axios.post(
            `${INSTANCE_URL}/api/v1/statuses/${id}/favourite`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Favorite response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error favoriting toot:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Error favoriting toot',
            details: error.response ? error.response.data : error.message
        });
    }
});

// NEW: Endpoint to unfavorite a toot
app.post('/api/unfavorite', async (req, res) => {
    console.log('Received unfavorite request. Body:', req.body);

    if (!req.body || !req.body.id) {
        console.error('Missing toot ID in request body');
        return res.status(400).json({ error: 'Missing toot ID in request body' });
    }

    const { id } = req.body;
    
    try {
        const response = await axios.post(
            `${INSTANCE_URL}/api/v1/statuses/${id}/unfavourite`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Unfavorite response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error unfavoriting toot:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Error unfavoriting toot',
            details: error.response ? error.response.data : error.message
        });
    }
});

// NEW: Endpoint to get favorited toots
app.get('/api/favorites', async (req, res) => {
    try {
        const response = await axios.get(
            `${INSTANCE_URL}/api/v1/favourites`,
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ 
            error: 'Error fetching favorites', 
            details: error.response ? error.response.data : error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});