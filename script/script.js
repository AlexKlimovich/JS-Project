let mass = JSON.parse(localStorage.getItem("massPoint")) || [];

document.getElementById("formApi").addEventListener("submit", function (e) {
  e.preventDefault();
  const scriptmap = document.createElement("script");
  const apikey = document.getElementById("apikey").value.trim();
  const weatherApiKey = document.getElementById("weatherapikey").value.trim();

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
  scriptmap.src = `https://api-maps.yandex.ru/2.1/?apikey=  ${apikey}&lang=ru_RU`;
  scriptmap.onload = () => {
    const mapjs = document.createElement("script");
    mapjs.src = "/script/map.js";
    document.head.appendChild(mapjs);
    document.getElementById("contentSection").classList.remove("hidden");
    document.getElementById("apiSection").classList.add("hidden");
    renderList();
  };
  document.head.appendChild(scriptmap);

  initWeatherMap(weatherApiKey);
});

function initWeatherMap(apiKey) {
  if (window.weatherMapInstance) {
    window.weatherMapInstance.remove();
  }

  const map = L.map("weather-map").setView([55.75, 37.62], 5);
  window.weatherMapInstance = map;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright  ">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.tileLayer(
    `https://tile.openweathermap.org/map/temp_new/  {z}/{x}/{y}.png?appid=${apiKey}`,
    {
      attribution:
        'Weather from <a href="https://openweathermap.org/  ">OpenWeatherMap</a>',
    },
  ).addTo(map);
}

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
  if (e.target.classList.contains("trashBtn")) {
    const id = e.target.dataset.id;
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
  if (pointItem) {
    pointItem.classList.toggle("selected");
  }
});

document.getElementById("nameFilt").addEventListener("keyup", renderList);
document.getElementById("ratingFilt").addEventListener("change", renderList);
