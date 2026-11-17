const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const clientPath = path.join(__dirname, "../client");

app.use(express.static(clientPath));
app.use("/vendor/three", express.static(path.join(__dirname, "../node_modules/three")));

app.get("/", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});

const players = new Map();

io.on("connection", (socket) => {
    console.log("PVT player connected:", socket.id);

    socket.emit("players:update", Array.from(players.values()));

    socket.on("player:update", (data) => {
        if (!data || !Number.isFinite(data.x) || !Number.isFinite(data.z)) {
            return;
        }

        const player = {
            id: socket.id,
            x: Math.max(-75, Math.min(75, data.x)),
            y: Number.isFinite(data.y) ? Math.max(0, Math.min(20, data.y)) : 0,
            z: Math.max(-75, Math.min(75, data.z)),
            health: Number.isFinite(data.health)
                ? Math.max(0, Math.min(100, data.health))
                : 100,
            operator: typeof data.operator === "string"
                ? data.operator.slice(0, 30)
                : "VANGUARD"
        };

        players.set(socket.id, player);
        io.emit("players:update", Array.from(players.values()));
    });

    socket.on("player:damage", (data) => {
        if (!data || typeof data.id !== "string") return;
        if (!players.has(data.id) || data.id === socket.id) return;

        const amount = Math.max(
            0,
            Math.min(10, Number.isFinite(data.amount) ? data.amount : 10)
        );

        io.to(data.id).emit("player:damaged", {
            amount,
            by: socket.id
        });
    });

    socket.on("disconnect", () => {
        players.delete(socket.id);
        io.emit("players:update", Array.from(players.values()));
        console.log("PVT player disconnected:", socket.id);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`PVT is running at http://localhost:${PORT}`);
    console.log("PVT multiplayer server is enabled.");
});
