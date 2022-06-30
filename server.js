const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.redirect(`/${uuidV4()}`);
});
app.get("/:room", function (req, res) {
    res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.emit("message", "Welcome to VCall! Enjoy your stay");
    socket.on("join-room", (roomId, userId) => {
        // console.log(roomId, userId);
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
        socket.to(roomId).emit("message", "A user joined room");
        socket.on("sendMessage", (msg) => {
            io.emit("message", msg);
        });
        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
            io.emit("message", "User disconnected");
        });
    });
});

server.listen(3000);
