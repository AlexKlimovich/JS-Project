// Проверка, что ключ доступен
if (!window.OPENWEATHER_API_KEY) {
  console.error("OpenWeatherMap API key not provided!");
  // Можно показать ошибку на странице
  return;
}

var map = L.map("weather-map").setView([55.75, 37.62], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Слой температуры с динамическим API-ключом
L.tileLayer(
  `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${window.OPENWEATHER_API_KEY}`,
  {
    attribution:
      'Weather from <a href="https://openweathermap.org/">OpenWeatherMap</a>',
  },
).addTo(map);
