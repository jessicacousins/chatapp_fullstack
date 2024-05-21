import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useAuth } from "./useAuth";
import styles from "./page.module.css";
import Profile from "./Profile";

const Home = ({ onJoinRoom }) => {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [chatroom, setChatroom] = useState("");
  const [chatrooms, setChatrooms] = useState([
    "general",
    "nightowls",
    "hobbies",
  ]);
  const [error, setError] = useState("");
  const [view, setView] = useState("chatrooms");

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3500/active-chatrooms"
        );
        setChatrooms((prevRooms) => [
          ...new Set([...prevRooms, ...response.data.activeRooms]),
        ]);
      } catch (error) {
        console.error("Error fetching chatrooms:", error);
      }
    };

    fetchChatrooms();

    const socket = io("http://localhost:3500");
    socket.on("chatroomsUpdate", (data) => {
      setChatrooms((prevRooms) => [
        ...new Set([...prevRooms, ...data.activeRooms]),
      ]);
    });

    return () => {
      socket.off("chatroomsUpdate");
    };
  }, []);

  const handleJoinRoom = () => {
    if (!username) {
      setError("Username is required");
      return;
    }
    if (username && chatroom) {
      onJoinRoom(username, chatroom);
    }
  };

  const handleJoinRoomFromList = (room) => {
    if (!username) {
      setError("Username is required");
      return;
    }
    onJoinRoom(username, room);
  };

  if (view === "profile") {
    return <Profile />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.welcome}>Join or Create a Chatroom</h1>
      <div className={styles.formContainer}>
        <input
          type="text"
          className={styles.input}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder="Enter your username"
        />
        <input
          type="text"
          className={styles.input}
          value={chatroom}
          onChange={(e) => setChatroom(e.target.value)}
          placeholder="Enter chatroom name"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.button} onClick={handleJoinRoom}>
          Join Chatroom
        </button>
        <button className={styles.button} onClick={() => setView("profile")}>
          Edit Profile
        </button>
      </div>
      <ul className={styles.chatList}>
        {chatrooms.map((room, index) => (
          <li key={index} className={styles.chatItem}>
            <span>{room}</span>
            <button onClick={() => handleJoinRoomFromList(room)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
