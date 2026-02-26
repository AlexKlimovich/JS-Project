import './style/variables.css';
import './style/style.css';
import './map.ts';
import { Weather } from './weatherClass.ts';
import { initMap } from './map.ts';

const interestList = document.getElementById(
  'interestList',
) as HTMLElement | null;

const nameFilt = document.getElementById('nameFilt') as HTMLInputElement | null;
const ratingFilt = document.getElementById(
  'ratingFilt',
) as HTMLInputElement | null;

let mass: Point[] = JSON.parse(localStorage.getItem('massPoint') || '[]');
let markerMass: { id: string; placemark: ymaps.Placemark }[] = [];
let coordinate: [number, number] = [53.9006, 27.559];
let weatherApiKey: string;
let showOnlyFavourites: boolean = false;
let myMap: ymaps.Map;
// let selectedPointId: string | null = null;
let selectedPointId: string | undefined;

navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat: number = position.coords.latitude;
    const lon: number = position.coords.longitude;
    coordinate = [lat, lon];
    console.log(lat, lon);
  },
  (error) => {
    console.error(error);
  },
);

const formApi = document.getElementById('formApi') as HTMLFormElement | null;
formApi?.addEventListener('submit', function (e) {
  e.preventDefault();
  const scriptmap = document.createElement('script');
  const apiKeyInput = document.getElementById(
    'apikey',
  ) as HTMLInputElement | null;
  const weatherKeyInput = document.getElementById(
    'weatherapikey',
  ) as HTMLInputElement | null;

  const apikey = apiKeyInput?.value.trim();
  weatherApiKey = weatherKeyInput?.value.trim() || '';

  if (!apikey && !weatherApiKey) {
    alert('Поля не заполнены! Введите API-ключи.');
    apiKeyInput?.focus();
    return;
  } else if (!apikey) {
    alert('Введите Yandex API-ключ!');
    apiKeyInput?.focus();
    return;
  } else if (!weatherApiKey) {
    alert('Введите WeatherMap API-ключ!');
    weatherKeyInput?.focus();
    return;
  }

  scriptmap.src = `https://api-maps.yandex.ru/2.1/?apikey=${apikey}&lang=ru_RU`;
  scriptmap.onload = () => {
    if (!window.mapJsLoaded) {
      // const mapjs = document.createElement('script');
      // mapjs.src = '/script/map.js';
      // document.head.appendChild(mapjs);
      const contentSection = document.getElementById(
        'contentSection',
      ) as HTMLElement | null;
      const apiSection = document.getElementById(
        'apiSection',
      ) as HTMLElement | null;

      contentSection?.classList.remove('hidden');
      apiSection?.classList.add('hidden');

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

const formInterest = document.getElementById(
  'formInterest',
) as HTMLFormElement | null;

formInterest?.addEventListener('submit', function (e) {
  e.preventDefault();

  // const savedNameFilter = document.getElementById('nameFilt').value;
  // const savedRatingFilter = document.getElementById('ratingFilt').value;

  if (nameFilt) {
    nameFilt.value = '';
  }
  if (ratingFilt) {
    ratingFilt.value = 'all';
  }

  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const addressInput = document.getElementById(
    'address',
  ) as HTMLInputElement | null;
  const coordsInput = document.getElementById(
    'coords',
  ) as HTMLInputElement | null;

  const ratingInput = document.getElementById(
    'rating',
  ) as HTMLSelectElement | null;

  const interest: Point = {
    id: 'interest_' + Date.now(),
    name: nameInput?.value || '',
    address: addressInput?.value || '',
    coords: coordsInput?.value || '',
    rating: parseInt(ratingInput?.value || '0'),
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
  const nameFilt = document.getElementById(
    'nameFilt',
  ) as HTMLInputElement | null;
  const ratingFilt = document.getElementById(
    'ratingFilt',
  ) as HTMLInputElement | null;

  const filterName = nameFilt?.value.toLowerCase();
  const filterRating = ratingFilt?.value;
  const filterList = mass.filter((item) => {
    const matchName = item.name.toLowerCase().includes(filterName || '');
    const matchRating =
      filterRating === 'all' || item.rating === parseInt(filterRating || '0');
    const matchFavorite =
      item.favorite === showOnlyFavourites || !showOnlyFavourites;
    return matchName && matchRating && matchFavorite;
  });

  if (interestList) {
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
}

const buttonFav = document.getElementById('favBtn') as HTMLButtonElement | null;

buttonFav?.addEventListener('click', function () {
  showOnlyFavourites = !showOnlyFavourites;
  this.textContent = showOnlyFavourites ? 'Показать все' : 'Показать избранное';
  renderList();
});

interestList?.addEventListener('click', function (e) {
  const target = e.target as HTMLElement | null;
  const object = target?.closest('.point-item') as HTMLElement | null;
  if (!object) return;

  const id = object.dataset.id;
  if (!id) return;

  const item = mass.find((i) => i.id === id);
  if (!item) return;

  const [lat, lon] = item.coords.split(',').map(Number);

  // Удаление

  if (target?.classList.contains('trashBtn')) {
    mass = mass.filter((item) => item.id !== id);
    localStorage.setItem('massPoint', JSON.stringify(mass));
    renderList();

    const markerToRemove = markerMass.find((m) => m.id === id);
    if (markerToRemove) {
      myMap.geoObjects.remove(markerToRemove.placemark);
      markerMass = markerMass.filter((m) => m.id !== id);
    }

    if (selectedPointId === id) {
      selectedPointId = undefined; //!!!!!!!!!!!
      Weather.resetWeather();
    }
    return;
  }

  // Избранное
  if (target?.classList.contains('favorite-btn')) {
    item.favorite = !item.favorite;
    localStorage.setItem('massPoint', JSON.stringify(mass));
    target?.classList.toggle('selected');
    return;
  }

  if (selectedPointId === id) {
    // Повторное нажатие на ту же точку → снимает выделение
    object.classList.remove('selected');
    selectedPointId = undefined; //!!!!!!!!!!!

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
      const placemark = new window.ymaps.Placemark(coords, {
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

nameFilt?.addEventListener('keyup', renderList);
ratingFilt?.addEventListener('change', renderList);
