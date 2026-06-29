// Sample weather object used for testing layout before connecting the API
const wo2 = {
    'namelocation': "Los Angeles",
    'countryCode': "US",
    'description': "Sunny",
    'temperature': "28.5",
    'feelsLike': "100",
    'windspeed': "0",
    'humidity': "50"
};

// OpenWeather API key
API_KEY = "90fda2032fa98b1cd03beecc0c980777";


// Fetch current weather data using latitude and longitude
async function getCurrentWeather(lat, lon) {
    try {
        const respone = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`,
            { mode: "cors" }
        );

        const weatherData = await respone.json();
        return weatherData;

    } catch { }
}


// Convert a typed city/location search into coordinates
async function getCoordinates(location) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`,
            { mode: "cors" }
        );

        const data = await response.json();

        if (data.length === 0) {
            throw new Error("City not found");
        }

        return {
            lat: data[0].lat,
            lon: data[0].lon,
            state: data[0].state,
            country: data[0].country
        };

    } catch { }
}


// Get weather data from a typed city name
async function weather(name) {
    try {
        const coordinates = getCoordinates(name);
        const data = await getCurrentWeather((await coordinates).lat, (await coordinates).lon);

        const namelocation = data.name;
        const state = (await coordinates).state;
        const countryCode = (await coordinates).country;
        const description = data.weather[0].description;
        const weatherMain = data.weather[0].main;
        const icon = data.weather[0].icon;
        const temperature = data.main.temp;
        const feelsLike = data.main.feels_like;
        const windspeed = data.wind.speed;
        const humidity = data.main.humidity;

        return {
            namelocation,
            state,
            countryCode,
            description,
            weatherMain,
            icon,
            temperature,
            feelsLike,
            windspeed,
            humidity
        };

    } catch (err) {
        return "error";
    }
}


// Get weather data from a selected autocomplete result
async function weatherByCoordinates(city) {
    try {
        const data = await getCurrentWeather(city.lat, city.lon);

        return {
            namelocation: city.name,
            state: city.state,
            countryCode: city.country,
            description: data.weather[0].description,
            weatherMain: data.weather[0].main,
            icon: data.weather[0].icon,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            windspeed: data.wind.speed,
            humidity: data.main.humidity
        };

    } catch (err) {
        return "error";
    }
}


// Change the page background based on the current weather condition
function setWeatherBackground(weatherMain) {
    let image = "default.jpg";

    if (weatherMain === "Clear") {
        image = "clear.jpg";
    } else if (weatherMain === "Clouds") {
        image = "clouds.jpg";
    } else if (weatherMain === "Rain" || weatherMain === "Drizzle") {
        image = "rain.jpg";
    } else if (weatherMain === "Snow") {
        image = "snow.jpg";
    } else if (weatherMain === "Thunderstorm") {
        image = "thunderstorm.jpg";
    } else if (
        weatherMain === "Mist" ||
        weatherMain === "Fog" ||
        weatherMain === "Haze"
    ) {
        image = "mist.jpg";
    }

    document.body.style.backgroundImage = `url("./images/${image}")`;
}


// Build the first screen users see before searching
function renderWelcomeComponent() {
    document.body.style.backgroundImage = "url('./images/default.jpg')";

    const main = document.createElement("main");
    main.id = "welcomeCard";
    document.querySelector("body").appendChild(main);

    main.innerHTML = `

        <h1 id="welcomeTitle">Welcome to Weather</h1>

        <p id="welcomeText">
            Search for any city to view current weather conditions.
        </p>

        <div id="welcomeFeatures">
            <div>
                <h3>Worldwide Search</h3>
                <p>Find weather for cities around the world.</p>
            </div>

            <div>
                <h3>Live Conditions</h3>
                <p>Get current temperature, wind, and humidity.</p>
            </div>

            <div>
                <h3>Dynamic Backgrounds</h3>
                <p>Backgrounds change with the weather.</p>
            </div>
        </div>

        <p id="welcomeHint">Start by searching for a city above.</p>
    `;
}


// Build the weather card UI
const renderWeatherComponent = (weatherObj) => {
    setWeatherBackground(weatherObj.weatherMain);

    const main = document.createElement("main");
    document.querySelector("body").appendChild(main);

    const locationName = document.createElement("h1");
    locationName.id = "location";
    locationName.textContent = `${weatherObj.namelocation}, ${weatherObj.state || ""} ${weatherObj.countryCode}`;
    main.appendChild(locationName);

    const date = document.createElement("p");
    date.id = "date";
    date.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
    main.appendChild(date);

    const weatherMiddle = document.createElement("div");
    weatherMiddle.id = "weatherMiddle";
    main.appendChild(weatherMiddle);

    // Weather icon comes directly from the OpenWeather response
    const weatherIcon = document.createElement("img");
    weatherIcon.id = "weatherIcon";
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherObj.icon}@4x.png`;
    weatherIcon.alt = weatherObj.description;
    weatherMiddle.appendChild(weatherIcon);

    const tempContainer = document.createElement("div");
    tempContainer.id = "tempContainer";
    weatherMiddle.appendChild(tempContainer);

    const temperature = document.createElement("h2");
    temperature.id = "temperature";
    temperature.textContent = `${Math.round(weatherObj.temperature)}`;
    tempContainer.appendChild(temperature);

    const units = document.createElement("h4");
    units.id = "units";
    units.textContent = currentUnitSymbol;
    tempContainer.appendChild(units);

    const description = document.createElement("h2");
    description.id = "description";
    description.textContent = `${weatherObj.description}`;
    main.appendChild(description);

    const divider = document.createElement("div");
    divider.id = "divider";
    main.appendChild(divider);

    const bottomContainer = document.createElement("div");
    bottomContainer.id = "bottomContainer";
    main.appendChild(bottomContainer);

    const feelsLike = document.createElement("p");
    feelsLike.innerHTML = `<span>Feels like</span><strong>${Math.round(weatherObj.feelsLike)} ${currentUnitSymbol}</strong>`;
    bottomContainer.appendChild(feelsLike);

    const humidity = document.createElement("p");
    humidity.innerHTML = `<span>Humidity</span><strong>${weatherObj.humidity}%</strong>`;
    bottomContainer.appendChild(humidity);

    const windUnits = currentUnit === "imperial" ? "mph" : "m/s";

    const windspeed = document.createElement("p");
    windspeed.innerHTML = `<span>Wind</span><strong>${Math.round(weatherObj.windspeed)} ${windUnits}</strong>`;
    bottomContainer.appendChild(windspeed);
};


// Display weather data or show an error message
async function renderer(weatherObject) {
    const weatherData = await weatherObject;

    if (weatherData === "error") {
        if (document.querySelector("main")) {
            document.querySelector("main").remove();
        }

        const main = document.createElement("main");

        main.innerHTML = `
            <h1>City not found</h1>
            <p>Try searching for another city.</p>
        `;

        document.body.appendChild(main);
        return;
    }

    if (document.querySelector("main")) {
        document.querySelector("main").remove();
    }

    document.querySelector("input").value = "";
    renderWeatherComponent(weatherData);
}


// DOM references
const input = document.querySelector("#cityInput");
const suggestionsBox = document.querySelector("#suggestions");
const form = document.querySelector("#searchForm");
const unitToggle = document.querySelector("#unitToggle");


// App state
let currentUnit = "imperial";
let currentUnitSymbol = "°F";
let currentCity = "tampa";


// Search city autocomplete suggestions
async function getCitySuggestions(name) {
    if (name.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${name}&limit=5&appid=${API_KEY}`,
        { mode: "cors" }
    );

    const cities = await response.json();

    suggestionsBox.innerHTML = "";

    cities.forEach((city) => {
        const option = document.createElement("div");
        option.classList.add("suggestion");

        option.textContent = `${city.name}, ${city.state || ""} ${city.country}`;

        option.addEventListener("click", () => {
            input.value = `${city.name}, ${city.state || ""} ${city.country}`;
            suggestionsBox.innerHTML = "";

            currentCity = {
                name: city.name,
                state: city.state,
                country: city.country,
                lat: city.lat,
                lon: city.lon
            };

            renderer(weatherByCoordinates(currentCity));
        });

        suggestionsBox.appendChild(option);
    });
}


// Fetch autocomplete results as the user types
input.addEventListener("input", () => {
    getCitySuggestions(input.value.trim());
});


// Search when the form is submitted
form.addEventListener("submit", (event) => {
    event.preventDefault();

    currentCity = input.value;
    renderer(weather(currentCity));
    suggestionsBox.innerHTML = "";
});


// Toggle between Fahrenheit and Celsius
unitToggle.addEventListener("click", () => {
    if (currentUnit === "imperial") {
        currentUnit = "metric";
        currentUnitSymbol = "°C";
        unitToggle.textContent = "°C";
    } else {
        currentUnit = "imperial";
        currentUnitSymbol = "°F";
        unitToggle.textContent = "°F";
    }

    if (typeof currentCity === "object") {
        renderer(weatherByCoordinates(currentCity));
    } else {
        renderer(weather(currentCity));
    }
});


// Load the welcome screen when the app first opens
renderWelcomeComponent();