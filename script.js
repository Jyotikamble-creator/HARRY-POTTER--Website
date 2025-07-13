document.addEventListener("DOMContentLoaded", () => {
    const characterInput = document.getElementById("character-input");
    const getCharacterBtn = document.getElementById("get-character-btn");
    const characterInfo = document.getElementById("character-info");
    const characterImage = document.getElementById("character-image");
    const characterNameDisplay = document.getElementById("character-name");
    const houseDisplay = document.getElementById("house");
    const yearOfBirthDisplay = document.getElementById("yearofbirth");
    const wandWoodDisplay = document.getElementById("wand");
    const wandCoreDisplay = document.getElementById("wand-core");
    const errorMessage = document.getElementById("error-message");
    const searchHistoryList = document.getElementById("search-history");

    // Load previous searches on page load
    loadPreviousSearches();

    getCharacterBtn.addEventListener("click", async () => {
        getCharacterBtn.disabled = true;
        getCharacterBtn.textContent = "Loading...";

        const character = characterInput.value.trim();
        if (!character) {
            showError("Please enter a character name.");
            resetButton();
            return;
        }

        const characterData = await fetchCharacterData(character);
        if (characterData) {
            displayCharacterData(characterData);
            saveSearch(character);
        } else {
            showError("Character not found or API error.");
        }

        resetButton();
    });

    function resetButton() {
        getCharacterBtn.disabled = false;
        getCharacterBtn.textContent = "Get Character";
    }


    // Levenshtein Distance function
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

    // Character data fetching with fuzzy matching
    async function fetchCharacterData(characterName) {
        const url = `https://hp-api.onrender.com/api/characters`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();

            // Exact match
            let match = data.find(c => c.name.toLowerCase() === characterName.toLowerCase());

            // Partial match
            if (!match) {
                match = data.find(c => c.name.toLowerCase().includes(characterName.toLowerCase()));
            }

            // Fuzzy match
            if (!match) {
                let minDistance = Infinity;
                let closestMatch = null;
                for (const c of data) {
                    const dist = getLevenshteinDistance(c.name.toLowerCase(), characterName.toLowerCase());
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestMatch = c;
                    }
                }
                if (minDistance <= 3) {
                    match = closestMatch;
                }
            }

            return match || null;

        } catch (error) {
            console.error("Fetch error:", error);
            return null;
        }
    }

    // displaying the data on the webpage
    function displayCharacterData(data) {
        console.log("Character Data:", data);
        const { name, house, yearOfBirth, wand, image } = data;

        characterNameDisplay.textContent = `Name: ${name || ""}`;
        houseDisplay.textContent = `House: ${house}`;
        yearOfBirthDisplay.textContent = `Year of Birth: ${yearOfBirth}`;
        wandWoodDisplay.textContent = `Wand: ${wand.wood || "unknown"} wood, ${wand.core || "unknown"} core`;


        // Show character image (if available)
        if (image) {
            characterImage.src = image;
            characterImage.style.display = "block";
        } else {
            characterImage.style.display = "none";
        }

        characterInfo.style.display = "block";
        errorMessage.style.display = "none";
    }

    // display the error-message
    function showError(message) {
        characterInfo.style.display = "none";
        errorMessage.style.display = "block";
        errorMessage.textContent = message;
    }

    // saving the data in the history
    function saveSearch(character) {
        let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];

        if (!searches.includes(character)) {
            searches.push(character);
            localStorage.setItem("searchHistory", JSON.stringify(searches));
            updateSearchHistory();
        }
    }

    function loadPreviousSearches() {
        updateSearchHistory();
    }

    // updating the data
    function updateSearchHistory() {
        let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
        searchHistoryList.innerHTML = "";

        searches.forEach(character => {
            const listItem = document.createElement("li");
            listItem.textContent = character;
            listItem.addEventListener("click", () => {
                characterInput.value = character;
                getCharacterBtn.click();
            });
            searchHistoryList.appendChild(listItem);
        });
    }

});









