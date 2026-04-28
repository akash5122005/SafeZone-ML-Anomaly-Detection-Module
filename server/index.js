require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const alertRoutes = require("./routes/alerts");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://safezone.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/alerts", alertRoutes);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
