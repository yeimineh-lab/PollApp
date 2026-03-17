import { userStore } from "./data/userStore.mjs";
import { request } from "./data/api.mjs";
import { t, detectLanguage } from "./i18n/index.mjs";

import "./ui/user-create.mjs";
import "./ui/user-edit.mjs";
import "./ui/user-delete.mjs";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const authView = $("#authView");
const appView = $("#appView");
const pageHintEl = $("#pageHint");
const mainNav = $("#mainNav");
const brandTitleEl = $("#brandTitle");

const showLoginBtn = $("#showLoginBtn");
const showSignupBtn = $("#showSignupBtn");
const loginPanel = $("#loginPanel");
const signupPanel = $("#signupPanel");

const pollsView = $("#pollsView");
const createPollView = $("#createPollView");
const profileView = $("#profileView");

const pollsListEl = $("#pollsList");
const createPollForm = $("#createPollForm");
const createPollMessageEl = $("#createPollMessage");
const logoutBtn = $("#logoutBtn");

const loginForm = $("#loginForm");
const loginErrorEl = $("#loginError");
const signupErrorEl = $("#signupError");

const profileErrorEl = $("#profileError");
const profileCurrentUsernameEl = $("#profileCurrentUsername");

const currentLang = detectLanguage();
let currentAppView = "polls";
let pollsLoading = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function showMessage(element, message = "") {
  if (!element) return;

  element.textContent = message;

  if (message) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  const titleEl = document.querySelector("title");
  if (titleEl) {
    titleEl.textContent = t("pageTitle");
  }
}

function renderCurrentUserInHeader() {
  if (!brandTitleEl) return;

  const { token, me } = userStore.state;
  brandTitleEl.textContent = token && me?.username ? me.username : "Simple Poll";
}

function renderProfileInfo() {
  const { me, error } = userStore.state;

  if (profileCurrentUsernameEl) {
    profileCurrentUsernameEl.textContent = me?.username ?? "-";
  }

  showMessage(profileErrorEl, error ?? "");
}

function activateAuthTab(tab) {
  const isLogin = tab === "login";

  showLoginBtn?.classList.toggle("active", isLogin);
  showSignupBtn?.classList.toggle("active", !isLogin);
  loginPanel?.classList.toggle("hidden", !isLogin);
  signupPanel?.classList.toggle("hidden", isLogin);

  showLoginBtn?.setAttribute("aria-selected", String(isLogin));
  showSignupBtn?.setAttribute("aria-selected", String(!isLogin));
}

function bindAuthTabs() {
  showLoginBtn?.addEventListener("click", () => activateAuthTab("login"));
  showSignupBtn?.addEventListener("click", () => activateAuthTab("signup"));
}

function showAppView(viewName) {
  currentAppView = viewName;

  pollsView?.classList.toggle("hidden", viewName !== "polls");
  createPollView?.classList.toggle("hidden", viewName !== "create");
  profileView?.classList.toggle("hidden", viewName !== "profile");

  $$(".nav-btn[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  if (viewName === "profile") {
    renderProfileInfo();
  }
}

function bindNav() {
  $$(".nav-btn[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showAppView(button.dataset.view);
    });
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await userStore.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

function updateView() {
  const { token } = userStore.state;

  if (token) {
    authView?.classList.add("hidden");
    appView?.classList.remove("hidden");
    mainNav?.classList.remove("hidden");

    if (pageHintEl) {
      pageHintEl.textContent = "Create polls, vote anonymously, and manage your account.";
    }

    showAppView(currentAppView);
    renderProfileInfo();
    return;
  }

  authView?.classList.remove("hidden");
  appView?.classList.add("hidden");
  mainNav?.classList.add("hidden");

  if (pageHintEl) {
    pageHintEl.textContent = "Log in or create an account to continue.";
  }

  activateAuthTab("login");
}

function renderPollCard(poll) {
  const me = userStore.state.me;

  const totalVotes = Array.isArray(poll.options)
    ? poll.options.reduce((sum, option) => sum + Number(option.votes || 0), 0)
    : 0;

  const ownerId =
    poll.createdBy ??
    poll.created_by ??
    poll.userId ??
    poll.user_id ??
    null;

  const myId = me?.id ?? me?.userId ?? null;

  const isOwner = Boolean(ownerId && myId && String(ownerId) === String(myId));
  const canDelete = isOwner;
  const userVote = poll.userVote;

  const optionsHtml = (poll.options ?? [])
    .map((option) => {
      const votes = Number(option.votes || 0);
      const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      const hasVoted = userVote !== null && userVote !== undefined;
      const isUsersOption = Number(userVote) === Number(option.optionIndex);

      return `
        <div class="poll-option ${isUsersOption ? "selected-option" : ""}">
          <div class="poll-option-top">
            <div class="option-left">
              <strong>${escapeHtml(option.text)}</strong>
              <span class="option-stats">${votes} votes · ${percent}%</span>
            </div>

            <button
              type="button"
              class="vote-btn"
              data-poll-id="${escapeHtml(poll.id)}"
              data-option-index="${option.optionIndex}"
              ${hasVoted || isOwner ? "disabled" : ""}
            >
              ${
                isOwner
                  ? "Owner"
                  : hasVoted
                    ? isUsersOption
                      ? "Your vote"
                      : "Voted"
                    : "Vote"
              }
            </button>
          </div>

          <div class="poll-bar">
            <div class="poll-bar-fill" style="width: ${percent}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <article class="poll-card">
      <div class="poll-card-head">
        <div>
          <h3>${escapeHtml(poll.title)}</h3>
          <div class="poll-meta">Created by ${escapeHtml(poll.ownerUsername ?? "Unknown")}</div>
          <div class="poll-meta">Anonymous voting · Total votes: ${totalVotes}</div>
        </div>

        ${
          canDelete
            ? `
              <button
                type="button"
                class="delete-poll-btn"
                data-poll-id="${escapeHtml(poll.id)}"
              >
                Delete poll
              </button>
            `
            : ""
        }
      </div>

      <div class="poll-options">
        ${optionsHtml}
      </div>
    </article>
  `;
}

function bindVoteButtons() {
  $$(".vote-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.disabled) return;

      const { token } = userStore.state;
      const pollId = button.dataset.pollId;
      const optionIndex = Number(button.dataset.optionIndex);

      try {
        await request(`/api/v1/polls/${pollId}/vote`, {
          method: "POST",
          token,
          body: { optionIndex },
        });

        await loadPolls(true);
      } catch (error) {
        alert(error.message || "Failed to vote.");
      }
    });
  });
}

function bindDeletePollButtons() {
  $$(".delete-poll-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const { token } = userStore.state;
      const pollId = button.dataset.pollId;

      const confirmed = confirm("Delete this poll? This cannot be undone.");
      if (!confirmed) return;

      try {
        await request(`/api/v1/polls/${pollId}`, {
          method: "DELETE",
          token,
        });

        await loadPolls(true);
      } catch (error) {
        alert(error.message || "Failed to delete poll.");
      }
    });
  });
}

async function loadPolls(force = false) {
  if (!pollsListEl) return;

  const { token } = userStore.state;

  if (!token) {
    pollsListEl.innerHTML = "";
    return;
  }

  if (pollsLoading && !force) return;
  pollsLoading = true;

  try {
    const data = await request("/api/v1/polls", { token });
    const polls = data?.polls ?? data ?? [];

    if (!userStore.state.token) {
      pollsListEl.innerHTML = "";
      return;
    }

    if (!Array.isArray(polls) || polls.length === 0) {
      pollsListEl.innerHTML = `<p class="subtitle">No polls yet.</p>`;
      return;
    }

    const results = await Promise.all(
      polls.map(async (poll) => {
        try {
          return await request(`/api/v1/polls/${poll.id}/results`, {
            token: userStore.state.token,
          });
        } catch (error) {
          if (error?.status === 401 || !userStore.state.token) {
            return null;
          }

          console.error(`Failed to load results for poll ${poll.id}:`, error);
          return null;
        }
      }),
    );

    if (!userStore.state.token) {
      pollsListEl.innerHTML = "";
      return;
    }

    const pollsWithMeta = results
      .filter(Boolean)
      .map((result) => {
        const basePoll = polls.find((poll) => String(poll.id) === String(result.poll.id));

        return {
          ...result.poll,
          ownerUsername:
            basePoll?.owner_username ??
            basePoll?.ownerUsername ??
            "Unknown",
          createdBy:
            basePoll?.owner_id ??
            basePoll?.createdBy ??
            result.poll.createdBy,
        };
      });

    if (pollsWithMeta.length === 0) {
      pollsListEl.innerHTML = `<p class="subtitle">No polls available right now.</p>`;
      return;
    }

    pollsListEl.innerHTML = pollsWithMeta.map(renderPollCard).join("");
    bindVoteButtons();
    bindDeletePollButtons();
  } catch (error) {
    if (error?.status === 401 || !userStore.state.token) {
      pollsListEl.innerHTML = "";
      return;
    }

    pollsListEl.innerHTML = `<p class="subtitle">${escapeHtml(
      error.message || "Failed to load polls.",
    )}</p>`;
  } finally {
    pollsLoading = false;
  }
}

function bindLoginForm() {
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    showMessage(loginErrorEl);

    if (!username || username.length < 3) {
      showMessage(loginErrorEl, "Username must be at least 3 characters.");
      return;
    }

    if (!password || password.length < 8) {
      showMessage(loginErrorEl, "Password must be at least 8 characters.");
      return;
    }

    try {
      await userStore.login({ username, password });
      showAppView("polls");
      await loadPolls(true);
      loginForm.reset();
    } catch (error) {
      showMessage(loginErrorEl, error.message || "Failed to log in.");
    }
  });
}

function bindSignupForm() {
  document.addEventListener("user-create-submit", async (event) => {
    const { username, password, consent, form } = event.detail;

    showMessage(signupErrorEl);

    if (!username || username.length < 3) {
      showMessage(signupErrorEl, "Username must be at least 3 characters.");
      return;
    }

    if (!password || password.length < 8) {
      showMessage(signupErrorEl, "Password must be at least 8 characters.");
      return;
    }

    if (!consent) {
      showMessage(signupErrorEl, "You must accept Terms and Privacy.");
      return;
    }

    try {
      await userStore.signup({
        username,
        password,
        tosAccepted: consent,
      });

      showMessage(signupErrorEl, "");

      activateAuthTab("login");
      form?.reset();
    } catch (error) {
      showMessage(signupErrorEl, error.message || "Failed to sign up.");
    }
  });
}

function bindProfileForm() {
  document.addEventListener("user-edit-submit", async (event) => {
    const { newUsername, newPassword, form } = event.detail;

    showMessage(profileErrorEl);

    if (newUsername && newUsername.length < 3) {
      showMessage(profileErrorEl, "Username must be at least 3 characters.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      showMessage(profileErrorEl, "Password must be at least 8 characters.");
      return;
    }

    const patch = {
      ...(newUsername ? { username: newUsername } : {}),
      ...(newPassword ? { password: newPassword } : {}),
    };

    if (Object.keys(patch).length === 0) return;

    try {
      await userStore.updateMe(patch);
      showMessage(profileErrorEl, "Profile updated successfully.");
      form?.reset();
      renderProfileInfo();
    } catch (error) {
      showMessage(profileErrorEl, error.message || "Failed to update profile.");
    }
  });

  document.addEventListener("user-delete-click", async () => {
    const confirmed = confirm("Delete your account? This cannot be undone.");
    if (!confirmed) return;

    try {
      await userStore.deleteMe();
    } catch (error) {
      showMessage(profileErrorEl, error.message || "Failed to delete account.");
    }
  });
}

function bindCreatePollForm() {
  createPollForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { token } = userStore.state;
    const formData = new FormData(createPollForm);

    const title = String(formData.get("title") ?? "").trim();
    const options = [
      formData.get("option1"),
      formData.get("option2"),
      formData.get("option3"),
      formData.get("option4"),
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);

    if (!title) {
      showMessage(createPollMessageEl, "Title is required.");
      return;
    }

    if (options.length < 2) {
      showMessage(createPollMessageEl, "At least two options are required.");
      return;
    }

    showMessage(createPollMessageEl);

    try {
      await request("/api/v1/polls", {
        method: "POST",
        token,
        body: { title, options },
      });

      createPollForm.reset();
      showMessage(createPollMessageEl, "Poll created successfully.");
      showAppView("polls");
      await loadPolls(true);
    } catch (error) {
      showMessage(createPollMessageEl, error.message || "Failed to create poll.");
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service worker registered:", registration);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}

async function init() {
  applyTranslations();
  activateAuthTab("login");
  bindAuthTabs();
  bindNav();
  bindLoginForm();
  bindSignupForm();
  bindProfileForm();
  bindCreatePollForm();
  registerServiceWorker();

  await userStore.bootstrap();

  renderCurrentUserInHeader();
  updateView();

  if (userStore.state.token) {
    await loadPolls(true);
  }
}

userStore.addEventListener("change", () => {
  renderCurrentUserInHeader();
  updateView();
  renderProfileInfo();

  if (!userStore.state.token && pollsListEl) {
    pollsListEl.innerHTML = "";
  }
});

init();