let mass = [];

document
  .getElementById("formInterest")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const interest = {
      id: "interest_" + Date.now(),
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      rating: parseInt(document.getElementById("rating").value),
    };
    mass.unshift(interest);
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
        <div><p>ID точки: <span class="resultText">${item.id}</span></p>
        <p>Название точки: <span class="resultText">${item.name}</span></p>
        <p>Адрес точки: <span class="resultText">${item.address}</span></p>
        <p>Рейтинг: <span class="resultText">${item.rating}</span> ⭐</p></div>
        <div><button class="favorite-btn">Избраное</button></div>
      </div>`
    )
    .join("");

  if (filterList.length > 0) {
    interestList.style.display = "block";
  } else {
    interestList.style.display = "none";
  }
}

document.getElementById("nameFilt").addEventListener("keyup", renderList);
document.getElementById("ratingFilt").addEventListener("change", renderList);
