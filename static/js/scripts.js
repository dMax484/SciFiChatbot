const chatHistory = [];
let characterContext;
loadCharacterContext().then((data) => {
    characterContext = data;
    populateCharacterSelect();
    init();
});

function init(){
    // Before fetching character response, show spinner
    const loadingSpinner = document.getElementById("loading-spinner");

    // initialize character info
    updateCharacterInfo();

    document.getElementById("send-btn").addEventListener("click", async function() {
        loadingSpinner.style.display = "flex";
        const characterSelect = document.getElementById("character-select");
        const userInput = document.getElementById("user-input");
        const chatBox = document.getElementById("chat-box");
        const messagesContainer = document.getElementById("messages-container");

        const characterVal = characterSelect.value;
        const characterInfo = characterContext[characterVal];
        
        const character = characterInfo['name'];
        const userMessage = userInput.value.trim();

        if (userMessage.length === 0) return;

        // Add the user message to the chat history
        chatHistory.push({ role: "User", message: userMessage });

        // Keep the chat history limited to the last 5 messages
        if (chatHistory.length > 5) {
            chatHistory.shift();
        }

        // Display user message
        const userMessageElement = document.createElement("div");
        userMessageElement.className = "message";
        userMessageElement.innerHTML = `<span class="user-message-label">You:</span> ${userMessage}`;
        messagesContainer.appendChild(userMessageElement);

        // Fetch character response
        const requestBody = new FormData();
        requestBody.append("character", character);
        requestBody.append("character_info", JSON.stringify(characterInfo));
        requestBody.append("chat_history", JSON.stringify(chatHistory));

        const response = await fetch("/chat", {
            method: "POST",
            body: requestBody
        });

        // After receiving the response, hide spinner
        loadingSpinner.style.display = "none";

        const jsonResponse = await response.json();
        const characterMessage = jsonResponse.response;

        const characterMessageElement = document.createElement("div");
        characterMessageElement.className = "message";
        characterMessageElement.innerHTML = `<span class="character-message-label">${character}:</span> ${characterMessage}`;
        messagesContainer.appendChild(characterMessageElement);

        // Add character chat to history
        chatHistory.push({ role: character, message: characterMessage });

        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;

        // Clear the input field
        userInput.value = "";
    });


    // Send message when Enter key is pressed
    document.getElementById("user-input").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("send-btn").click();
        }
    });

    // Listen for changes in character select
    document.getElementById("character-select").addEventListener("change", function() {
        clearChatData();
        updateCharacterInfo();
    });

}

async function loadCharacterContext() {
    const response = await fetch('/static/data/characters.json');
    const characterContext = await response.json();
    return characterContext;
  }

function populateCharacterSelect() {
    const characterSelect = document.getElementById("character-select");

    for (const key in characterContext) {
        const characterInfo = characterContext[key];
        const option = document.createElement("option");
        option.value = key;
        option.textContent = characterInfo.name;
        characterSelect.appendChild(option);
    }
}

function updateCharacterInfo() {
    const characterSelect = document.getElementById("character-select");
    const characterVal = characterSelect.value;
    const characterNameElement = document.getElementById("character-name");
    const characterBookElement = document.getElementById("character-book");
    const characterImageElement  = document.getElementById("book-cover");

    const characterInfo = characterContext[characterVal];
    characterNameElement.textContent = characterInfo.name;
    characterBookElement.textContent = characterInfo.book;
    characterImageElement.src = "/static/assets/" + characterInfo.image;
}

function clearChatData() {
    const messagesContainer = document.getElementById("messages-container");
    messagesContainer.innerHTML = "";
    chatHistory.length = 0;
}