export const initMap = (coordinate: [number, number]) =>
  new Promise((resolve) => {
    window.ymaps.ready(function () {
      const myMap = new window.ymaps.Map('map', {
        center: coordinate,
        zoom: 10,
      });

      myMap.events.add('mousedown', function (e: any) {
        const coords = e.get('coords');

        setTimeout(() => {
          window.ymaps
            .geocode(coords)
            .then(function (res: any) {
              const address = res.geoObjects.get(0).getAddressLine();
              console.log('Координаты:', coords);
              console.log('Адрес:', address);
              const addressEl = document.getElementById(
                'address',
              ) as HTMLInputElement | null;

              const coordsEl = document.getElementById(
                'coords',
              ) as HTMLInputElement | null;
              if (addressEl) addressEl.value = address;
              if (coordsEl) coordsEl.value = coords;
            })
            .catch(function (error: any) {
              console.log(error);
            });
        }, 100);
      });
      resolve(myMap);
    });
  });
