import { userStore } from "./data/userStore.mjs";
import { request } from "./data/api.mjs";
import { t, detectLanguage } from "./i18n/index.mjs";

const authView = document.querySelector("#authView");
const appView = document.querySelector("#appView");
const pageHintEl = document.querySelector("#pageHint");
const mainNav = document.querySelector("#mainNav");
const brandTitleEl = document.querySelector("#brandTitle");

const showLoginBtn = document.querySelector("#showLoginBtn");
const showSignupBtn = document.querySelector("#showSignupBtn");
const loginPanel = document.querySelector("#loginPanel");
const signupPanel = document.querySelector("#signupPanel");

const pollsView = document.querySelector("#pollsView");
const createPollView = document.querySelector("#createPollView");
const profileView = document.querySelector("#profileView");

const pollsListEl = document.querySelector("#pollsList");
const createPollForm = document.querySelector("#createPollForm");
const createPollMessageEl = document.querySelector("#createPollMessage");
const logoutBtn = document.querySelector("#logoutBtn");

const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const loginErrorEl = document.querySelector("#loginError");
const signupErrorEl = document.querySelector("#signupError");

const profileForm = document.querySelector("#profileForm");
const profileErrorEl = document.querySelector("#profileError");
const profileCurrentUsernameEl = document.querySelector("#profileCurrentUsername");
const deleteAccountBtn = document.querySelector("#deleteAccountBtn");

const currentLang = detectLanguage();
let currentAppView = "polls";
let pollsLoading = false;

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
}

function renderCurrentUserInHeader() {
  const { token, me } = userStore.state;

  if (!brandTitleEl) return;

  if (token && me?.username) {
    brandTitleEl.textContent = me.username;
  } else {
    brandTitleEl.textContent = "Simple Poll";
  }
}

function renderProfileInfo() {
  const { me, error } = userStore.state;

  if (profileCurrentUsernameEl) {
    profileCurrentUsernameEl.textContent = me?.username ?? "-";
  }

  if (profileErrorEl) {
    if (error) {
      profileErrorEl.textContent = error;
      profileErrorEl.classList.remove("hidden");
    } else {
      profileErrorEl.textContent = "";
      profileErrorEl.classList.add("hidden");
    }
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

function showAppView(viewName) {
  currentAppView = viewName;

  pollsView?.classList.toggle("hidden", viewName !== "polls");
  createPollView?.classList.toggle("hidden", viewName !== "create");
  profileView?.classList.toggle("hidden", viewName !== "profile");

  document.querySelectorAll(".nav-btn[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  if (viewName === "profile") {
    renderProfileInfo();
  }
}

function bindNav() {
  document.querySelectorAll(".nav-btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showAppView(btn.dataset.view);
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

  if (!authView || !appView) return;

  if (token) {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");
    mainNav?.classList.remove("hidden");

    if (pageHintEl) {
      pageHintEl.textContent = "Create polls, vote anonymously, and manage your account.";
    }

    showAppView(currentAppView);
    renderProfileInfo();
  } else {
    authView.classList.remove("hidden");
    appView.classList.add("hidden");
    mainNav?.classList.add("hidden");

    if (pageHintEl) {
      pageHintEl.textContent = "Log in or create an account to continue.";
    }

    activateAuthTab("login");
  }
}

function renderPollCard(poll) {
  const me = userStore.state.me;

  const totalVotes = Array.isArray(poll.options)
    ? poll.options.reduce((sum, option) => sum + Number(option.votes || 0), 0)
    : 0;

  const ownerId = poll.createdBy ?? poll.created_by ?? poll.userId ?? poll.user_id ?? null;
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
  document.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.disabled) return;

      const { token } = userStore.state;
      const pollId = btn.dataset.pollId;
      const optionIndex = Number(btn.dataset.optionIndex);

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
  document.querySelectorAll(".delete-poll-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const { token } = userStore.state;
      const pollId = btn.dataset.pollId;

      const ok = confirm("Delete this poll? This cannot be undone.");
      if (!ok) return;

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

    const validResults = results.filter(Boolean);

    const pollsWithMeta = validResults.map((result) => {
      const basePoll = polls.find((p) => String(p.id) === String(result.poll.id));
      return {
        ...result.poll,
        ownerUsername: basePoll?.owner_username ?? basePoll?.ownerUsername ?? "Unknown",
        createdBy: basePoll?.owner_id ?? basePoll?.createdBy ?? result.poll.createdBy,
      };
    });

    if (pollsWithMeta.length === 0) {
      pollsListEl.innerHTML = `<p class="subtitle">No polls available right now.</p>`;
      return;
    }

    pollsListEl.innerHTML = pollsWithMeta.map((poll) => renderPollCard(poll)).join("");

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

    if (loginErrorEl) {
      loginErrorEl.textContent = "";
      loginErrorEl.classList.add("hidden");
    }

    if (!username || username.length < 3) {
      if (loginErrorEl) {
        loginErrorEl.textContent = "Username must be at least 3 characters.";
        loginErrorEl.classList.remove("hidden");
      }
      return;
    }

    if (!password || password.length < 8) {
      if (loginErrorEl) {
        loginErrorEl.textContent = "Password must be at least 8 characters.";
        loginErrorEl.classList.remove("hidden");
      }
      return;
    }

    try {
      await userStore.login({ username, password });

      showAppView("polls");
      await loadPolls(true);

      loginForm.reset();
    } catch (error) {
      if (loginErrorEl) {
        loginErrorEl.textContent = error.message || "Failed to log in.";
        loginErrorEl.classList.remove("hidden");
      }
    }
  });
}

function bindSignupForm() {
  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const tosAccepted = Boolean(formData.get("tosAccepted"));

    if (signupErrorEl) {
      signupErrorEl.textContent = "";
      signupErrorEl.classList.add("hidden");
    }

    if (!username || username.length < 3) {
      if (signupErrorEl) {
        signupErrorEl.textContent = "Username must be at least 3 characters.";
        signupErrorEl.classList.remove("hidden");
      }
      return;
    }

    if (!password || password.length < 8) {
      if (signupErrorEl) {
        signupErrorEl.textContent = "Password must be at least 8 characters.";
        signupErrorEl.classList.remove("hidden");
      }
      return;
    }

    if (!tosAccepted) {
      if (signupErrorEl) {
        signupErrorEl.textContent = "You must accept Terms and Privacy.";
        signupErrorEl.classList.remove("hidden");
      }
      return;
    }

    try {
      await userStore.signup({ username, password, tosAccepted });

      if (userStore.state.token) {
        showAppView("polls");
        await loadPolls(true);
      }

      signupForm.reset();
    } catch (error) {
      if (signupErrorEl) {
        signupErrorEl.textContent = error.message || "Failed to sign up.";
        signupErrorEl.classList.remove("hidden");
      }
    }
  });
}

function bindProfileForm() {
  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(profileForm);
    const newUsername = String(formData.get("newUsername") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();

    if (profileErrorEl) {
      profileErrorEl.textContent = "";
      profileErrorEl.classList.add("hidden");
    }

    if (newUsername && newUsername.length < 3) {
      if (profileErrorEl) {
        profileErrorEl.textContent = "Username must be at least 3 characters.";
        profileErrorEl.classList.remove("hidden");
      }
      return;
    }

    if (newPassword && newPassword.length < 8) {
      if (profileErrorEl) {
        profileErrorEl.textContent = "Password must be at least 8 characters.";
        profileErrorEl.classList.remove("hidden");
      }
      return;
    }

    const patch = {
      ...(newUsername ? { username: newUsername } : {}),
      ...(newPassword ? { password: newPassword } : {}),
    };

    if (Object.keys(patch).length === 0) return;

    try {
      await userStore.updateMe(patch);
      profileForm.reset();
      renderProfileInfo();
    } catch (error) {
      if (profileErrorEl) {
        profileErrorEl.textContent = error.message || "Failed to update profile.";
        profileErrorEl.classList.remove("hidden");
      }
    }
  });

  deleteAccountBtn?.addEventListener("click", async () => {
    const ok = confirm("Delete your account? This cannot be undone.");
    if (!ok) return;

    try {
      await userStore.deleteMe();
    } catch (error) {
      if (profileErrorEl) {
        profileErrorEl.textContent = error.message || "Failed to delete account.";
        profileErrorEl.classList.remove("hidden");
      }
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

    if (createPollMessageEl) {
      createPollMessageEl.textContent = "";
    }

    try {
      await request("/api/v1/polls", {
        method: "POST",
        token,
        body: { title, options },
      });

      createPollForm.reset();

      if (createPollMessageEl) {
        createPollMessageEl.textContent = "Poll created successfully.";
      }

      showAppView("polls");
      await loadPolls(true);
    } catch (error) {
      if (createPollMessageEl) {
        createPollMessageEl.textContent = error.message || "Failed to create poll.";
      }
    }
  });
}

async function clearOldServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.error("Failed to clear service workers/caches:", error);
  }
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
  await clearOldServiceWorkers();

  await userStore.bootstrap();

  renderCurrentUserInHeader();
  updateView();

  if (userStore.state.token) {
    await loadPolls(true);
  }
}

userStore.addEventListener("change", async () => {
  renderCurrentUserInHeader();
  updateView();
  renderProfileInfo();

  if (!userStore.state.token) {
    if (pollsListEl) pollsListEl.innerHTML = "";
    return;
  }
});

init();