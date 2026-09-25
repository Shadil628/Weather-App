// REPLACE THIS with your OpenWeatherMap API key (FREE signup)

const API_KEY = 'bd8b6ba0d8356d1652e40ee8df7469ad';

// 1. IMPLEMENT getWeather(city) - Fetch API + async/await

async function getWeather(city) {

    try {

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        return {
            city: data.name,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed
        };

    } catch (error) {

        throw error;

    }
}

async function getForecast(city) {

    try {

        const url =
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Forecast not found");
        }

        const data = await response.json();

        return data;

    } catch (error) {

        throw error;

    }
}


function displayForecast(data) {

    const forecastContainer =
        document.getElementById("forecastContainer");

    const forecastList =
        document.getElementById("forecastList");

    forecastList.innerHTML = "";

    const dailyForecast = [];

    data.list.forEach(function (item) {

        const date = item.dt_txt.split(" ")[0];

        const alreadyExists = dailyForecast.find(function (forecast) {

            return forecast.date === date;

        });

        if (!alreadyExists) {

            dailyForecast.push({
                date: date,
                temp: Math.round(item.main.temp),
                description: item.weather[0].description,
                humidity: item.main.humidity,
                windSpeed: item.wind.speed
            });

        }

    });

    dailyForecast.slice(0, 5).forEach(function (day) {

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${day.date}</h3>
            <p>${day.temp}°C</p>
            <p>${day.description}</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Wind: ${day.windSpeed} m/s</p>
        `;

        forecastList.appendChild(card);

    });

    forecastContainer.style.display = "block";
}



// 2. IMPLEMENT addFavorite(city)

async function addFavorite(city) {

    let favorites = JSON.parse(
        localStorage.getItem("favorites")
    ) || [];

    if (favorites.includes(city)) {
        alert("City already added");
        return;
    }

    favorites.push(city);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();

}



// 3. IMPLEMENT loadFavorites()

function loadFavorites() {

    const favorites = JSON.parse(
        localStorage.getItem("favorites")
    ) || [];

    const favoritesList =
        document.getElementById("favoritesList");

    favoritesList.innerHTML = "";

    favorites.forEach(function (city) {

        const div = document.createElement("div");

        const cityButton = document.createElement("button");
        cityButton.textContent = city;

        cityButton.addEventListener("click", function () {

            searchWeather(city);

        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "❌";

        removeButton.addEventListener("click", function () {

            removeFavorite(city);

        });

        div.appendChild(cityButton);
        div.appendChild(removeButton);

        favoritesList.appendChild(div);

    });
};

function removeFavorite(city) {

    let favorites = JSON.parse(
        localStorage.getItem("favorites")
    ) || [];

    favorites = favorites.filter(function (favorite) {

        return favorite !== city;

    });

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();
}



// 4. IMPLEMENT searchWeather()

async function searchWeather(city) {

    const weatherCard = document.getElementById("weatherCard");
    const errorMsg = document.getElementById("errorMsg");
    const loading = document.getElementById("loading");
    const forecastContainer = document.getElementById("forecastContainer");

    try {

        loading.style.display = "block";
        weatherCard.style.display = "none";
        forecastContainer.style.display = "none";
        errorMsg.style.display = "none";

        const weather = await getWeather(city);

        const forecast = await getForecast(city);
        displayForecast(forecast);

        weatherCard.innerHTML = `
            <h2>${weather.city}</h2>
            <p>Temperature: ${weather.temp}°C</p>
            <p>Feels Like: ${weather.feelsLike}°C</p>
            <p>Weather: ${weather.description}</p>
            <p>Humidity: ${weather.humidity}%</p>
            <p>Wind Speed: ${weather.windSpeed} m/s</p>

            <button onclick="addFavorite('${weather.city}')">
                ⭐ Add to Favorites
            </button>
        `;
        weatherCard.style.display = "block";

    } catch (error) {
        weatherCard.style.display = "none";
        forecastContainer.style.display = "none";
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";

    } finally {

        loading.style.display = "none";

    }

}



// 5. IMPLEMENT debounceSearch()
let debounceTimer;

function debounceSearch() {

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
        const city = document.getElementById("cityInput").value.trim();
        if (city !== "") {
            searchWeather(city);
        }else {

            document.getElementById("weatherCard").style.display = "none";

            document.getElementById("forecastContainer").style.display = "none";

            document.getElementById("errorMsg").style.display = "none";

        }
    }, 500);

}



// 6. Event Listeners (wire up buttons/inputs)

document.addEventListener("DOMContentLoaded", function () {

    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");
    const themeBtn = document.getElementById("themeBtn");

    searchBtn.addEventListener("click", function () {

        const city = cityInput.value.trim();

        if (city === "") {
            alert("Please enter a city name");
            return;
        }

        searchWeather(city);

    });

    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        if (document.body.classList.contains("dark")) {
            themeBtn.textContent = "☀️ Light";
        } else {
            themeBtn.textContent = "🌙 Dark";
        }
    })

    cityInput.addEventListener("input", function () {
        debounceSearch();
    })

    loadFavorites();

});

// Export functions for button onclick (temporary)

window.searchWeather = searchWeather;

window.addFavorite = addFavorite;

