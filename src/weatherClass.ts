export class Weather {
  private currentUrl: string;
  private forecastUrl: string;

  private static cityNameEl: HTMLElement | null =
    document.getElementById('city-name');
  private static tempEl: HTMLElement | null =
    document.getElementById('temperature');
  private static descEl: HTMLElement | null =
    document.getElementById('description');
  private static iconEl: HTMLElement | null =
    document.getElementById('weather-icon');
  private static forecastEl: HTMLElement | null =
    document.getElementById('forecast');

  constructor(lat: number, lon: number, weatherApiKey: string) {
    this.currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;
    this.forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;
  }
  async setWeather(): Promise<void> {
    fetch(this.currentUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Weather.cityNameEl) Weather.cityNameEl.textContent = data.name;
        if (Weather.tempEl)
          Weather.tempEl.textContent = Math.round(data.main.temp) + '°';
        if (Weather.descEl)
          Weather.descEl.textContent = data.weather[0].description;

        const iconCode = data.weather[0].icon;
        if (Weather.iconEl)
          Weather.iconEl.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Погода">
      `;
      })
      .catch((err) => {
        console.error('Ошибка текущей погоды:', err);
        if (Weather.cityNameEl)
          Weather.cityNameEl.textContent = 'Ошибка загрузки';
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

        if (Weather.forecastEl) Weather.forecastEl.innerHTML = forecastHtml;
      })
      .catch((err) => {
        console.error('Ошибка прогноза:', err);
        if (Weather.forecastEl)
          Weather.forecastEl.innerHTML =
            '<div>Не удалось загрузить прогноз</div>';
      });
  }
  static resetWeather(): void {
    if (this.cityNameEl) this.cityNameEl.textContent = 'Выберите точку';
    if (this.tempEl) this.tempEl.textContent = '';
    if (this.descEl) this.descEl.textContent = '';
    if (this.iconEl) this.iconEl.innerHTML = '';
    if (this.forecastEl) this.forecastEl.innerHTML = '';
  }
}
