const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { EventSystem } = require('./events');

const app = express();
const port = process.env.PORT || 3000;

// Initialize event system
const eventSystem = new EventSystem();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'NYE Events API is running!' });
});

// Query events
app.post('/api/query', (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const result = eventSystem.handleQuery(query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get events by criteria
app.post('/api/events', (req, res) => {
    try {
        const { criteria } = req.body;
        if (!criteria) {
            return res.status(400).json({ error: 'Criteria is required' });
        }

        const events = eventSystem.findByMultipleCriteria(criteria);
        res.json({ events });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
