let mass = JSON.parse(localStorage.getItem("massPoint")) || [];
let markerMass = [];
let coordinate = [53.9006, 27.559];
let weatherApiKey;

navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    coordinate = [lat, lon];
    console.log(lat, lon);
  },
  (error) => {
    console.error(error);
  },
);

document.getElementById("formApi").addEventListener("submit", function (e) {
  e.preventDefault();
  const scriptmap = document.createElement("script");
  const apikey = document.getElementById("apikey").value.trim();
  weatherApiKey = document.getElementById("weatherapikey").value.trim();

  if (!apikey && !weatherApiKey) {
    alert("Поля не заполнены! Введите API-ключи.");
    document.getElementById("apikey").focus();
    return;
  } else if (!apikey) {
    alert("Введите Yandex API-ключ!");
    document.getElementById("apikey").focus();
    return;
  } else if (!weatherApiKey) {
    alert("Введите WeatherMap API-ключ!");
    document.getElementById("weatherapikey").focus();
    return;
  }

  // initWeatherMap(weatherApiKey);
  scriptmap.src = `https://api-maps.yandex.ru/2.1/?apikey=${apikey}&lang=ru_RU`;
  scriptmap.onload = () => {
    if (!window.mapJsLoaded) {
      const mapjs = document.createElement("script");
      mapjs.src = "/script/map.js";
      document.head.appendChild(mapjs);
      document.getElementById("contentSection").classList.remove("hidden");
      document.getElementById("apiSection").classList.add("hidden");
      renderList();
      window.mapJsLoaded = true;
    }
  };
  document.head.appendChild(scriptmap);
});

// function initWeatherMap(apiKey) {
//   if (window.weatherMapInstance) {
//     window.weatherMapInstance.remove();
//   }

//   const map = L.map("weather-map").setView(coordinate, 10);
//   window.weatherMapInstance = map;

//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution:
//       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   }).addTo(map);

//   L.tileLayer(
//     `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`,
//     {
//       attribution:
//         'Weather from <a href="https://openweathermap.org/">OpenWeatherMap</a>',
//     },
//   ).addTo(map);
//   setTimeout(() => {
//     map.invalidateSize();
//   }, 1000);
// }

document
  .getElementById("formInterest")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const interest = {
      id: "interest_" + Date.now(),
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      coords: document.getElementById("coords").value,
      rating: parseInt(document.getElementById("rating").value),
    };
    mass.unshift(interest);
    localStorage.setItem("massPoint", JSON.stringify(mass));
    renderList();
    this.reset();
  });

function renderList() {
  const filterName = document.getElementById("nameFilt").value.toLowerCase();
  const filterRating = document.getElementById("ratingFilt").value;
  const filterList = mass.filter((item) => {
    const matchName = item.name.toLowerCase().includes(filterName);
    const matchRating =
      filterRating === "all" || item.rating === parseInt(filterRating);
    return matchName && matchRating;
  });
  const interestList = document.getElementById("interestList");

  interestList.innerHTML = filterList
    .map(
      (item) => `
      <div class="point-item" data-id="${item.id}">
        <div class="point-content">
          <p>ID точки: <span class="resultText">${item.id}</span></p>
          <p>Название точки: <span class="resultText">${item.name}</span></p>
          <p>Адрес точки: <span class="resultText">${item.address}</span></p>
          <p>Координаты: <span class="resultText">${item.coords}</span></p>
          <p>Рейтинг: <span class="resultText">${item.rating}</span> ⭐</p>
        </div>
        <button class="favorite-btn" title="В избранное">Избраное</button>
        <button class="trashBtn" title="Удалить" data-id="${item.id}"></button>
      </div>`,
    )
    .join("");

  if (filterList.length > 0) {
    interestList.style.display = "block";
  } else {
    interestList.style.display = "none";
  }
}

document.getElementById("interestList").addEventListener("click", function (e) {
  const object = e.target.closest(".point-item");
  if (!object) return;
  const id = object.dataset.id;

  if (e.target.classList.contains("trashBtn")) {
    mass = mass.filter((item) => item.id !== id);
    localStorage.setItem("massPoint", JSON.stringify(mass));
    renderList();
    return;
  }

  if (
    e.target.classList.contains("favorite-btn") ||
    e.target.classList.contains("trashBtn")
  ) {
    return;
  }

  const pointItem = e.target.closest(".point-item");
  if (!pointItem) return;

  const item = mass.find((i) => i.id === id);
  if (!item) return;

  const [lat, lon] = item.coords.split(",").map(Number);

  // Погода
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;

  // Текущая погода
  fetch(currentUrl)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("city-name").textContent = data.name;
      document.getElementById("temperature").textContent =
        Math.round(data.main.temp) + "°";
      document.getElementById("description").textContent =
        data.weather[0].description;

      const iconCode = data.weather[0].icon;
      document.getElementById("weather-icon").innerHTML = `
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Погода">
      `;
    })
    .catch((err) => {
      console.error("Ошибка текущей погоды:", err);
      document.getElementById("city-name").textContent = "Ошибка загрузки";
    });

  // Прогноз на 5 дней
  fetch(forecastUrl)
    .then((res) => res.json())
    .then((data) => {
      const dailyForecast = [];
      const seenDates = new Set();

      for (let item of data.list) {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();
        if (!seenDates.has(day)) {
          seenDates.add(day);
          dailyForecast.push({
            day: date.toLocaleDateString("ru", { weekday: "short" }),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
          });
          if (dailyForecast.length === 5) break;
        }
      }

      const forecastHtml = dailyForecast
        .map(
          (day) => `
        <div style="text-align: center;">
          <div style="font-size: 14px; color: #e0e0e0; margin-bottom: 8px;">${day.day}</div>
          <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="Погода" style="width: 40px; height: 40px;">
          <div style="font-size: 16px; font-weight: bold; color: #e0e0e0; margin-top: 4px;">${day.temp}°</div>
        </div>
      `,
        )
        .join("");

      document.getElementById("forecast").innerHTML = forecastHtml;
    })
    .catch((err) => {
      console.error("Ошибка прогноза:", err);
      document.getElementById("forecast").innerHTML =
        "<div>Не удалось загрузить прогноз</div>";
    });

  //Точки на карте
  if (markerMass.filter((item) => item.id === id).length === 0) {
    var coords = item.coords.split(",").map(Number);
    var placemark = new ymaps.Placemark(coords, {
      balloonContent: item.name,
    });

    myMap.geoObjects.add(placemark);
    markerMass.push({ id, placemark });
  } else {
    myMap.geoObjects.remove(
      markerMass.find((item) => item.id === id).placemark,
    );
    markerMass = markerMass.filter((item) => item.id !== id);
  }

  pointItem.classList.toggle("selected");
});

document.getElementById("nameFilt").addEventListener("keyup", renderList);
document.getElementById("ratingFilt").addEventListener("change", renderList);
