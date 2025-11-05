// ====== PALETTE GENERATOR ======
const generateBtn = document.getElementById("generate-btn");
// const similarBtn = document.getElementById("similar-btn");
const paletteContainer = document.querySelector(".palette-container");
const colorInput = document.getElementById("color-input");
const searchBtn = document.getElementById("search-btn");

let searchedColor = null; // store color from search

// --- Search feature ---
searchBtn.addEventListener("click", () => {
  const input = colorInput.value.trim();
  if (!input) {
    alert("Please enter a color name or hex code!");
    return;
  }

  // Try to convert color name or hex
  const tempDiv = document.createElement("div");
  tempDiv.style.color = input;
  document.body.appendChild(tempDiv);
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  if (computedColor === "rgb(0, 0, 0)" && input.toLowerCase() !== "black") {
    alert("Invalid color name or hex!");
    return;
  }

  searchedColor = rgbToHex(computedColor);
  const colors = generateSimilarColors(searchedColor, 5);
  updatePaletteDisplay(colors);
  showMessage(`🎨 Showing colors similar to ${searchedColor}`);
});

// Allow pressing Enter in search box
colorInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
  }
});

// --- Main buttons ---
generateBtn.addEventListener("click", generatePalette);

// --- Copy to clipboard ---
paletteContainer.addEventListener("click", function (e) {
  const copyBtn = e.target.closest(".copy-btn");
  if (!copyBtn) return;

  const hexValueElement = copyBtn.previousElementSibling;
  if (!hexValueElement) return;

  const hexValue = hexValueElement.textContent;
  navigator.clipboard.writeText(hexValue)
    .then(() => {
      const originalClass = copyBtn.className;
      copyBtn.className = "far fa-check copy-btn";
      copyBtn.style.transform = "translateX(5px) scale(1.2)";

      setTimeout(() => {
        copyBtn.className = originalClass;
        copyBtn.style.transform = "none";
      }, 1000);
    })
    .catch(err => console.error(err));
});

// ====== Generate Random Palette ======
function generatePalette() {
  const colors = [];
  for (let i = 0; i < 5; i++) {
    colors.push(generateRandomColor());
  }
  updatePaletteDisplay(colors);
}

function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// ====== Similar colors ======
function generateSimilarPalette() {
  let baseColor;

  if (searchedColor) {
    baseColor = searchedColor;
  } else {
    const firstColorBox = document.querySelector(".color-box .color");
    if (!firstColorBox) return;
    baseColor = rgbToHex(window.getComputedStyle(firstColorBox).backgroundColor);
  }

  const colors = generateSimilarColors(baseColor, 5);
  updatePaletteDisplay(colors);
}

function generateSimilarColors(baseColor, count) {
  const baseRGB = hexToRgb(baseColor);
  const colors = [];

  for (let i = 0; i < count; i++) {
    const variation = 40;
    const r = clamp(baseRGB.r + randomVariation(variation), 0, 255);
    const g = clamp(baseRGB.g + randomVariation(variation), 0, 255);
    const b = clamp(baseRGB.b + randomVariation(variation), 0, 255);
    colors.push(rgbToHex(`rgb(${r}, ${g}, ${b})`));
  }
  return colors;
}

// --- Update palette display ---
function updatePaletteDisplay(colors) {
  const colorBoxes = document.querySelectorAll(".color-box");

  colorBoxes.forEach((box, index) => {
    const color = colors[index];
    const colorDiv = box.querySelector(".color");
    const hexValue = box.querySelector(".hex-value");

    if (color) {
      colorDiv.style.transition = "background-color 0.5s ease";
      colorDiv.style.backgroundColor = color;
      hexValue.textContent = color;
    }
  });
}

// --- Helpers ---
function randomVariation(v) {
  return Math.floor(Math.random() * v * 2 - v);
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return (
    "#" +
    result
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  ).toUpperCase();
}

// --- Toast message ---
function showMessage(text) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 1500);
}

// ====== RATING SYSTEM ======
const ratingStars = document.querySelectorAll("#rating-stars i");
const ratingResult = document.getElementById("rating-result");
const ratingBar = document.getElementById("rating-bar");
const ratingText = document.getElementById("rating-text");

// --- Initialize ratings ---
let ratings = localStorage.getItem("ratings");
if (!ratings) {
  ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  localStorage.setItem("ratings", JSON.stringify(ratings));
} else {
  ratings = JSON.parse(ratings);
}
updateRatingSummary();

// --- Star click events ---
ratingStars.forEach(star => {
  star.addEventListener("click", () => {
    const value = parseInt(star.getAttribute("data-value"));
    updateStars(value);
    // ratingResult.textContent = `You rated this ${value} star${value > 1 ? "s" : ""}!`;

    ratings[value]++;
    localStorage.setItem("ratings", JSON.stringify(ratings));
    updateRatingSummary();
  });

  star.addEventListener("mouseover", () => {
    highlightStars(parseInt(star.getAttribute("data-value")));
  });

  star.addEventListener("mouseleave", () => {
    const activeStars = document.querySelectorAll("#rating-stars i.active").length;
    highlightStars(activeStars);
  });
});

// --- Star highlight ---
function updateStars(count) {
  ratingStars.forEach((s, i) => {
    s.classList.toggle("active", i < count);
  });
}

function highlightStars(count) {
  ratingStars.forEach((s, i) => {
    s.style.color = i < count ? "#FFD700" : "#ccc";
  });
}

// --- Update summary bar ---
function updateRatingSummary() {
  const totalVotes = Object.values(ratings).reduce((a, b) => a + b, 0);
  const average = totalVotes === 0 ? 0 : (
    (1 * ratings[1] + 2 * ratings[2] + 3 * ratings[3] + 4 * ratings[4] + 5 * ratings[5]) / totalVotes
  );
  const percent = totalVotes === 0 ? 0 : (average / 5 * 100);

  ratingBar.style.width = percent + "%";
  ratingText.textContent = `${totalVotes} vote${totalVotes !== 1 ? "s" : ""} (${percent.toFixed(0)}%)`;
}

// --- RESET BUTTON ---
// const resetBtn = document.createElement("button");
// resetBtn.textContent = "Reset Votes";
// resetBtn.style.marginTop = "10px";
// document.querySelector(".rating-section").appendChild(resetBtn);

// resetBtn.addEventListener("click", () => {
//   ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//   localStorage.setItem("ratings", JSON.stringify(ratings));
//   updateRatingSummary();
//   ratingResult.textContent = "";
// });

