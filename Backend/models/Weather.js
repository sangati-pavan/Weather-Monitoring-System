// backend/models/Weather.js
const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
    city: String,
    main: String,
    temp: Number,
    feels_like: Number,
    humidity: Number,
    wind_speed: Number,
    dt: Number,
    date: { type: Date, default: Date.now }
});

const DailySummarySchema = new mongoose.Schema({
    city: String,
    date: Date,
    avgTemp: Number,
    maxTemp: Number,
    minTemp: Number,
    dominantCondition: String,
    humidity: Number,
    windSpeed: Number
});

module.exports = {
    Weather: mongoose.model('Weather', WeatherSchema),
    DailySummary: mongoose.model('DailySummary', DailySummarySchema)
};
