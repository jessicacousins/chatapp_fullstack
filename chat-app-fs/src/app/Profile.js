import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const Profile = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    email: "",
    password: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:3500/user-profile/${currentUser.email}`)
        .then((response) => {
          if (response.data.profile) {
            setProfile(response.data.profile);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch profile", error);
          setError("Failed to fetch profile");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3500/user-profile", {
        email: currentUser.email,
        profile,
      });
      setSuccess("Profile updated successfully");
    } catch (error) {
      setError("Failed to update profile");
      console.error("Failed to update profile", error);
    }
  };

  const handleBackToChatrooms = () => {
    router.push("/");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileHeader}>Your Profile</h1>
      <form className={styles.profileForm} onSubmit={handleSubmit}>
        <div className={styles.profileField}>
          <label className={styles.label}>First Name:</label>
          <span className={styles.profileText}>{profile.firstName}</span>
          <input
            type="text"
            name="firstName"
            className={styles.input}
            value={profile.firstName}
            onChange={handleChange}
            placeholder="First Name"
            autoComplete="given-name"
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.label}>Last Name:</label>
          <span className={styles.profileText}>{profile.lastName}</span>
          <input
            type="text"
            name="lastName"
            className={styles.input}
            value={profile.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            autoComplete="family-name"
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.label}>Phone Number:</label>
          <span className={styles.profileText}>{profile.phoneNumber}</span>
          <input
            type="tel"
            name="phoneNumber"
            className={styles.input}
            value={profile.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            autoComplete="tel"
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.label}>Address:</label>
          <span className={styles.profileText}>{profile.address}</span>
          <input
            type="text"
            name="address"
            className={styles.input}
            value={profile.address}
            onChange={handleChange}
            placeholder="Address"
            autoComplete="street-address"
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.label}>Email:</label>
          <span className={styles.profileText}>{profile.email}</span>
          <input
            type="email"
            name="email"
            className={styles.input}
            value={profile.email}
            onChange={handleChange}
            placeholder="Email"
            autoComplete="email"
            readOnly
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.label}>Password:</label>
          <input
            type="password"
            name="password"
            className={styles.input}
            value={profile.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            className={styles.input}
            value={profile.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            autoComplete="new-password"
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.label}>Profile Picture URL:</label>
          <span className={styles.profileText}>
            {profile.profilePicture && (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className={styles.profileImage}
              />
            )}
          </span>
          <input
            type="url"
            name="profilePicture"
            className={styles.input}
            value={profile.profilePicture}
            onChange={handleChange}
            placeholder="Profile Picture URL"
            autoComplete="url"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <button type="submit" className={styles.button}>
          Update Profile
        </button>
      </form>
      <button
        type="button"
        className={styles.button}
        onClick={handleBackToChatrooms}
      >
        Back to Chatrooms
      </button>
    </div>
  );
};

export default Profile;
