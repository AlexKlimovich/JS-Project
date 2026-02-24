export class Weather {
  constructor(lat, lon, weatherApiKey) {
    this.currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;
    this.forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;
  }
  setWeather() {
    fetch(this.currentUrl)
      .then((res) => res.json())
      .then((data) => {
        document.getElementById('city-name').textContent = data.name;
        document.getElementById('temperature').textContent =
          Math.round(data.main.temp) + '°';
        document.getElementById('description').textContent =
          data.weather[0].description;

        const iconCode = data.weather[0].icon;
        document.getElementById('weather-icon').innerHTML = `
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Погода">
      `;
      })
      .catch((err) => {
        console.error('Ошибка текущей погоды:', err);
        document.getElementById('city-name').textContent = 'Ошибка загрузки';
      });

    // Прогноз на 5 дней
    fetch(this.forecastUrl)
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
              day: date.toLocaleDateString('ru', { weekday: 'short' }),
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
          .join('');

        document.getElementById('forecast').innerHTML = forecastHtml;
      })
      .catch((err) => {
        console.error('Ошибка прогноза:', err);
        document.getElementById('forecast').innerHTML =
          '<div>Не удалось загрузить прогноз</div>';
      });
  }
  static resetWeather() {
    document.getElementById('city-name').textContent = 'Выберите точку';
    document.getElementById('temperature').textContent = '';
    document.getElementById('description').textContent = '';
    document.getElementById('weather-icon').innerHTML = '';
    document.getElementById('forecast').innerHTML = '';
  }
}
