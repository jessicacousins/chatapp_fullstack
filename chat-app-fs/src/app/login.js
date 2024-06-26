import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "./useAuth";
import { auth } from "./firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import styles from "./page.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithGoogle, loginWithApple } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <form className={styles.form} onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Login
        </button>
      </form>
      <button onClick={loginWithGoogle} className={styles.socialButton}>
        <FcGoogle className={styles.icon} /> Sign in with Google
      </button>
      <button onClick={loginWithApple} className={styles.socialButton}>
        <FaApple className={styles.icon} /> Sign in with Apple
      </button>
    </div>
  );
}
