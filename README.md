# Weather Dashboard

A simple weather dashboard that fetches live weather data from the Open-Meteo API and shows it for any city you search. Built for my Week 4 internship assignment on Asynchronous JavaScript and REST APIs.

## Technologies Used

- HTML
- CSS
- Vanilla JavaScript (Fetch API, async/await)
- Open-Meteo Geocoding API and Forecast API (free, no API key needed)

## Features

- Search weather by city name (click Search or press Enter)
- Shows city, country, date, temperature, weather condition, feels-like temperature, humidity and wind speed
- Handles the common name "Bangalore" by searching for "Bengaluru" (the official name the geocoding API knows)
- Starting message, loading indicator and error messages shown as clear UI boxes
- Responsive layout for desktop, tablet and mobile
- "Fetching weather..." message with a small spinner while data is being fetched
- Friendly error messages (empty input, city not found, no internet, other errors)
- Accessible: labelled input, keyboard focus outline, screen-reader announcements for loading, errors and results

Weather data is provided by [Open-Meteo.com](https://open-meteo.com/).

## How to Run (VS Code Live Server)

No API key or setup file is needed.

1. Open the `weather-dashboard` folder in VS Code.
2. Install the **Live Server** extension if you don't have it.
3. Right-click `index.html` and choose **Open with Live Server**.

## How Fetch API and async/await Are Used

`fetchWeather(city)` is an `async` function that makes two requests:

1. `await fetch(...)` to the Geocoding API to turn the city name into latitude and longitude. The API does not find Bengaluru when you type "Bangalore" (it returns a small town in Pakistan), so a small `cityAliases` object in `script.js` changes "bangalore" to "Bengaluru" before searching.
2. `await fetch(...)` to the Forecast API to get the current weather for those coordinates.

`await` waits for each reply without freezing the page. After each request, `await response.json()` converts the reply into a JavaScript object. The result is passed to `renderWeather(place, weatherData)`.

## Error Handling

- The whole process is inside `try/catch/finally`.
- `response.ok` is checked after every request, and a failed status shows a general error.
- If the city does not exist, the Geocoding API returns no `results`, and the app shows "City not found. Please check the spelling and try again."
- If the internet is off, `fetch` throws a `TypeError`, and the catch block shows "Unable to fetch weather. Please check your internet connection."
- Empty input is checked before any request is sent.
- `finally` always hides the loading message and re-enables the button.

## Nested JSON Parsing

`renderWeather` reads values from objects inside objects, and from an array:

| Value | Path in JSON |
|---|---|
| City and country | `place.name` and `place.country` (from `geoData.results[0]`) |
| Date | `weatherData.current.time` |
| Temperature | `weatherData.current.temperature_2m` |
| Feels like | `weatherData.current.apparent_temperature` |
| Humidity | `weatherData.current.relative_humidity_2m` |
| Wind speed | `weatherData.current.wind_speed_10m` |
| Condition | `weatherData.current.weather_code` (converted to text using the `weatherCodes` object) |

## Project Structure

```
weather-dashboard/
├── index.html   # Page structure
├── style.css    # Styling
├── script.js    # Fetch, error handling, rendering
└── README.md
```
