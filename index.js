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

// Chatra webhook endpoint
app.post('/api/chatra', (req, res) => {
    try {
        // Extract the user's message from the chatFragment payload
        const userMessage = req.body.message.body;

        // Query your events database based on the user's message
        const eventSuggestions = queryEvents(userMessage);

        // Send the suggested events back to Chatra
        const responseBody = {
            body: formatEventSuggestions(eventSuggestions)
        };

        // Send the response back to Chatra
        res.json(responseBody);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions for event suggestions
function queryEvents(userMessage) {
    // Perform keyword matching or NLP to identify user intent
    if (userMessage.includes('family friendly')) {
        return eventSystem.findByMultipleCriteria({ isFamily: true });
    } else if (userMessage.includes('rooftop')) {
        return eventSystem.findByMultipleCriteria({ isRooftop: true });
    } else if (userMessage.includes('ball drop')) {
        return eventSystem.findByMultipleCriteria({ hasBallDrop: true });
    } else {
        // Fallback suggestions or generic event list
        return eventSystem.getAllEvents().slice(0, 5);
    }
}

function formatEventSuggestions(events) {
    if (events.length === 0) {
        return "Sorry, no events match your criteria. Please try a different search.";
    }

    let message = "Here are some suggested events based on your request:\n\n";
    events.forEach(event => {
        message += `- ${event.name} (${event.url})\n`;
    });

    return message;
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
