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
        <div>
        <p>ID точки: ${item.id}</p>
        <p>Название точки: ${item.name}</p>
        <p>Адрес точки: ${item.address}</p>
        <p>Рейтинг: ${item.rating}</p>
        <button>Избраное</button>
      </div>`
    )
    .join("");
}

document.getElementById("nameFilt").addEventListener("keyup", renderList);
document.getElementById("ratingFilt").addEventListener("change", renderList);
