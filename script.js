document.addEventListener("DOMContentLoaded", () => {
  const characterInput = document.getElementById("character-input");
  const suggestionsList = document.getElementById("suggestions-list");
  const getCharacterBtn = document.getElementById("get-character-btn");
  const characterInfo = document.getElementById("character-info");
  const characterImage = document.getElementById("character-image");
  const characterNameDisplay = document.getElementById("character-name");
  const houseDisplay = document.getElementById("house");
  const yearOfBirthDisplay = document.getElementById("yearofbirth");
  const wandDisplay = document.getElementById("wand");
  const errorMessage = document.getElementById("error-message");
  const searchHistoryList = document.getElementById("search-history");
  const toggleHistory = document.getElementById("toggle-history");

  let allCharacters = [];

  // Fetch all characters once
  fetch("https://hp-api.onrender.com/api/characters")
    .then(res => res.json())
    .then(data => {
      allCharacters = data;
    });

  function showError(message) {
    characterInfo.classList.add("hidden");
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = message;
  }

  function displayCharacter(data) {
    characterImage.src = data.image || "";
    characterImage.style.display = data.image ? "block" : "none";
    characterNameDisplay.textContent = `Name: ${data.name}`;
    houseDisplay.textContent = `House: ${data.house}`;
    yearOfBirthDisplay.textContent = `Year of Birth: ${data.yearOfBirth}`;
    wandDisplay.textContent = `Wand: ${data.wand.wood || "Unknown"} wood, ${data.wand.core || "Unknown"} core`;

    characterInfo.classList.remove("hidden");
    errorMessage.classList.add("hidden");
  }

  async function fetchCharacter(name) {
    const data = allCharacters;

    // Exact
    let match = data.find(c => c.name.toLowerCase() === name.toLowerCase());

    // Partial
    if (!match) {
      match = data.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    }

    // Fuzzy
    if (!match) {
      let minDist = Infinity;
      let closest = null;

      for (const c of data) {
        const dist = getLevenshteinDistance(c.name.toLowerCase(), name.toLowerCase());
        if (dist < minDist) {
          minDist = dist;
          closest = c;
        }
      }

      if (minDist <= 3) match = closest;
    }

    return match || null;
  }

  getCharacterBtn.addEventListener("click", async () => {
    const name = characterInput.value.trim();
    if (!name) return showError("Please enter a character name.");

    getCharacterBtn.disabled = true;
    getCharacterBtn.textContent = "Loading...";

    const character = await fetchCharacter(name);
    if (character) {
      displayCharacter(character);
      saveSearch(name);
    } else {
      showError("Character not found.");
    }

    getCharacterBtn.disabled = false;
    getCharacterBtn.textContent = "Get Character";
  });

  // Suggestions
  characterInput.addEventListener("input", () => {
    const query = characterInput.value.trim().toLowerCase();
    if (!query) return suggestionsList.classList.add("hidden");

    const matches = allCharacters
      .filter(c => c.name.toLowerCase().includes(query))
      .slice(0, 5);

    suggestionsList.innerHTML = "";
    matches.forEach(c => {
      const li = document.createElement("li");
      li.textContent = c.name;
      li.addEventListener("click", () => {
        characterInput.value = c.name;
        suggestionsList.classList.add("hidden");
        getCharacterBtn.click();
      });
      suggestionsList.appendChild(li);
    });

    suggestionsList.classList.remove("hidden");
  });

  // History
  function saveSearch(name) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!history.includes(name)) {
      history.push(name);
      localStorage.setItem("searchHistory", JSON.stringify(history));
      updateHistory();
    }
  }

  function updateHistory() {
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistoryList.innerHTML = "";
    history.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      li.addEventListener("click", () => {
        characterInput.value = name;
        getCharacterBtn.click();
      });
      searchHistoryList.appendChild(li);
    });
  }

  toggleHistory.addEventListener("click", () => {
    const isHidden = searchHistoryList.classList.toggle("hidden");
    toggleHistory.textContent = `Previous Searches ${isHidden ? "➡️" : "⬇️"}`;
  });

  updateHistory();

  // Levenshtein Distance
  function getLevenshteinDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    return dp[a.length][b.length];
  }
});
