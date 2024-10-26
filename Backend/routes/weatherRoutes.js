// backend/routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const { fetchWeatherData } = require('../controllers/weatherController');

// Endpoint to fetch weather data manually (for testing)
router.get('/fetch', async (req, res) => {
    await fetchWeatherData();
    res.send('Weather data fetched successfully');
});

// Endpoint to get daily summaries
router.get('/summaries', async (req, res) => {
    const summaries = await DailySummary.find().sort({ date: -1 }).limit(7);
    res.json(summaries);
});

// Endpoint to set user alert thresholds (dynamic)
router.post('/set-alert', async (req, res) => {
    const { threshold } = req.body;
    process.env.ALERT_THRESHOLD = threshold;
    res.json({ message: 'Alert threshold updated', threshold });
});

module.exports = router;
