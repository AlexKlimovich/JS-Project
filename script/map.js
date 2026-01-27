ymaps.ready(function () {
  const myMap = new ymaps.Map("map", {
    center: [53.904541, 27.561524],
    zoom: 10,
  });

  myMap.events.add("mousedown", function (e) {
    const coords = e.get("coords");

    setTimeout(() => {
      ymaps.geocode(coords).then(function (res) {
        const address = res.geoObjects.get(0).getAddressLine();
        console.log("Координаты:", coords);
        console.log("Адрес:", address);
        document.getElementById("address").value = address;
        document.getElementById("coords").value = coords;
      });
    }, 100);
  });
});
