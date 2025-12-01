const API_KEY = "589c2809acb21d474d24f841402940ee";
const BASE = "https://api.openweathermap.org/data/2.5/";

const elements = {
    cityInput: document.getElementById("cityInput"),
    getWeatherBtn: document.getElementById("getWeatherBtn"),
    geoBtn: document.getElementById("geoBtn"),
    currentSection: document.getElementById("current"),
    currentContent: document.getElementById("currentContent"),
    forecastSection: document.getElementById("forecast"),
    forecastContent: document.getElementById("forecastContent"),
}

elements.getWeatherBtn.addEventListener("click", () => {
    const city = elements.cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        alert("Please enter a city name.");
    }
});

async function getWeatherByCity(city) {
    try {
        const URL = `${BASE}weather?q=${city}&appid=${API_KEY}&units=metric`;
        const res = await fetch(URL);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        showCurrent(data);
        getForecastByCoords(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not retrieve weather data. Please try again later.");
    }
}

elements.geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        (err) => alert("Could not get location: " + err.message)
    );
});

async function getWeatherByCoords(lat, lon) {
    try {
        const URL = `${BASE}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const res = await fetch(URL);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        showCurrent(data);
        getForecastByCoords(lat, lon);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not retrieve weather data. Please try again later.");
    }
}

showCurrent()
function showCurrent(data) {
  elements.currentSection.classList.remove("hidden");
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const html = `
    <div>
      <strong>${data.name}, ${data.sys.country}</strong>
      <div class="small">As of: ${new Date(data.dt*1000).toLocaleString()}</div>
    </div>
    <div style="margin-top:.5rem;">
      <img src="${icon}" alt="${data.weather[0].description}" />
      <span style="font-size:1.6rem">${Math.round(data.main.temp)}°C</span>
      <div class="small">Feels like ${Math.round(data.main.feels_like)}°C — ${data.weather[0].description}</div>
      <div class="small">Humidity: ${data.main.humidity}% • Wind: ${data.wind.speed} m/s</div>
    </div>
  `;
  elements.currentContent.innerHTML = html;
}

async function getForecastByCoords(lat, lon) {
  try {
    const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    showForecast(data);
  } catch (err) {
    console.error("Forecast error:", err);
  }
}

function showForecast(data) {
  elements.forecastSection.classList.remove("hidden");
  // show next 6 entries (3-hr intervals)
  const nextSix = data.list.slice(0, 6);
  elements.forecastContent.innerHTML = nextSix.map(item => {
    const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
    return `
      <div class="forecastItem">
        <div style="width:140px">
          <div class="small">${new Date(item.dt*1000).toLocaleString()}</div>
        </div>
        <div><img src="${icon}" alt="${item.weather[0].description}"/></div>
        <div>
          <div><strong>${Math.round(item.main.temp)}°C</strong> — ${item.weather[0].main}</div>
          <div class="small">Pop: ${(item.pop*100).toFixed(0)}% • ${item.weather[0].description}</div>
        </div>
      </div>
    `;
  }).join("");
}