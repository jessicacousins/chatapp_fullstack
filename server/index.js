import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
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
const activeRooms = new Map([
  ["general", new Set()],
  ["nightowls", new Set()],
  ["hobbies", new Set()],
]);

function getUser(socketId) {
  return users.get(socketId);
}

function joinUser(socketId, name, room) {
  const color = getRandomColor();
  const user = { id: socketId, name, room, color };
  users.set(socketId, user);
  if (!activeRooms.has(room)) {
    activeRooms.set(room, new Set());
  }
  activeRooms.get(room).add(socketId);
  return user;
}

function leaveUser(socketId) {
  const user = users.get(socketId);
  if (user) {
    const { room } = user;
    users.delete(socketId);
    const roomUsers = activeRooms.get(room);
    if (roomUsers) {
      roomUsers.delete(socketId);
      if (
        roomUsers.size === 0 &&
        !["general", "nightowls", "hobbies"].includes(room)
      ) {
        activeRooms.delete(room);
      }
    }
  }
}

function getUsersInRoom(room) {
  return Array.from(users.values()).filter((user) => user.room === room);
}

function getRandomColor() {
  const random = () => Math.floor(Math.random() * 256);
  return `rgb(${random()}, ${random()}, ${random()})`;
}

app.get("/active-chatrooms", (req, res) => {
  const activeRoomsList = Array.from(activeRooms.keys());
  res.json({ activeRooms: activeRoomsList });
});

app.post("/user-profile", async (req, res) => {
  const { email, profile } = req.body;
  try {
    const usersCollection = db.collection("users");
    await usersCollection.updateOne(
      { email },
      { $set: { profile } },
      { upsert: true }
    );
    res.status(200).send("Profile updated successfully");
  } catch (error) {
    console.error("Failed to update profile", error);
    res.status(500).send("Failed to update profile");
  }
});

app.get("/user-profile/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });
    if (user) {
      res.json({ profile: user.profile });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Failed to fetch profile", error);
    res.status(500).send("Failed to fetch profile");
  }
});

app.get("/direct-messages/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;
  try {
    const directMessagesCollection = db.collection("directMessages");
    const messages = await directMessagesCollection
      .find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch direct messages", error);
    res.status(500).send("Failed to fetch direct messages");
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("joinRoom", async ({ name, room }) => {
    const user = joinUser(socket.id, name, room);
    socket.join(room);

    try {
      const usersCollection = db.collection("users");
      await usersCollection.insertOne(user);
      console.log("User saved to MongoDB");
    } catch (error) {
      console.error("Failed to save user to MongoDB", error);
    }

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

    io.to(room).emit("userList", {
      users: getUsersInRoom(room).map((user) => ({
        name: user.name,
        color: user.color,
      })),
    });

    io.emit("chatroomsUpdate", { activeRooms: Array.from(activeRooms.keys()) });
  });

  socket.on("sendMessage", ({ message, name, room }) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(room).emit("message", { name, text: message, color: user.color });
    }
  });

  socket.on("sendDirectMessage", async ({ sender, receiver, message }) => {
    try {
      const usersCollection = db.collection("users");
      const receiverUser = await usersCollection.findOne({ email: receiver });
      if (receiverUser) {
        io.to(receiverUser.socketId).emit("directMessage", {
          sender,
          message,
        });
        const directMessagesCollection = db.collection("directMessages");
        await directMessagesCollection.insertOne({
          sender,
          receiver,
          message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Failed to send direct message", error);
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

      io.emit("chatroomsUpdate", {
        activeRooms: Array.from(activeRooms.keys()),
      });
    }
  });
});
