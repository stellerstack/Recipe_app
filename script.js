const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const recipesDiv = document.getElementById("recipes");
const popup = document.getElementById("recipe-popup");
const closeBtn = document.getElementById("close-btn");
const recipeTitle = document.getElementById("recipe-title");
const recipeImg = document.getElementById("recipe-img");
const recipeInstructions = document.getElementById("recipe-instructions");
const ingredientList = document.getElementById("ingredient-list");
const viewFavBtn = document.getElementById("view-favourites-btn");

const favouriteBtn = document.createElement("button");
favouriteBtn.textContent = "⭐ Add to Favourites";
favouriteBtn.style.cssText = `
  background-color: #ff7043;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 10px;
`;
recipeInstructions.before(favouriteBtn);

let currentMeal = null;
let showingFavourites = false;

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a recipe name!");
    return;
  }
  showingFavourites = false;
  getRecipes(query);
});

async function getRecipes(query) {
  recipesDiv.innerHTML = "<p>Loading recipes...</p>";
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();
    if (!data.meals) {
      recipesDiv.innerHTML = "<p>No recipes found.</p>";
      return;
    }
    displayRecipes(data.meals);
  } catch {
    recipesDiv.innerHTML = "<p>Something went wrong.</p>";
  }
}

function displayRecipes(meals) {
  recipesDiv.innerHTML = "";
  meals.forEach(meal => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    `;
    card.addEventListener("click", () => showRecipe(meal));
    recipesDiv.appendChild(card);
  });
}

function showRecipe(meal) {
  currentMeal = meal;
  recipeTitle.textContent = meal.strMeal;
  recipeImg.src = meal.strMealThumb;
  recipeInstructions.textContent = meal.strInstructions;

  ingredientList.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      const li = document.createElement("li");
      li.textContent = `${ingredient} - ${measure}`;
      ingredientList.appendChild(li);
    }
  }

  const favourites = getFavourites();
  const isFavourite = favourites.some(fav => fav.idMeal === meal.idMeal);
  favouriteBtn.textContent = isFavourite ? "❤️ Remove from Favourites" : "⭐ Add to Favourites";

  popup.classList.remove("hidden");
}

closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

favouriteBtn.addEventListener("click", () => {
  if (!currentMeal) return;
  let favourites = getFavourites();
  const exists = favourites.find(fav => fav.idMeal === currentMeal.idMeal);

  if (exists) {
    favourites = favourites.filter(fav => fav.idMeal !== currentMeal.idMeal);
    favouriteBtn.textContent = "⭐ Add to Favourites";
    alert("Removed from favourites!");
  } else {
    favourites.push(currentMeal);
    favouriteBtn.textContent = "❤️ Remove from Favourites";
    alert("Added to favourites!");
  }
  localStorage.setItem("favouriteRecipes", JSON.stringify(favourites));
});

viewFavBtn.addEventListener("click", () => {
  const favourites = getFavourites();
  if (favourites.length === 0) {
    recipesDiv.innerHTML = "<p>You have no favourites yet!</p>";
    return;
  }
  showingFavourites = true;
  displayRecipes(favourites);
});

function getFavourites() {
  return JSON.parse(localStorage.getItem("favouriteRecipes")) || [];
}

window.addEventListener("load", () => {
  const favourites = getFavourites();
  if (favourites.length > 0) displayRecipes(favourites);
});
