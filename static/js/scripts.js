const chatHistory = [];
const characterContext = {
    jenkins: {name: "Jenkins", book: "City by Clifford Simak"},
    genly_ai: {name: "Genly Ai", book: "The Left Hand of Darkness by Usula K. Le Guin"},
    margorie_prime: {name: "Margorie Prime", book: "Margorie Prime by Jordan Harrison"},
    kirsten: {name: "Kirsten", book: "Station Eleven by Emily St. John Mandel"}
};

document.getElementById("send-btn").addEventListener("click", async function() {
    const characterSelect = document.getElementById("character-select");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    const characterVal = characterSelect.value;
    const characterInfo = characterContext[characterVal];
    character = characterInfo['name'];
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
    userMessageElement.textContent = `You: ${userMessage}`;
    chatBox.appendChild(userMessageElement);

    // Fetch character response
    const requestBody = new FormData();
    requestBody.append("character", character);
    requestBody.append("character_info", JSON.stringify(characterInfo));
    requestBody.append("chat_history", JSON.stringify(chatHistory));

    const response = await fetch("/chat", {
        method: "POST",
        body: requestBody
    });
    const jsonResponse = await response.json();
    const characterMessage = jsonResponse.response;

    // Display character response
    const characterMessageElement = document.createElement("div");
    characterMessageElement.className = "message";
    characterMessageElement.textContent = `${character}: ${characterMessage}`;
    chatBox.appendChild(characterMessageElement);

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
});

function clearChatData() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    chatHistory.length = 0;
}