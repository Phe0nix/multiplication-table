const form = document.querySelector("#table-form");
const baseInput = document.querySelector("#base-number");
const limitInput = document.querySelector("#limit-number");
const resultNode = document.querySelector("#result");
const messageNode = document.querySelector("#message");
const clearButton = document.querySelector("#clear-button");
const themeToggle = document.querySelector("#theme-toggle");
const copyUrlButton = document.querySelector("#copy-url-button");

const LIMIT_MIN = 1;
const LIMIT_MAX = 100;
const THEME_KEY = "multiplication-table-theme";
const SUCCESS_MESSAGE_TIMEOUT = 2800;
const URL_KEYS = {
  base: "n",
  range: "r",
  theme: "theme"
};
let successMessageTimer;

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
};

const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage write errors in restricted environments.
  }
};

const getThemeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get(URL_KEYS.theme);

  return theme === "light" || theme === "dark" ? theme : null;
};

const updateUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  const baseRaw = baseInput.value.trim();
  const rangeRaw = limitInput.value.trim();
  const base = Number(baseRaw);
  const range = Number(rangeRaw);
  const theme = document.body.dataset.theme === "dark" ? "dark" : "light";

  if (baseRaw && Number.isFinite(base)) {
    params.set(URL_KEYS.base, String(base));
  } else {
    params.delete(URL_KEYS.base);
  }

  if (Number.isInteger(range) && range >= LIMIT_MIN && range <= LIMIT_MAX) {
    params.set(URL_KEYS.range, String(range));
  } else {
    params.delete(URL_KEYS.range);
  }

  params.set(URL_KEYS.theme, theme);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
};

const restoreStateFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const base = params.get(URL_KEYS.base);
  const range = params.get(URL_KEYS.range);

  if (base !== null) {
    baseInput.value = base;
  }

  if (range !== null) {
    limitInput.value = range;
  }
};

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
  const isDark = theme === "dark";

  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
};

const resolveInitialTheme = () => {
  const urlTheme = getThemeFromUrl();

  if (urlTheme) {
    return urlTheme;
  }

  const storedTheme = getStoredTheme();

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const showMessage = (text, type) => {
  clearTimeout(successMessageTimer);
  messageNode.textContent = text;
  messageNode.className = `message show ${type}`;

  if (type === "success") {
    successMessageTimer = setTimeout(() => {
      if (messageNode.classList.contains("success")) {
        clearMessage();
      }
    }, SUCCESS_MESSAGE_TIMEOUT);
  }
};

const clearMessage = () => {
  clearTimeout(successMessageTimer);
  messageNode.textContent = "";
  messageNode.className = "message";
};

const renderHint = () => {
  resultNode.innerHTML = '<p class="hint">Your table will appear here.</p>';
};

const copyTextFallback = (text) => {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  tempTextArea.setAttribute("readonly", "");
  tempTextArea.style.position = "fixed";
  tempTextArea.style.opacity = "0";
  document.body.appendChild(tempTextArea);
  tempTextArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  return copied;
};

const copyShareableUrl = async () => {
  const shareUrl = window.location.href;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
      showMessage("Shareable URL copied to clipboard.", "success");
      return;
    }

    const copied = copyTextFallback(shareUrl);

    if (!copied) {
      throw new Error("Fallback clipboard copy failed.");
    }

    showMessage("Shareable URL copied to clipboard.", "success");
  } catch {
    showMessage("Could not copy URL automatically. Please copy it from the address bar.", "error");
  }
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

const generateTable = (options = {}) => {
  const { showSuccess = true, syncUrl = true } = options;
  const validation = validateInputs();

  if (!validation.valid) {
    showMessage(validation.message, "error");

    if (syncUrl) {
      updateUrlState();
    }

    return;
  }

  const { base, limit } = validation;
  resultNode.innerHTML = createRows(base, limit);

  if (showSuccess) {
    showMessage(`Generated table for ${base} up to ${limit}.`, "success");
  } else {
    clearMessage();
  }

  if (syncUrl) {
    updateUrlState();
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateTable();
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
  setStoredTheme(nextTheme);
  updateUrlState();
});

clearButton.addEventListener("click", () => {
  form.reset();
  limitInput.value = "10";
  clearMessage();
  renderHint();
  baseInput.focus();
  updateUrlState();
});

copyUrlButton.addEventListener("click", () => {
  copyShareableUrl();
});

[baseInput, limitInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (messageNode.classList.contains("error")) {
      clearMessage();
    }

    updateUrlState();
  });
});

restoreStateFromUrl();
applyTheme(resolveInitialTheme());
setStoredTheme(document.body.dataset.theme === "dark" ? "dark" : "light");

if (baseInput.value.trim()) {
  generateTable({ showSuccess: false, syncUrl: true });

  if (!resultNode.querySelector(".rows")) {
    renderHint();
  }
} else {
  renderHint();
  updateUrlState();
}
