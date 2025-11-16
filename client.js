const socket = io({ transports: ["websocket"] });

let mode = "multi";

const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");
const multiBtn = document.getElementById("multiBtn");
const aiBtn = document.getElementById("aiBtn");
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// 🔊 SOUND
const msgSound = new Audio("notification.mp3");  // apni file daalna

joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Naam daal");

    socket.emit("join", name);
    usernameInput.disabled = true;
    joinBtn.disabled = true;
};

multiBtn.onclick = () => {
    mode = "multi";
    multiBtn.classList.add("active");
    aiBtn.classList.remove("active");
};

aiBtn.onclick = () => {
    mode = "ai";
    aiBtn.classList.add("active");
    multiBtn.classList.remove("active");
};

sendBtn.onclick = send;
msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
});

function send() {
    const msg = msgInput.value.trim();
    if (!msg) return;

    addMessage("You", msg, "user");

    // outgoing sound
    playSound();

    if (mode === "multi") {
        socket.emit("chat_message", msg);
    } else {
        socket.emit("ai_query", msg);
    }

    msgInput.value = "";
}

// system message
socket.on("system_message", (msg) => {
    addMessage("System", msg, "system");
});

// incoming message
socket.on("chat_message", (data) => {
    addMessage(data.from, data.text, "remote");
    playSound();
});

// ai response
socket.on("ai_response", (data) => {
    addMessage("AI", data.text, "bot");
    playSound();
});

// ADD MESSAGE FUNCTION WITH AUTO SCROLL + ANIMATION
function addMessage(from, text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;

    div.innerHTML = `<strong>${from}:</strong> ${text}`;

    // animation
    div.style.opacity = 0;
    div.style.transform = "translateY(5px)";
    setTimeout(() => {
        div.style.transition = "0.25s";
        div.style.opacity = 1;
        div.style.transform = "translateY(0)";
    }, 10);

    chatBox.appendChild(div);

    // auto scroll always
    chatBox.scrollTop = chatBox.scrollHeight;
}

function playSound() {
    msgSound.currentTime = 0;
    msgSound.play().catch(() => { });
}
