/**
 * Client application entry file.
 *
 * Handles UI setup, navigation, authentication flow,
 * poll loading, poll actions, and service worker registration.
 */

import { userStore } from "./data/userStore.mjs";
import { request } from "./data/api.mjs";
import { t, detectLanguage } from "./i18n/index.mjs";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const appView = $("#appView");
const pageHintEl = $("#pageHint");
const mainNav = $("#mainNav");
const brandTitleEl = $("#brandTitle");

const accountMenuBtn = $("#accountMenuBtn");
const accountDropdown = $("#accountDropdown");
const guestMenu = $("#guestMenu");
const userMenu = $("#userMenu");
const accountMenuUsername = $("#accountMenuUsername");

const showLoginBtn = $("#showLoginBtn");
const showSignupBtn = $("#showSignupBtn");
const loginPanel = $("#loginPanel");
const signupPanel = $("#signupPanel");

const homeView = $("#homeView");
const pollsView = $("#pollsView");
const createPollView = $("#createPollView");
const profileView = $("#profileView");

const pollsHeadingEl = $("#pollsHeading");
const pollsSubtitleEl = $("#pollsSubtitle");
const pollsListEl = $("#pollsList");

const createPollForm = $("#createPollForm");
const createPollMessageEl = $("#createPollMessage");
const createPollSubtitleEl = $("#createPollSubtitle");
const pollVisibilityFieldEl = $("#pollVisibility");
const pollVisibilityFieldWrapEl = $("#pollVisibilityField");
const guestUsernameFieldEl = $("#guestUsernameField");

const logoutBtn = $("#logoutBtn");

const loginForm = $("#loginForm");
const loginErrorEl = $("#loginError");
const signupErrorEl = $("#signupError");

const profileErrorEl = $("#profileError");
const profileCurrentUsernameEl = $("#profileCurrentUsername");

const currentLang = detectLanguage();
let currentAppView = "home";
let currentPollCategory = "public";
let pollsLoading = false;

let userCreateModulePromise = null;
let userProfileModulesPromise = null;

const POLLS_CACHE_TTL_MS = 30_000;
let pollsCache = {
  key: null,
  fetchedAt: 0,
  pollsWithMeta: null,
};

function ensureUserCreateComponent() {
  if (customElements.get("user-create")) {
    return Promise.resolve();
  }

  if (!userCreateModulePromise) {
    userCreateModulePromise = import("./ui/user-create.mjs");
  }

  return userCreateModulePromise;
}

function ensureUserProfileComponents() {
  const hasEdit = customElements.get("user-edit");
  const hasDelete = customElements.get("user-delete");

  if (hasEdit && hasDelete) {
    return Promise.resolve();
  }

  if (!userProfileModulesPromise) {
    userProfileModulesPromise = Promise.all([
      import("./ui/user-edit.mjs"),
      import("./ui/user-delete.mjs"),
    ]);
  }

  return userProfileModulesPromise;
}

function runWhenIdle(callback, timeout = 1500) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, 250);
}

function getGuestId() {
  const storageKey = "simple_poll_guest_id";
  let guestId = localStorage.getItem(storageKey);

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(storageKey, guestId);
  }

  return guestId;
}

function getPollCacheKey() {
  const { token } = userStore.state;
  return token ? `user:${token}` : `guest:${getGuestId()}`;
}

function invalidatePollsCache() {
  pollsCache = {
    key: null,
    fetchedAt: 0,
    pollsWithMeta: null,
  };
}

function isPollsCacheValid() {
  if (!Array.isArray(pollsCache.pollsWithMeta)) return false;
  if (pollsCache.key !== getPollCacheKey()) return false;
  return Date.now() - pollsCache.fetchedAt < POLLS_CACHE_TTL_MS;
}

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
  element.classList.toggle("hidden", !message);
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
  brandTitleEl.textContent = "Simple Poll";
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

  showSignupBtn?.addEventListener("click", async () => {
    try {
      await ensureUserCreateComponent();
      activateAuthTab("signup");
    } catch (error) {
      console.error("Failed to load signup component:", error);
      activateAuthTab("signup");
    }
  });
}

function closeAccountMenu() {
  accountDropdown?.classList.add("hidden");
  accountMenuBtn?.setAttribute("aria-expanded", "false");
}

function syncPollHeadings() {
  if (pollsHeadingEl) {
    pollsHeadingEl.textContent =
      currentPollCategory === "public" ? "Public polls" : "Community polls";
  }

  if (pollsSubtitleEl) {
    pollsSubtitleEl.textContent =
      currentPollCategory === "public"
        ? "Public polls are visible to everyone. You can also create a guest poll without logging in."
        : "Community polls are visible only to signed-in users.";
  }
}

function syncCreatePollVisibility() {
  const isLoggedIn = Boolean(userStore.state.token);

  if (!pollVisibilityFieldEl) return;

  if (!isLoggedIn) {
    if (pollVisibilityFieldWrapEl) {
      pollVisibilityFieldWrapEl.classList.add("hidden");
    }

    if (guestUsernameFieldEl) {
      guestUsernameFieldEl.classList.remove("hidden");
    }

    pollVisibilityFieldEl.innerHTML = `
      <option value="true">Public Poll</option>
    `;
    pollVisibilityFieldEl.value = "true";

    if (createPollSubtitleEl) {
      createPollSubtitleEl.textContent =
        "Create a public poll that other guests and users can vote on anonymously.";
    }

    return;
  }

  if (pollVisibilityFieldWrapEl) {
    pollVisibilityFieldWrapEl.classList.remove("hidden");
  }

  if (guestUsernameFieldEl) {
    guestUsernameFieldEl.classList.add("hidden");
  }

  pollVisibilityFieldEl.innerHTML = `
    <option value="true">Public Poll</option>
    <option value="false">Community Poll</option>
  `;

  if (!pollVisibilityFieldEl.value) {
    pollVisibilityFieldEl.value = "true";
  }

  if (createPollSubtitleEl) {
    createPollSubtitleEl.textContent =
      "Create a public poll for everyone or a community poll for signed-in users.";
  }
}

function showAppView(viewName) {
  const isLoggedIn = Boolean(userStore.state.token);

  showMessage(createPollMessageEl, "");

  if (viewName === "community-polls" && !isLoggedIn) {
    viewName = "home";
  }

  currentAppView = viewName;

  if (viewName === "public-polls") {
    currentPollCategory = "public";
  }

  if (viewName === "community-polls") {
    currentPollCategory = "community";
  }

  homeView?.classList.toggle("hidden", viewName !== "home");
  pollsView?.classList.toggle(
    "hidden",
    viewName !== "public-polls" && viewName !== "community-polls",
  );
  createPollView?.classList.toggle("hidden", viewName !== "create");
  profileView?.classList.toggle("hidden", !isLoggedIn || viewName !== "profile");

  $$(".nav-btn[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  syncPollHeadings();
  syncCreatePollVisibility();

  if (viewName === "profile" && isLoggedIn) {
    renderProfileInfo();
  }
}

function bindAccountMenu() {
  accountMenuBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    accountDropdown?.classList.toggle("hidden");

    const isOpen = !accountDropdown?.classList.contains("hidden");
    accountMenuBtn?.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!accountDropdown || !accountMenuBtn) return;

    const clickedInside =
      accountDropdown.contains(event.target) ||
      accountMenuBtn.contains(event.target);

    if (!clickedInside) {
      closeAccountMenu();
    }
  });

  document.querySelectorAll(".account-link-btn[data-view]").forEach((button) => {
    button.addEventListener("click", async () => {
      const viewName = button.dataset.view;

      if (viewName === "profile") {
        try {
          await ensureUserProfileComponents();
        } catch (error) {
          console.error("Failed to load profile components:", error);
        }
      }

      showAppView(viewName);
      closeAccountMenu();
    });
  });
}

function bindNav() {
  $$(".nav-btn[data-view]").forEach((button) => {
    button.addEventListener("click", async () => {
      const viewName = button.dataset.view;
      showAppView(viewName);

      if (viewName === "public-polls" || viewName === "community-polls") {
        await loadPolls();
      }
    });
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await userStore.logout();
      invalidatePollsCache();
      closeAccountMenu();
      showAppView("home");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

function updateView() {
  const { token, me } = userStore.state;

  appView?.classList.remove("hidden");
  mainNav?.classList.remove("hidden");

  if (pollsCache.key && pollsCache.key !== getPollCacheKey()) {
    invalidatePollsCache();
  }

  if (token) {
    if (pageHintEl) {
      pageHintEl.textContent =
        "Welcome to Simple Poll. Browse public polls, explore community polls, or manage your profile.";
    }

    if (accountMenuBtn) {
      accountMenuBtn.textContent = me?.username ?? "Account";
    }

    guestMenu?.classList.add("hidden");
    userMenu?.classList.remove("hidden");

    if (accountMenuUsername) {
      accountMenuUsername.textContent = me?.username ?? "User";
    }

    $$(".nav-btn[data-auth-only='true']").forEach((button) => {
      button.classList.remove("hidden");
    });

    syncCreatePollVisibility();
    showAppView(currentAppView);
    renderProfileInfo();
    return;
  }

  if (pageHintEl) {
    pageHintEl.textContent =
      "Welcome to Simple Poll. Browse public polls, create guest polls, or sign in to access community polls and your account.";
  }

  if (accountMenuBtn) {
    accountMenuBtn.textContent = "Account";
  }

  guestMenu?.classList.remove("hidden");
  userMenu?.classList.add("hidden");

  $$(".nav-btn[data-auth-only='true']").forEach((button) => {
    button.classList.add("hidden");
  });

  activateAuthTab("login");
  syncCreatePollVisibility();

  if (currentAppView === "profile" || currentAppView === "community-polls") {
    showAppView("home");
  } else {
    showAppView(currentAppView);
  }
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

  const guestOwnerId =
    poll.guestId ??
    poll.guest_id ??
    null;

  const myId = me?.id ?? me?.userId ?? null;
  const myGuestId = !me ? getGuestId() : null;

  const isUserOwner = Boolean(ownerId && myId && String(ownerId) === String(myId));
  const isGuestOwner = Boolean(
    guestOwnerId &&
    myGuestId &&
    String(guestOwnerId) === String(myGuestId),
  );
  const isOwner = isUserOwner || isGuestOwner;
  const canDelete = isOwner;

  const userVote = poll.userVote;
  const isLoggedIn = Boolean(me);
  const guestHasVoted =
    !isLoggedIn && localStorage.getItem(`voted_poll_${poll.id}`) === "true";

  const hasVoted = isLoggedIn
    ? userVote !== null && userVote !== undefined
    : guestHasVoted;

  const optionsHtml = (poll.options ?? [])
    .map((option) => {
      const votes = Number(option.votes || 0);
      const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
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
          <div class="poll-meta">Created by ${escapeHtml(poll.ownerUsername ?? poll.guestUsername ?? "Guest")}</div>
          <div class="poll-meta">
            ${poll.isPublic ? "Public poll" : "Community poll"} · Total votes: ${totalVotes}
          </div>
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

function renderPollsList(pollsWithMeta) {
  if (!pollsListEl) return;

  const filteredPolls = pollsWithMeta.filter((poll) => {
    if (currentPollCategory === "public") {
      return Boolean(poll.isPublic);
    }

    return !Boolean(poll.isPublic);
  });

  syncPollHeadings();

  if (filteredPolls.length === 0) {
    pollsListEl.innerHTML = `<p class="subtitle">No polls available right now.</p>`;
    return;
  }

  pollsListEl.innerHTML = filteredPolls.map(renderPollCard).join("");
  bindVoteButtons();
  bindDeletePollButtons();
}

function bindVoteButtons() {
  $$(".vote-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.disabled) return;

      const { token, me } = userStore.state;
      const pollId = button.dataset.pollId;
      const optionIndex = Number(button.dataset.optionIndex);

      try {
        await request(`/api/v1/polls/${pollId}/vote`, {
          method: "POST",
          token,
          body: {
            optionIndex,
            guestId: !token || !me ? getGuestId() : undefined,
          },
        });

        if (!token || !me) {
          localStorage.setItem(`voted_poll_${pollId}`, "true");
        }

        invalidatePollsCache();
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
        const guestId = !token ? getGuestId() : null;
        const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : "";

        await request(`/api/v1/polls/${pollId}${query}`, {
          method: "DELETE",
          token,
        });

        localStorage.removeItem(`voted_poll_${pollId}`);
        invalidatePollsCache();
        await loadPolls(true);
      } catch (error) {
        alert(error.message || "Failed to delete poll.");
      }
    });
  });
}

async function fetchPollsWithMeta() {
  const { token } = userStore.state;
  const data = await request("/api/v1/polls", { token });
  const polls = data?.polls ?? data ?? [];

  if (!Array.isArray(polls) || polls.length === 0) {
    return [];
  }

  const results = await Promise.all(
    polls.map(async (poll) => {
      try {
        const requestToken = userStore.state.token;
        const guestId = !requestToken ? getGuestId() : null;
        const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : "";

        return await request(`/api/v1/polls/${poll.id}/results${query}`, {
          token: requestToken,
        });
      } catch (error) {
        console.error(`Failed to load results for poll ${poll.id}:`, error);
        return null;
      }
    }),
  );

  return results
    .filter(Boolean)
    .map((result) => {
      const basePoll = polls.find((poll) => String(poll.id) === String(result.poll.id));

      return {
        ...result.poll,
        ownerUsername:
          basePoll?.owner_username ??
          basePoll?.ownerUsername ??
          basePoll?.guest_username ??
          basePoll?.guestUsername ??
          result.poll.ownerUsername ??
          result.poll.guestUsername ??
          "Guest",
        createdBy:
          basePoll?.owner_id ??
          basePoll?.createdBy ??
          result.poll.createdBy,
        guestId:
          basePoll?.guest_id ??
          basePoll?.guestId ??
          result.poll.guestId ??
          null,
        guestUsername:
          basePoll?.guest_username ??
          basePoll?.guestUsername ??
          result.poll.guestUsername ??
          "Guest",
        isPublic:
          basePoll?.is_public ??
          basePoll?.isPublic ??
          result.poll.isPublic ??
          false,
      };
    });
}

async function loadPolls(force = false) {
  if (!pollsListEl) return;
  if (pollsLoading && !force) return;

  const shouldUseCache = !force && isPollsCacheValid();

  if (shouldUseCache) {
    renderPollsList(pollsCache.pollsWithMeta);
    return;
  }

  pollsLoading = true;

  try {
    if (!Array.isArray(pollsCache.pollsWithMeta) || force) {
      pollsListEl.innerHTML = `<p class="subtitle">Loading polls...</p>`;
    }

    const pollsWithMeta = await fetchPollsWithMeta();

    pollsCache = {
      key: getPollCacheKey(),
      fetchedAt: Date.now(),
      pollsWithMeta,
    };

    if (pollsWithMeta.length === 0) {
      pollsListEl.innerHTML = `<p class="subtitle">No polls yet.</p>`;
      syncPollHeadings();
      return;
    }

    renderPollsList(pollsWithMeta);
  } catch (error) {
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
      invalidatePollsCache();
      closeAccountMenu();
      showAppView("home");
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

    
      activateAuthTab("login");
      showMessage(
        loginErrorEl,
        "Account created successfully. Please log in.",
      );

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
      invalidatePollsCache();
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
    const guestUsername = String(formData.get("guestUsername") ?? "").trim();
    const options = [
      formData.get("option1"),
      formData.get("option2"),
      formData.get("option3"),
      formData.get("option4"),
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);

    const isPublic = String(formData.get("isPublic") ?? "true") === "true";

    if (!title) {
      showMessage(createPollMessageEl, "Title is required.");
      return;
    }

    if (options.length < 2) {
      showMessage(createPollMessageEl, "At least two options are required.");
      return;
    }

    if (!token && guestUsername.length === 0) {
      showMessage(createPollMessageEl, "Guest username is required.");
      return;
    }

    showMessage(createPollMessageEl);

    try {
      await request("/api/v1/polls", {
        method: "POST",
        token,
        body: {
          title,
          options,
          isPublic,
          guestId: getGuestId(),
          guestUsername,
        },
      });

      createPollForm.reset();
      syncCreatePollVisibility();

      invalidatePollsCache();

      if (isPublic) {
        showAppView("public-polls");
      } else {
        showAppView("community-polls");
      }

      await loadPolls(true);
    } catch (error) {
      showMessage(createPollMessageEl, error.message || "Failed to create poll.");
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  };

  window.addEventListener("load", () => {
    runWhenIdle(() => {
      register().catch(() => {});
    }, 2000);
  });
}

async function init() {
  applyTranslations();
  activateAuthTab("login");
  bindAuthTabs();
  bindAccountMenu();
  bindNav();
  bindLoginForm();
  bindSignupForm();
  bindProfileForm();
  bindCreatePollForm();
  registerServiceWorker();

  await userStore.bootstrap();

  renderCurrentUserInHeader();
  updateView();
  showAppView("home");
}

userStore.addEventListener("change", () => {
  renderCurrentUserInHeader();
  updateView();
  renderProfileInfo();
});

init();