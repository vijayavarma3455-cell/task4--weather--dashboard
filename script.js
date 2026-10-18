const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

function getWeatherDescription(code) {
    const descriptions = {
        0: ["Clear sky", "☀️"],
        1: ["Mainly clear", "🌤️"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Foggy", "🌫️"],
        51: ["Light drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy drizzle", "🌧️"],
        61: ["Light rain", "🌦️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy rain", "🌧️"],
        71: ["Light snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy snow", "❄️"],
        80: ["Rain showers", "🌦️"],
        81: ["Rain showers", "🌧️"],
        82: ["Heavy rain showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"]
    };

    return descriptions[code] || ["Variable weather", "🌡️"];
}

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        weatherCard.hidden = true;
        return;
    }

    searchBtn.disabled = true;
    message.textContent = "Loading weather...";
    weatherCard.hidden = true;

    try {
        // Step 1: Find the city's latitude and longitude
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to connect to the weather service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another city.");
        }

        const place = geoData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;

        // Step 2: Get current weather using the coordinates
        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast?latitude=" +
            latitude + "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch current weather.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Step 3: Display the weather information
        const weather = getWeatherDescription(current.weather_code);

        document.getElementById("cityName").textContent =
            place.name + (place.country ? ", " + place.country : "");

        document.getElementById("description").textContent = weather[0];

        document.getElementById("weatherIcon").textContent =
            current.is_day ? weather[1] : "🌙";

        document.getElementById("temperature").textContent =
            current.temperature_2m + " °C";

        document.getElementById("feelsLike").textContent =
            current.apparent_temperature + " °C";

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m + "%";

        document.getElementById("windSpeed").textContent =
            current.wind_speed_10m + " km/h";

        weatherCard.hidden = false;
        message.textContent = "";

    } catch (error) {
        message.textContent = error.message ||
            "Something went wrong. Please try again.";
        weatherCard.hidden = true;

    } finally {
        searchBtn.disabled = false;
    }
}
