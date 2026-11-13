const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const clientPath = path.join(__dirname, "../client");

app.use(express.static(clientPath));
app.use("/vendor/three", express.static(path.join(__dirname, "../node_modules/three")));

app.get("/", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`PVT is running at http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop the server.");
});