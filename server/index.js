
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Models
const Role = require("./models/Role");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamRoutes = require("./routes/teamRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const venueRoutes = require("./routes/venueRoutes");
const eventTypeRoutes = require("./routes/eventTypeRoutes");
const roleRoutes = require("./routes/roleRoutes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://fd-group-58-mirror.vercel.app",
];

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/event-types", eventTypeRoutes);

// Database Connection
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("Connected to MongoDB Atlas");

      // Role Seeding Logic
      const rolesToCreate = ["admin", "organizer", "member"];
      for (const roleName of rolesToCreate) {
        const exists = await Role.findOne({ name: roleName });
        if (!exists) {
          await Role.create({ name: roleName });
          console.log(`Role '${roleName}' created!`);
        }
      }
      console.log("Database seeding check complete.");
    })
    .catch((err) => console.error("MongoDB error:", err));
}

module.exports = app;

// Start Server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}