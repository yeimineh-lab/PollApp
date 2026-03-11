import { userStore } from "./data/userStore.mjs";
import { request } from "./data/api.mjs";
import "./ui/user-create.mjs";
import "./ui/user-edit.mjs";
import { t, detectLanguage } from "./i18n/index.mjs";

const usersListEl = document.querySelector("#usersList");
const authView = document.querySelector("#authView");
const appView = document.querySelector("#appView");
const pageHeadingEl = document.querySelector("#pageHeading");
const pageSubtitleEl = document.querySelector("#pageSubtitle");
const showLoginBtn = document.querySelector("#showLoginBtn");
const showSignupBtn = document.querySelector("#showSignupBtn");
const loginPanel = document.querySelector("#loginPanel");
const signupPanel = document.querySelector("#signupPanel");

const currentLang = detectLanguage();

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  const titleEl = document.querySelector("title");
  if (titleEl) {
    titleEl.textContent = t("pageTitle");
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (key === "localBadge") {
      element.innerHTML = `<span class="dot"></span> ${escapeHtml(t(key))}`;
      return;
    }

    element.textContent = t(key);
  });
}

function renderHeader() {
  const { token, me } = userStore.state;
  const headerContent = pageHeadingEl?.parentElement;

  if (!pageHeadingEl || !pageSubtitleEl || !headerContent) return;

  if (token && me?.username) {
    pageHeadingEl.textContent = me.username;
    pageSubtitleEl.textContent = "";
    pageSubtitleEl.classList.add("hidden");
    headerContent.classList.remove("auth-header-center");
  } else {
    pageHeadingEl.textContent = "";
    pageSubtitleEl.textContent = "Log in or create an account to continue.";
    pageSubtitleEl.classList.remove("hidden");
    headerContent.classList.add("auth-header-center");
  }
}

function updateView() {
  const { token } = userStore.state;

  if (!authView || !appView) return;

  if (token) {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");
  } else {
    authView.classList.remove("hidden");
    appView.classList.add("hidden");
  }
}

function renderUsersMessage(message) {
  if (!usersListEl) return;
  usersListEl.innerHTML = `<li>${escapeHtml(message)}</li>`;
}

async function loadUsers() {
  if (!usersListEl) return;

  const { token } = userStore.state;

  if (!token) {
    renderUsersMessage("Log in to view registered users.");
    return;
  }

  try {
    const users = await request("/api/v1/users", { token });

    if (!Array.isArray(users) || users.length === 0) {
      renderUsersMessage("No registered users found.");
      return;
    }

    usersListEl.innerHTML = users
      .map(
        (user) =>
          `<li><strong>${escapeHtml(user.username)}</strong> — ${escapeHtml(
            new Date(user.createdAt).toLocaleString()
          )}</li>`
      )
      .join("");
  } catch (error) {
    renderUsersMessage(error.message || "Failed to load users.");
  }
}

function activateAuthTab(tab) {
  if (!showLoginBtn || !showSignupBtn || !loginPanel || !signupPanel) return;

  const loginActive = tab === "login";

  showLoginBtn.classList.toggle("active", loginActive);
  showSignupBtn.classList.toggle("active", !loginActive);
  loginPanel.classList.toggle("hidden", !loginActive);
  signupPanel.classList.toggle("hidden", loginActive);
}

function bindAuthTabs() {
  showLoginBtn?.addEventListener("click", () => activateAuthTab("login"));
  showSignupBtn?.addEventListener("click", () => activateAuthTab("signup"));
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("/service-worker.js");
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
}

async function init() {
  applyTranslations();
  activateAuthTab("login");
  bindAuthTabs();

  await userStore.bootstrap();

  renderHeader();
  updateView();
  loadUsers();
  registerServiceWorker();
}

userStore.addEventListener("change", () => {
  renderHeader();
  updateView();
  loadUsers();
});

init();