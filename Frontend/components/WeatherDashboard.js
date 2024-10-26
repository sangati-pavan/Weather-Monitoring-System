// frontend/src/components/WeatherDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function WeatherDashboard() {
    const [weatherData, setWeatherData] = useState([]);
    const [dailySummaries, setDailySummaries] = useState([]);
    const [alertThreshold, setAlertThreshold] = useState(35);

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('http://localhost:5000/api/weather/summaries');
            setDailySummaries(result.data);
        };
        fetchData();
    }, []);

    const updateThreshold = async () => {
        await axios.post('http://localhost:5000/api/weather/set-alert', { threshold: alertThreshold });
        alert('Alert threshold updated to ' + alertThreshold);
    };

    return (
        <div>
            <h2>Weather Dashboard</h2>
            <div>
                <h3>Configure Alert Threshold</h3>
                <input 
                    type="number" 
                    value={alertThreshold} 
                    onChange={(e) => setAlertThreshold(e.target.value)} 
                />
                <button onClick={updateThreshold}>Set Alert Threshold</button>
            </div>
            <div>
                <h3>Daily Weather Summaries</h3>
                {dailySummaries.map((summary, index) => (
                    <div key={index}>
                        <p>City: {summary.city}</p>
                        <p>Date: {summary.date.toLocaleDateString()}</p>
                        <p>Average Temp: {summary.avgTemp}°C</p>
                        <p>Max Temp: {summary.maxTemp}°C</p>
                        <p>Min Temp: {summary.minTemp}°C</p>
                        <p>Dominant Condition: {summary.dominantCondition}</p>
                        <p>Average Humidity: {summary.humidity}%</p>
                        <p>Average Wind Speed: {summary.windSpeed} m/s</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WeatherDashboard;
