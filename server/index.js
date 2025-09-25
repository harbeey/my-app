import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Serve static files from the 'public' directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "public")));

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://stellahime821_db_user:EJVg3jfXFzmY7J1G@pms.02mwxnz.mongodb.net/ayasynch?retryWrites=true&w=majority";
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    try {
      const authRouter = (await import("./routes/auth.js")).default;
      app.use("/api/auth", authRouter);

      // Enable users route for profile functionality
      const usersRouter = (await import("./routes/users.js")).default;
      app.use("/api/users", usersRouter);

      // Enable admin routes
      const adminRouter = (await import("./routes/admin.js")).default;
      app.use("/api/admin", adminRouter);

      // Enable teams routes
      const teamsRouter = (await import("./routes/teams.js")).default;
      app.use("/api/teams", teamsRouter);

      // Enable tasks routes
      const tasksRouter = (await import("./routes/tasks.js")).default;
      app.use("/api/tasks", tasksRouter);
    } catch (err) {
      console.error("Error loading routes:", err);
      throw err; // Re-throw to be caught by the main try-catch
    }

    app.set("io", io);

    app.get("/api/health", (_req, res) => {
      res.json({ ok: true, mongo: true });
    });

    io.on("connection", (socket) => {
      socket.on("register", (userId) => {
        socket.join(`user:${userId}`);
      });

      // Join team board room
      socket.on("joinTeamBoard", (teamId) => {
        socket.join(`teamBoard:${teamId}`);
      });

      // Listen for team creation and broadcast to all clients
      socket.on("team:created", (team) => {
        io.emit("team:created", team); // Broadcast to all clients
      });

      // (Optional) Listen for activity events
      socket.on("activity:new", (activity) => {
        io.emit("activity:new", activity);
      });
    });

    // Connect to MongoDB first, then start the server
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      // No special options needed, mongodb+srv handles TLS by default
    });
    console.log("Connected to MongoDB Atlas");

    httpServer.listen(PORT, () =>
      console.log(`API server listening on http://localhost:${PORT}`)
    );
  } catch (err) {
    if (err.name === "MongooseServerSelectionError") {
      console.error(
        "MongoDB connection error. Please ensure MongoDB is running and the connection URI is correct.",
        err
      );
    } else {
      console.error("Failed to start server", err);
    }
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
