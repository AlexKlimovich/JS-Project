let mass = JSON.parse(localStorage.getItem("massPoint")) || [];

document.getElementById("submitapi").addEventListener("click", function (e) {
  const scriptmap = document.createElement("script");
  const apikey = document.getElementById("apikey").value.trim();

  if (!apikey) {
    alert("Введите API-ключ!");
    input.focus();
    return;
  }
  scriptmap.src = `https://api-maps.yandex.ru/2.1/?apikey=${apikey}&lang=ru_RU`;
  scriptmap.onload = () => {
    const mapjs = document.createElement("script");
    mapjs.src = "/script/map.js";
    document.head.appendChild(mapjs);
    document.getElementById("contentSection").classList.remove("hidden");
    document.getElementById("apiSection").classList.add("hidden");
    renderList();
  };
  document.head.appendChild(scriptmap);
});

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
      <div class="point-item">
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
  const id = e.target.dataset.id;
  mass = mass.filter((item) => item.id !== id);
  localStorage.setItem("massPoint", JSON.stringify(mass));
  renderList();
});

document.getElementById("nameFilt").addEventListener("keyup", renderList);
document.getElementById("ratingFilt").addEventListener("change", renderList);
