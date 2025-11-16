const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (username) => {
        users[socket.id] = username;
        io.emit("system_message", `${username} joined the chat`);
    });

    socket.on("chat_message", (msg) => {
        const user = users[socket.id];
        io.emit("chat_message", { from: user, text: msg });
    });

    socket.on("ai_query", (msg) => {
        const reply = msg.split("").reverse().join("");
        socket.emit("ai_response", { from: "AI", text: reply });
    });

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            io.emit("system_message", `${user} left the chat`);
            delete users[socket.id];
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
