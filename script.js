document.addEventListener("DOMContentLoaded", () => {
    const characterInput = document.getElementById("character-input");
    const getCharacterBtn = document.getElementById("get-character-btn");
    const characterInfo = document.getElementById("character-info");
    const characterImage = document.getElementById("character-image");
    const characterNameDisplay = document.getElementById("character-name");
    const houseDisplay = document.getElementById("house");
    const yearOfBirthDisplay = document.getElementById("yearofbirth");
    const wandDisplay = document.getElementById("wand");
    const errorMessage = document.getElementById("error-message");
    const searchHistoryList = document.getElementById("search-history");

    // Load previous searches on page load
    loadPreviousSearches();

    getCharacterBtn.addEventListener("click", async () => {
        const character = characterInput.value.trim();
        if (!character) {
            showError("Please enter a character name.");
            return;
        }

        try {
            const characterData = await fetchCharacterData(character);
            if (characterData) {
                displayCharacterData(characterData);
                saveSearch(character);
            } else {
                showError("Character not found. Try again.");
            }
        } catch (error) {
            showError("Failed to fetch data. Please check your connection.");
        }
    });

    // fetching the data from the url
    async function fetchCharacterData(characterName) {
        const url = `https://hp-api.onrender.com/api/characters`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            return data.find(c => c.name.toLowerCase() === characterName.toLowerCase()) || null;
        } catch (error) {
            console.error("Error fetching character data:", error);
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
        wandDisplay.textContent = `Wand: ${wand.wood} wood, ${wand.core} core, `;

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

    // updateting the data
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
