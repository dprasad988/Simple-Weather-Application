document.addEventListener('DOMContentLoaded', function() {
    const cities = ['Colombo', 'Kahawatta', 'Ratnapura'];
    let unit = 'metric';

    updateWeatherForTopCities(unit);

    document.getElementById('unitToggle').addEventListener('click', function() {
        unit = unit === 'metric' ? 'imperial' : 'metric';
        this.textContent = unit === 'metric' ? 'Switch to Imperial' : 'Switch to Metric';
        updateWeatherForTopCities(unit);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoordinates(latitude, longitude, unit);
            }, error => console.error('Geolocation error:', error));
        }
    });

    document.getElementById('getWeather').addEventListener('click', function() {
        const city = document.getElementById('city').value;
        if (city) {
            displayWeatherForCity(city, unit, true);
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude, unit);
        }, error => console.error('Geolocation error:', error));
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
});

function updateWeatherForTopCities(unit) {
    const cities = ['Colombo', 'Kahawatta', 'Ratnapura'];
    const container = document.querySelector('#topCitiesWeather');
    container.innerHTML = '';

    cities.forEach(city => {
        displayWeatherForCity(city, unit);
    });
}

function displayWeatherForCity(city, unit, detailed = false) {
    const apiKey = '5f3fe64e27274785b4082120241109'; 
    const unitLabel = unit === 'metric' ? '°C' : '°F';
    const speedUnit = unit === 'metric' ? ' km/h' : ' mph';
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const weatherHtml = `
                <div class="col-md-4 city-weather border">
                    <h5>${data.location.name}</h5>
                    <img src="${data.current.condition.icon}" alt="Weather Icon">
                    <p><strong>Temperature:</strong> ${unit === 'metric' ? data.current.temp_c : data.current.temp_f}${unitLabel}</p>
                    <p><strong>Condition:</strong> ${data.current.condition.text}</p>
                    <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
                    <p><strong>Wind Speed:</strong> ${unit === 'metric' ? data.current.wind_kph : data.current.wind_mph}${speedUnit}</p>
                </div>
            `;
            if (detailed) {
                const forecastApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no`;
                fetch(forecastApiUrl)
                    .then(response => response.json())
                    .then(forecastData => {
                        const forecastHtml = forecastData.forecast.forecastday.map(day => `
                            <div class="col-md-2 forecast-day border">
                                <h6>${new Date(day.date).toDateString()}</h6>
                                <img src="${day.day.condition.icon}" alt="Weather Icon">
                                <p><strong>Temp:</strong> ${unit === 'metric' ? day.day.avgtemp_c : day.day.avgtemp_f}${unitLabel}</p>
                                <p><strong>Condition:</strong> ${day.day.condition.text}</p>
                            </div>
                        `).join('');
                        document.getElementById('cityWeatherDetails').innerHTML = `
                            <div class="col-md-12 city-weather">
                                <h4>${data.location.name} (Detailed View)</h4>
                                ${weatherHtml}
                                <div class="row">
                                    ${forecastHtml}
                                </div>
                            </div>
                        `;
                    })
                    .catch(error => {
                        console.error('Error fetching forecast data:', error);
                        document.getElementById('cityWeatherDetails').innerHTML = `<div class="col-md-12 city-weather"><p>Forecast data not available for ${city}.</p></div>`;
                    });
            } else {
                const container = document.querySelector('#topCitiesWeather');
                container.innerHTML += weatherHtml;
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            if (detailed) {
                document.getElementById('cityWeatherDetails').innerHTML = `<div class="col-md-12 city-weather"><p>Weather data not available for ${city}.</p></div>`;
            } else {
                document.querySelector('#topCitiesWeather').innerHTML += `<div class="col-md-4 city-weather border"><p>Weather data not available for ${city}.</p></div>`;
            }
        });
}

function fetchWeatherByCoordinates(latitude, longitude, unit) {
    const apiKey = '5f3fe64e27274785b4082120241109';
    const unitLabel = unit === 'metric' ? '°C' : '°F';
    const speedUnit = unit === 'metric' ? ' km/h' : ' mph';
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const weatherHtml = `
                <div class="col-md-4 city-weather border">
                    <h5>${data.location.name}</h5>
                    <img src="${data.current.condition.icon}" alt="Weather Icon">
                    <p><strong>Temperature:</strong> ${unit === 'metric' ? data.current.temp_c : data.current.temp_f}${unitLabel}</p>
                    <p><strong>Condition:</strong> ${data.current.condition.text}</p>
                    <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
                    <p><strong>Wind Speed:</strong> ${unit === 'metric' ? data.current.wind_kph : data.current.wind_mph}${speedUnit}</p>
                </div>
            `;
            const container = document.querySelector('#cityWeatherDetails');
            container.innerHTML = weatherHtml + container.innerHTML;
        })
        .catch(error => {
            console.error('Error fetching weather data by coordinates:', error);
            const container = document.querySelector('#cityWeatherDetails');
            container.innerHTML = `<div class="col-md-4 city-weather border"><p>Weather data not available for current location.</p></div>` + container.innerHTML;
        });
}
