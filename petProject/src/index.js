import './style/variables.css';
import './style/style.css';
import './map.js';
import { Weather } from './weatherClass.js';
import { initMap } from './map.js';

let mass = JSON.parse(localStorage.getItem('massPoint')) || [];
let markerMass = [];
let coordinate = [53.9006, 27.559];
let weatherApiKey;
let showOnlyFavourites = false;
let myMap;
let selectedPointId = null;

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

document.getElementById('formApi').addEventListener('submit', function (e) {
  e.preventDefault();
  const scriptmap = document.createElement('script');
  const apikey = document.getElementById('apikey').value.trim();
  weatherApiKey = document.getElementById('weatherapikey').value.trim();

  if (!apikey && !weatherApiKey) {
    alert('Поля не заполнены! Введите API-ключи.');
    document.getElementById('apikey').focus();
    return;
  } else if (!apikey) {
    alert('Введите Yandex API-ключ!');
    document.getElementById('apikey').focus();
    return;
  } else if (!weatherApiKey) {
    alert('Введите WeatherMap API-ключ!');
    document.getElementById('weatherapikey').focus();
    return;
  }

  // initWeatherMap(weatherApiKey);
  scriptmap.src = `https://api-maps.yandex.ru/2.1/?apikey=${apikey}&lang=ru_RU`;
  scriptmap.onload = () => {
    if (!window.mapJsLoaded) {
      // const mapjs = document.createElement('script');
      // mapjs.src = '/script/map.js';
      // document.head.appendChild(mapjs);
      document.getElementById('contentSection').classList.remove('hidden');
      document.getElementById('apiSection').classList.add('hidden');
      renderList();
      initMap(coordinate).then((result) => (myMap = result));
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
  .getElementById('formInterest')
  .addEventListener('submit', function (e) {
    e.preventDefault();

    // const savedNameFilter = document.getElementById('nameFilt').value;
    // const savedRatingFilter = document.getElementById('ratingFilt').value;

    document.getElementById('nameFilt').value = '';
    document.getElementById('ratingFilt').value = 'all';

    const interest = {
      id: 'interest_' + Date.now(),
      name: document.getElementById('name').value,
      address: document.getElementById('address').value,
      coords: document.getElementById('coords').value,
      rating: parseInt(document.getElementById('rating').value),
      favorite: false,
    };
    mass.unshift(interest);
    localStorage.setItem('massPoint', JSON.stringify(mass));
    renderList();
    this.reset();

    // document.getElementById('nameFilt').value = savedNameFilter;
    // document.getElementById('ratingFilt').value = savedRatingFilter;
  });

function renderList() {
  const filterName = document.getElementById('nameFilt').value.toLowerCase();
  const filterRating = document.getElementById('ratingFilt').value;
  const filterList = mass.filter((item) => {
    const matchName = item.name.toLowerCase().includes(filterName);
    const matchRating =
      filterRating === 'all' || item.rating === parseInt(filterRating);
    const matchFavorite =
      item.favorite === showOnlyFavourites || !showOnlyFavourites;
    return matchName && matchRating && matchFavorite;
  });
  const interestList = document.getElementById('interestList');

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
        <button class="favorite-btn ${item.favorite ? 'selected' : ''}" title="В избранное">Избраное</button>
        <button class="trashBtn" title="Удалить" data-id="${item.id}"></button>
      </div>`,
    )
    .join('');

  if (filterList.length > 0) {
    interestList.style.display = 'block';
  } else {
    interestList.style.display = 'none';
  }
}

document.getElementById('favBtn').addEventListener('click', function () {
  showOnlyFavourites = !showOnlyFavourites;
  this.textContent = showOnlyFavourites ? 'Показать все' : 'Показать избранное';
  renderList();
});

document.getElementById('interestList').addEventListener('click', function (e) {
  const object = e.target.closest('.point-item');
  if (!object) return;
  const id = object.dataset.id;

  const item = mass.find((i) => i.id === id);
  if (!item) return;

  const [lat, lon] = item.coords.split(',').map(Number);

  // Удаление
  if (e.target.classList.contains('trashBtn')) {
    mass = mass.filter((item) => item.id !== id);
    localStorage.setItem('massPoint', JSON.stringify(mass));
    renderList();

    const markerToRemove = markerMass.find((m) => m.id === id);
    if (markerToRemove) {
      myMap.geoObjects.remove(markerToRemove.placemark);
      markerMass = markerMass.filter((m) => m.id !== id);
    }

    if (selectedPointId === id) {
      selectedPointId = null;
      Weather.resetWeather();
    }
    return;
  }

  // Избранное
  if (e.target.classList.contains('favorite-btn')) {
    item.favorite = !item.favorite;
    localStorage.setItem('massPoint', JSON.stringify(mass));
    e.target.classList.toggle('selected');
    return;
  }

  if (selectedPointId === id) {
    // Повторное нажатие на ту же точку → снимает выделение
    object.classList.remove('selected');
    selectedPointId = null;

    // Удаление маркера
    const markerToRemove = markerMass.find((m) => m.id === id);
    if (markerToRemove) {
      myMap.geoObjects.remove(markerToRemove.placemark);
      markerMass = markerMass.filter((m) => m.id !== id);
    }

    // Сбрасываем погоду
    Weather.resetWeather();
  } else {
    // Выбираем новую точку

    // Снимаем выделение с предыдущей
    if (selectedPointId) {
      const prevEl = document.querySelector(
        `.point-item[data-id="${selectedPointId}"]`,
      );
      if (prevEl) prevEl.classList.remove('selected');

      const prevMarker = markerMass.find((m) => m.id === selectedPointId);
      if (prevMarker) {
        myMap.geoObjects.remove(prevMarker.placemark);
        markerMass = markerMass.filter((m) => m.id !== selectedPointId);
      }
    }

    // Выделяем новую
    selectedPointId = id;
    object.classList.add('selected');

    // Добавление маркера
    if (myMap) {
      const coords = item.coords.split(',').map(Number);
      const placemark = new ymaps.Placemark(coords, {
        balloonContent: item.name,
      });
      myMap.geoObjects.add(placemark);
      markerMass.push({ id, placemark });
      myMap.panTo(coords, { duration: 500 });
    }

    // Обновление погоды
    const weather = new Weather(lat, lon, weatherApiKey);
    weather.setWeather();
  }
});

document.getElementById('nameFilt').addEventListener('keyup', renderList);
document.getElementById('ratingFilt').addEventListener('change', renderList);
