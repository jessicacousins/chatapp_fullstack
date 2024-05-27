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
import axios from "axios";
import styles from "./page.module.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await axios.post("http://localhost:3500/user-profile", {
        email: user.email,
        profile: {
          firstName,
          lastName,
          phoneNumber,
          address,
          email: user.email,
          password,
          profilePicture,
        },
      });
      setSuccess("Account created and profile saved");
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError("Failed to create account");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await axios.post("http://localhost:3500/user-profile", {
        email: user.email,
        profile: {
          firstName: "",
          lastName: "",
          phoneNumber: "",
          address: "",
          email: user.email,
          password: "",
          profilePicture: "",
        },
      });
      setSuccess("Google sign-in success");
    } catch (error) {
      console.error("Google sign-in error:", error.message);
      setError("Failed to sign in with Google");
    }
  };

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await axios.post("http://localhost:3500/user-profile", {
        email: user.email,
        profile: {
          firstName: "",
          lastName: "",
          phoneNumber: "",
          address: "",
          email: user.email,
          password: "",
          profilePicture: "",
        },
      });
      setSuccess("Apple sign-in success");
    } catch (error) {
      console.error("Apple sign-in error:", error.message);
      setError("Failed to sign in with Apple");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <form className={styles.form} onSubmit={handleSignup}>
        <div className={styles.appName}>Swan</div>
        <input
          type="text"
          className={styles.input}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          className={styles.input}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          required
        />
        <input
          type="tel"
          className={styles.input}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
          required
        />
        <input
          type="text"
          className={styles.input}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
        />
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
        <input
          type="password"
          className={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <input
          type="url"
          className={styles.input}
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          placeholder="Profile Picture URL"
        />
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
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
