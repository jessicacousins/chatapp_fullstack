"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./useAuth";
import Login from "./login";
import Signup from "./signup";
import Home from "./Home";
import Profile from "./Profile";
import styles from "./page.module.css";

let socket;

export default function Page() {
  const { currentUser, logout, loading } = useAuth();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [activity, setActivity] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [inRoom, setInRoom] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [currentTab, setCurrentTab] = useState(null);
  const [view, setView] = useState("home");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (currentUser) {
      socket = io("http://localhost:3500");
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
      socket.emit("sendMessage", { name, message, room: currentTab });
      setMessage("");
    }
  };

  const joinRoom = (username, chatroom) => {
    if (username && chatroom && currentUser) {
      setName(username);
      setRoom(chatroom);
      socket.emit("joinRoom", { name: username, room: chatroom });
      setInRoom(true);
      if (!tabs.includes(chatroom)) {
        setTabs([...tabs, chatroom]);
        setCurrentTab(chatroom);
      }
    }
  };

  const switchTab = (room) => {
    setCurrentTab(room);
    socket.emit("joinRoom", { name, room });
  };

  const closeTab = (room) => {
    setTabs(tabs.filter((tab) => tab !== room));
    if (currentTab === room && tabs.length > 1) {
      setCurrentTab(tabs.find((tab) => tab !== room));
    } else if (tabs.length === 1) {
      setCurrentTab(null);
      setInRoom(false);
    }
  };

  const leaveChatroom = () => {
    setInRoom(false);
    setCurrentTab(null);
    socket.emit("leaveRoom", { name, room });
  };

  const toggleUsersDisplay = () => setShowUsers(!showUsers);

  const navigateToProfile = () => {
    setView("profile");
  };

  const navigateToHome = () => {
    setView("home");
  };

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "login" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("login")}
          >
            Login
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "signup" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("signup")}
          >
            Signup
          </button>
        </div>
        <div className={styles["form-container"]}>
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    );
  }

  if (view === "profile") {
    return <Profile onBackToHome={navigateToHome} />;
  }

  if (!inRoom) {
    return <Home onJoinRoom={joinRoom} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`${styles.tab} ${
              currentTab === tab ? styles.activeTab : ""
            }`}
          >
            <span onClick={() => switchTab(tab)}>{tab}</span>
            <button onClick={() => closeTab(tab)}>x</button>
          </div>
        ))}
      </div>
      <div className={styles.chatroomContainer}>
        <div className={styles.welcome}>
          Welcome to the {currentTab} Chatroom!
        </div>
        <ul className={styles.chatDisplay}>
          {messages.map((m, index) => (
            <li
              key={index}
              className={styles.messageItem}
              style={{ color: m.color }}
            >
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
        <button className={styles.button} onClick={leaveChatroom}>
          Leave Chatroom
        </button>
        <button className={styles.button} onClick={navigateToProfile}>
          Profile
        </button>
      </div>
    </div>
  );
}
