import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./useAuth";
import styles from "./DirectMessages.module.css";

const DirectMessages = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  useEffect(() => {
    if (currentUser) {
      const socket = io("http://localhost:3500");
      socket.on("directMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("directMessage");
        socket.disconnect();
      };
    }
  }, [currentUser]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage && recipient) {
      const socket = io("http://localhost:3500");
      socket.emit("sendDirectMessage", {
        sender: currentUser.email,
        receiver: recipient,
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Direct Messages</h2>
      <input
        className={styles.input}
        type="text"
        placeholder="Recipient's email"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <textarea
        className={styles.textarea}
        placeholder="Type your message here..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.sender}: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DirectMessages;
