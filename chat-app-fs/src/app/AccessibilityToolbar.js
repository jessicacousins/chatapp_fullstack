import { useState } from "react";
import styles from "./accessibilityToolbar.module.css";
import { toggleGrayscale, toggleHighContrast } from "./accessibilityUtils";

const AccessibilityToolbar = () => {
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);

  const toggleToolbar = () => {
    setIsToolbarOpen(!isToolbarOpen);
  };

  return (
    <div
      className={`${styles.accessibilityToolbar} ${
        isToolbarOpen ? styles.open : ""
      }`}
    >
      <button onClick={toggleToolbar} className={styles.toolbarButton}>
        Accessibility Tools
      </button>
      <ul className={styles.toolbarList}>
        <li>
          <button onClick={() => (document.body.style.fontSize = "larger")}>
            Increase Text
          </button>
        </li>
        <li>
          <button onClick={() => (document.body.style.fontSize = "smaller")}>
            Decrease Text
          </button>
        </li>
        <li>
          <button onClick={toggleGrayscale}>Grayscale</button>
        </li>
        <li>
          <button onClick={toggleHighContrast}>High Contrast</button>
        </li>
      </ul>
    </div>
  );
};

export default AccessibilityToolbar;
