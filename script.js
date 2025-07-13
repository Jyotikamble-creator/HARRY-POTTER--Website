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

    async function fetchCharacterData(characterName) {
        const url = `https://hp-api.onrender.com/api/characters`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let characterData = data.find(c => c.name.toLowerCase() === characterName.toLowerCase());
            if (!characterData) {
                characterData = data.find(c => c.name.toLowerCase().includes(characterName.toLowerCase()))

            }
            return characterData || null;

        } catch (error) {
            console.error("Fetch error:", error.message);
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






