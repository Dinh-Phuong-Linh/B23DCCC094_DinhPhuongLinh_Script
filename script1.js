
document.addEventListener("DOMContentLoaded", function () {
    getWeather();
    setInterval(getWeather, 900000); 
});

document.getElementById('city').addEventListener('input', debounce(function () {
    getWeather();
}, 300)); 

async function getWeather() {
    try {
        const city = document.getElementById('city').value;
        if (!city) return;

        console.log('City name:', city);

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: 'bef054a2a98345f92bdc6364bb2c4f1c',
                units: 'metric'
            },
        });

        const forecastData = response.data.list;
        const dailyForecast = processForecastData(forecastData);

        updateCurrentWeather(response.data.city.name, dailyForecast);
        updateDailyForecast(dailyForecast);

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

function processForecastData(forecastData) {
    const dailyForecast = {};
    forecastData.forEach((data) => {
        const day = new Date(data.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                minTemp: data.main.temp_min,
                maxTemp: data.main.temp_max,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: data.weather[0].icon,
            };
        } else {
            dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, data.main.temp_min);
            dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, data.main.temp_max);
        }
    });
    return dailyForecast;
}

function updateCurrentWeather(city, dailyForecast) {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const currentWeather = dailyForecast[currentDay];

    if (currentWeather) {
        document.querySelector('.location').textContent = city;
        document.querySelector('.weather-temp').textContent = Math.round(currentWeather.maxTemp) + 'ºC';
        document.querySelector('.weather-desc').textContent = capitalizeWords(currentWeather.description);
        document.querySelector('.humidity .value').textContent = currentWeather.humidity + ' %';
        document.querySelector('.wind .value').textContent = currentWeather.windSpeed + ' m/s';
        document.querySelector('.weather-icon').innerHTML = getWeatherIcon(currentWeather.icon);

        const date = new Date().toUTCString();
        const extractedDateTime = date.slice(5, 16);
        document.querySelector('.date-day').textContent = extractedDateTime;
        document.querySelector('.date-dayname').textContent = currentDay;
    }
}

function updateDailyForecast(dailyForecast) {
    const dayElements = document.querySelectorAll('.day-name');
    const tempElements = document.querySelectorAll('.day-temp');
    const iconElements = document.querySelectorAll('.day-icon');

    dayElements.forEach((dayElement, index) => {
        const day = Object.keys(dailyForecast)[index];
        const data = dailyForecast[day];
        if (data) {
            dayElement.textContent = day;
            tempElements[index].textContent = `${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º`;
            iconElements[index].innerHTML = getWeatherIcon(data.icon);
        }
    });
}

function getWeatherIcon(iconCode) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    const iconSize = '@2x.png';
    return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

function capitalizeWords(description) {
    return description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}