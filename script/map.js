let myMap;
ymaps.ready(function () {
  myMap = new ymaps.Map("map", {
    center: coordinate,
    zoom: 10,
  });

  myMap.events.add("mousedown", function (e) {
    const coords = e.get("coords");

    setTimeout(() => {
      ymaps
        .geocode(coords)
        .then(function (res) {
          const address = res.geoObjects.get(0).getAddressLine();
          console.log("Координаты:", coords);
          console.log("Адрес:", address);
          document.getElementById("address").value = address;
          document.getElementById("coords").value = coords;
        })
        .catch(function (error) {
          console.log(error);
        });
    }, 100);
  });
});
