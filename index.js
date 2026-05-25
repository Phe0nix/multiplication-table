const form = document.querySelector("#table-form");
const baseInput = document.querySelector("#base-number");
const limitInput = document.querySelector("#limit-number");
const resultNode = document.querySelector("#result");
const messageNode = document.querySelector("#message");
const clearButton = document.querySelector("#clear-button");
const themeToggle = document.querySelector("#theme-toggle");

const LIMIT_MIN = 1;
const LIMIT_MAX = 100;
const THEME_KEY = "multiplication-table-theme";

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
  const isDark = theme === "dark";

  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
};

const resolveInitialTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const showMessage = (text, type) => {
  messageNode.textContent = text;
  messageNode.className = `message show ${type}`;
};

const clearMessage = () => {
  messageNode.textContent = "";
  messageNode.className = "message";
};

const renderHint = () => {
  resultNode.innerHTML = '<p class="hint">Your table will appear here.</p>';
};

const createRows = (base, limit) => {
  const rows = Array.from({ length: limit }, (_, index) => {
    const multiplier = index + 1;
    const value = base * multiplier;

    return `
      <li class="row" style="animation-delay:${index * 30}ms">
        <span class="expression">${base} x ${multiplier}</span>
        <span class="value">${value}</span>
      </li>
    `;
  }).join("");

  return `
    <h2 class="table-head">Table of ${base} up to ${limit}</h2>
    <ol class="rows">${rows}</ol>
  `;
};

const validateInputs = () => {
  const base = Number(baseInput.value);
  const limit = Number(limitInput.value);

  if (!baseInput.value.trim()) {
    return { valid: false, message: "Enter a number to generate a table." };
  }

  if (!Number.isFinite(base)) {
    return { valid: false, message: "Number must be valid, like 5 or 12." };
  }

  if (!Number.isInteger(limit)) {
    return { valid: false, message: "Range must be a whole number." };
  }

  if (limit < LIMIT_MIN || limit > LIMIT_MAX) {
    return { valid: false, message: `Range must be between ${LIMIT_MIN} and ${LIMIT_MAX}.` };
  }

  return { valid: true, base, limit };
};

const generateTable = () => {
  const validation = validateInputs();

  if (!validation.valid) {
    showMessage(validation.message, "error");
    return;
  }

  const { base, limit } = validation;
  resultNode.innerHTML = createRows(base, limit);
  showMessage(`Generated table for ${base} up to ${limit}.`, "success");
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateTable();
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
});

clearButton.addEventListener("click", () => {
  form.reset();
  limitInput.value = "10";
  clearMessage();
  renderHint();
  baseInput.focus();
});

[baseInput, limitInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (messageNode.classList.contains("error")) {
      clearMessage();
    }
  });
});

applyTheme(resolveInitialTheme());
renderHint();
