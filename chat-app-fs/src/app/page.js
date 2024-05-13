"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./useAuth";
import Login from "./login.js";
import Signup from "./signup.js";
import styles from "./page.module.css";

let socket;

export default function Page() {
  const { currentUser, logout, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [activity, setActivity] = useState("");
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    if (currentUser) {
      socket = io("ws://localhost:3500");
      socket.on("message", (message) =>
        setMessages((msgs) => [...msgs, message])
      );
      socket.on("userList", (data) => setUsersInRoom(data.users));
      socket.on("activity", (data) => {
        setActivity(`${data.name} is typing...`);
        setTimeout(() => setActivity(""), 3000);
      });

      return () => {
        socket.off("message");
        socket.off("userList");
        socket.off("activity");
        socket.disconnect();
      };
    }
  }, [currentUser]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message && currentUser) {
      socket.emit("sendMessage", { name, message, room });
      setMessage("");
    }
  };

  const joinRoom = (event) => {
    event.preventDefault();
    if (name && room && currentUser) {
      socket.emit("joinRoom", { name, room });
    }
  };

  const toggleUsersDisplay = () => setShowUsers(!showUsers);

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return (
      <main>
        {showSignup ? <Signup /> : <Login />}
        <button
          className={styles.slBtn}
          onClick={() => setShowSignup(!showSignup)}
        >
          {showSignup
            ? "Have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.welcome}>Welcome to the Chatroom!</div>
      <form className={styles.form} onSubmit={joinRoom}>
        <input
          className={styles.input1}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter User Name..."
          required
        />
        <input
          className={styles.input2}
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter Chat Room..."
          required
        />
        <button className={styles.button} type="submit">
          Join
        </button>
      </form>
      <ul className={styles.chatDisplay}>
        {messages.map((m, index) => (
          <li key={index} style={{ color: m.color }}>
            {m.name}: {m.text}
          </li>
        ))}
      </ul>
      <button className={styles.toggleButton} onClick={toggleUsersDisplay}>
        {showUsers ? "Hide Users" : "Show Users"}
      </button>
      {showUsers && (
        <div className={styles.userList}>
          <strong>Users in Room:</strong>
          {usersInRoom.map((user, index) => (
            <span key={index} style={{ color: user.color }}>
              {user.name}
            </span>
          ))}
        </div>
      )}
      <p className={styles.activity}>{activity}</p>
      <form className={styles.form} onSubmit={sendMessage}>
        <textarea
          className={styles.input3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message here"
          required
          rows="3"
          wrap="soft"
        />
        <button className={styles.button2} type="submit">
          Send
        </button>
      </form>
      <button className={styles.button} onClick={logout}>
        Logout
      </button>
    </main>
  );
}
