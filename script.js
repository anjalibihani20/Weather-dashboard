// ---------- 1. Select the HTML elements we need ----------
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const loadingMsg = document.querySelector("#loading");
const errorMsg = document.querySelector("#error");
const weatherCard = document.querySelector("#weather-card");

const iconEl = document.querySelector("#icon");
const cityNameEl = document.querySelector("#city-name");
const temperatureEl = document.querySelector("#temperature");
const conditionEl = document.querySelector("#condition");
const humidityEl = document.querySelector("#humidity");
const windEl = document.querySelector("#wind");
const feelsLikeEl = document.querySelector("#feels-like");
const dateEl = document.querySelector("#date");
const emptyState = document.querySelector("#empty-state");
const errorText = document.querySelector("#error-text");

// Open-Meteo gives the weather as a number (WMO code). This turns it into text + emoji.
const weatherCodes = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Freezing fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Drizzle", icon: "🌦️" },
  55: { text: "Heavy drizzle", icon: "🌦️" },
  56: { text: "Freezing drizzle", icon: "🌧️" },
  57: { text: "Heavy freezing drizzle", icon: "🌧️" },
  61: { text: "Light rain", icon: "🌧️" },
  63: { text: "Rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Freezing rain", icon: "🌧️" },
  67: { text: "Heavy freezing rain", icon: "🌧️" },
  71: { text: "Light snow", icon: "🌨️" },
  73: { text: "Snow", icon: "🌨️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "❄️" },
  80: { text: "Light rain showers", icon: "🌦️" },
  81: { text: "Rain showers", icon: "🌦️" },
  82: { text: "Heavy rain showers", icon: "⛈️" },
  85: { text: "Light snow showers", icon: "🌨️" },
  86: { text: "Heavy snow showers", icon: "🌨️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail", icon: "⛈️" },
  99: { text: "Severe thunderstorm with hail", icon: "⛈️" }
};

// The geocoding API does not find Bengaluru when the user types "Bangalore"
// (it returns a small town in Pakistan instead), so we search for the
// official name. Keys must be lowercase.
const cityAliases = {
  "bangalore": "Bengaluru"
};

// ---------- 2. Fetch weather data from the API ----------
// Open-Meteo needs two steps (and no API key):
//   Step 1: city name -> latitude and longitude (Geocoding API)
//   Step 2: latitude and longitude -> current weather (Forecast API)
async function fetchWeather(city) {
  // Use the official name if we know one, otherwise the text the user typed
  const searchCity = cityAliases[city.trim().toLowerCase()] || city.trim();

  const geoUrl =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
    encodeURIComponent(searchCity);

  showLoading();

  try {
    // Step 1: find the city
    const geoResponse = await fetch(geoUrl);

    // fetch() does NOT throw for HTTP errors, so we check response.ok ourselves
    if (!geoResponse.ok) {
      throw new Error("Something went wrong. Please try again later.");
    }

    // Convert the response body from JSON text into a JavaScript object
    const geoData = await geoResponse.json();

    // If the city does not exist, the API sends no "results" at all
    if (!geoData.results) {
      throw new Error("City not found. Please check the spelling and try again.");
    }
    const place = geoData.results[0];

    // Step 2: get the current weather for that place
    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&timezone=auto";

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Something went wrong. Please try again later.");
    }

    const weatherData = await weatherResponse.json();

    // Show the data on the page
    renderWeather(place, weatherData);
  } catch (error) {
    // fetch() throws a TypeError when there is no internet / server unreachable
    if (error instanceof TypeError) {
      showError("Unable to fetch weather. Please check your internet connection.");
    } else {
      showError(error.message);
    }
  } finally {
    // Runs whether the request succeeded or failed
    hideLoading();
  }
}

// Turns "2026-10-05T14:30" into "Monday 5 October"
function formatDate(timeText) {
  const date = new Date(timeText);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

// ---------- 3. Put the (nested) JSON data into the page ----------
function renderWeather(place, weatherData) {
  // The weather response is nested JSON, for example:
  // {
  //   current: {
  //     time: "2026-10-05T14:30",
  //     temperature_2m: 15.2,
  //     apparent_temperature: 14.1,
  //     relative_humidity_2m: 72,
  //     wind_speed_10m: 14.8,
  //     weather_code: 61
  //   }
  // }
  // The city name comes from the first item of the geocoding "results" array.
  const city = place.name + (place.country ? ", " + place.country : "");
  const temperature = weatherData.current.temperature_2m;
  const humidity = weatherData.current.relative_humidity_2m;
  const windSpeed = weatherData.current.wind_speed_10m;
  const feelsLike = weatherData.current.apparent_temperature;
  const dateText = formatDate(weatherData.current.time);
  const code = weatherData.current.weather_code;
  const condition = weatherCodes[code] || { text: "Unknown", icon: "🌡️" };

  iconEl.textContent = condition.icon;
  cityNameEl.textContent = city;
  temperatureEl.textContent = Math.round(temperature) + "°C";
  conditionEl.textContent = condition.text;
  humidityEl.textContent = humidity + "%";
  windEl.textContent = windSpeed + " km/h";
  feelsLikeEl.textContent = Math.round(feelsLike) + "°C";
  dateEl.textContent = dateText;

  errorMsg.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

// ---------- 4. Small helper functions for the UI ----------
function showLoading() {
  emptyState.classList.add("hidden");
  loadingMsg.classList.remove("hidden");
  errorMsg.classList.add("hidden");
  weatherCard.classList.add("hidden");
  searchBtn.disabled = true;
}

function hideLoading() {
  loadingMsg.classList.add("hidden");
  searchBtn.disabled = false;
}

function showError(message) {
  emptyState.classList.add("hidden");
  errorText.textContent = message;
  errorMsg.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

// ---------- 5. Handle the search ----------
// The "submit" event fires when the Search button is clicked
// AND when Enter is pressed inside the input.
searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const city = cityInput.value.trim();

  // Empty input check
  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  fetchWeather(city);
});
