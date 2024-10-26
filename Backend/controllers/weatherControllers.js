// backend/controllers/weatherController.js
const axios = require('axios');
const { Weather, DailySummary } = require('../models/Weather');
const nodemailer = require('nodemailer');

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

function kelvinToCelsius(tempK) {
    return tempK - 273.15;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendAlertEmail = async (city, condition, temperature) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_RECIPIENT_EMAIL,
        subject: `Weather Alert: ${city}`,
        text: `Alert! The temperature in ${city} has reached ${temperature}°C with ${condition}.`
    });
};

const fetchWeatherData = async () => {
    for (const city of cities) {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}`);
            const { main, weather, wind, dt } = response.data;
            const tempCelsius = kelvinToCelsius(main.temp);
            const humidity = main.humidity;
            const windSpeed = wind.speed;

            // Save weather data to the database
            const weatherData = await Weather.create({
                city,
                main: weather[0].main,
                temp: tempCelsius,
                feels_like: kelvinToCelsius(main.feels_like),
                humidity,
                wind_speed: windSpeed,
                dt
            });

            // Calculate daily summary
            await calculateDailySummary(city);

            // Check if alert condition is met
            if (tempCelsius > parseFloat(process.env.ALERT_THRESHOLD)) {
                sendAlertEmail(city, weather[0].main, tempCelsius);
            }

        } catch (error) {
            console.error(`Error fetching data for ${city}:`, error);
        }
    }
};

const calculateDailySummary = async (city) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - process.env.HISTORICAL_DAYS);

    const weatherData = await Weather.find({
        city,
        date: { $gte: sevenDaysAgo }
    });

    if (weatherData.length === 0) return;

    const avgTemp = weatherData.reduce((acc, curr) => acc + curr.temp, 0) / weatherData.length;
    const maxTemp = Math.max(...weatherData.map(w => w.temp));
    const minTemp = Math.min(...weatherData.map(w => w.temp));
    const dominantCondition = weatherData.sort((a, b) => weatherData.filter(v => v.main === a.main).length - weatherData.filter(v => v.main === b.main).length).pop().main;
    const avgHumidity = weatherData.reduce((acc, curr) => acc + curr.humidity, 0) / weatherData.length;
    const avgWindSpeed = weatherData.reduce((acc, curr) => acc + curr.wind_speed, 0) / weatherData.length;

    await DailySummary.create({
        city,
        date: new Date(),
        avgTemp,
        maxTemp,
        minTemp,
        dominantCondition,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed
    });
};

// Cron job to fetch data every 5 minutes
require('node-cron').schedule('*/5 * * * *', fetchWeatherData);

module.exports = { fetchWeatherData };
