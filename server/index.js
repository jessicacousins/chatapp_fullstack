import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3500;

const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

mongoClient
  .connect()
  .then((client) => {
    db = client.db();
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

const users = new Map();

function getUser(socketId) {
  return users.get(socketId);
}

function joinUser(socketId, name, room) {
  const color = getRandomColor();
  const user = { id: socketId, name, room, color };
  users.set(socketId, user);
  return user;
}

function leaveUser(socketId) {
  return users.delete(socketId);
}

function getUsersInRoom(room) {
  return Array.from(users.values()).filter((user) => user.room === room);
}

function getRandomColor() {
  const random = () => Math.floor(Math.random() * 256);
  return `rgb(${random()}, ${random()}, ${random()})`;
}

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("joinRoom", async ({ name, room }) => {
    const user = joinUser(socket.id, name, room);
    socket.join(room);

    // note: save the user to MongoDB here
    try {
      const usersCollection = db.collection("users");
      await usersCollection.insertOne(user);
      console.log("User saved to MongoDB");
    } catch (error) {
      console.error("Failed to save user to MongoDB", error);
    }

    // welcome messages here
    const welcomeMsg = {
      name: "Admin",
      text: `Welcome ${name} to ${room}!`,
      color: "#FFFFFF",
    };
    socket.emit("message", welcomeMsg);
    socket.to(room).emit("message", {
      name: "Admin",
      text: `${name} has joined the room!`,
      color: "#FFFFFF",
    });

    // update user list in room here
    io.to(room).emit("userList", {
      users: getUsersInRoom(room).map((user) => ({
        name: user.name,
        color: user.color,
      })),
    });
  });

  socket.on("sendMessage", ({ message, name, room }) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(room).emit("message", { name, text: message, color: user.color });
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      leaveUser(socket.id);
      io.to(user.room).emit("message", {
        name: "Admin",
        text: `${user.name} has left the room.`,
        color: "#FFFFFF",
      });
      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room).map((user) => ({
          name: user.name,
          color: user.color,
        })),
      });
    }
  });
});
