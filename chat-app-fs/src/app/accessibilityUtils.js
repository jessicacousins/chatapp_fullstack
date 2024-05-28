export const toggleGrayscale = () => {
  const styleElement = document.getElementById("grayscale-style");
  if (styleElement) {
    styleElement.remove();
  } else {
    const style = document.createElement("style");
    style.id = "grayscale-style";
    style.innerHTML = `
      html, body, * {
        filter: grayscale(100%) !important;
      }
    `;
    document.head.appendChild(style);
  }
};

export const toggleHighContrast = () => {
  const styleElement = document.getElementById("high-contrast-style");
  if (styleElement) {
    styleElement.remove();
  } else {
    const style = document.createElement("style");
    style.id = "high-contrast-style";
    style.innerHTML = `
      html, body, * {
        background: #000 !important;
        color: #fff !important;
        border-color: #fff !important;
      }
    `;
    document.head.appendChild(style);
  }
};
