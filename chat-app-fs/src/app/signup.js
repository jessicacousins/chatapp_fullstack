import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import styles from "./page.module.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Account created:", userCredential.user);
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in success:", result.user);
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Apple sign-in success:", result.user);
    } catch (error) {
      console.error("Apple sign-in error:", error.message);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <form className={styles.form} onSubmit={handleSignup}>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className={styles.button}>
          Sign Up
        </button>
      </form>
      <button onClick={handleGoogleSignIn} className={styles.socialButton}>
        <FcGoogle className={styles.icon} /> Sign in with Google
      </button>
      <button onClick={handleAppleSignIn} className={styles.socialButton}>
        <FaApple className={styles.icon} /> Sign in with Apple
      </button>
    </div>
  );
}
