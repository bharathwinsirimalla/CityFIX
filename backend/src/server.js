import "./config/env.js";
import http from "http";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Invalid token user"));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  const role = socket.user.role;

  socket.join(`user:${userId}`);
  socket.join(`role:${role}`);

  console.log("Socket connected", socket.id, userId, role);

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });
});

app.set("io", io);

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

