import { userStore } from "../data/userStore.mjs";
import { t } from "../i18n/index.mjs";

class UserEdit extends HTMLElement {
  #onChange;

  constructor() {
    super();
    this.#onChange = () => this.render();
  }

  connectedCallback() {
    userStore.addEventListener("change", this.#onChange);
    this.render();
  }

  disconnectedCallback() {
    userStore.removeEventListener("change", this.#onChange);
  }

  render() {
    const { status, token, me, error } = userStore.state;
    const loggedIn = Boolean(token);
    const mode = this.getAttribute("mode") || "full";

    if (mode === "login") {
      this.renderLoginOnly(status, loggedIn, error);
      return;
    }

    if (mode === "profile") {
      this.renderProfileOnly(status, loggedIn, me, error);
      return;
    }

    this.renderFull(status, loggedIn, me, error);
  }

  renderLoginOnly(status, loggedIn, error) {
    this.innerHTML = `
      <section class="panel">
        <h2>${t("login")}</h2>

        ${error ? `<p class="form-error">${error}</p>` : ""}

        <form id="login" novalidate>
          <label for="login-username">${t("username")}</label>
          <input id="login-username" name="username" type="text" minlength="3" required />

          <label for="login-password">${t("password")}</label>
          <input id="login-password" name="password" type="password" minlength="8" required />

          <div class="row">
            <button class="primary" type="submit" ${status === "loading" ? "disabled" : ""}>
              ${t("login")}
            </button>
            <button type="button" id="logoutBtn" ${!loggedIn || status === "loading" ? "disabled" : ""}>
              ${t("logout")}
            </button>
          </div>
        </form>
      </section>
    `;

    this.bindLoginForm();
    const logoutBtn = this.querySelector("#logoutBtn");
    if (logoutBtn) logoutBtn.onclick = () => userStore.logout();
  }

  renderProfileOnly(status, loggedIn, me, error) {
    this.innerHTML = `
      <section class="panel">
        <h2>Profile settings</h2>

        ${error ? `<p class="form-error">${error}</p>` : ""}

        <div class="profile-name">${t("loggedInAs")}: <strong>${me?.username ?? "-"}</strong></div>

        <form id="edit" novalidate>
          <label for="new-username">${t("newUsernameOptional")}</label>
          <input id="new-username" name="newUsername" type="text" minlength="3" />

          <label for="new-password">${t("newPasswordOptional")}</label>
          <input id="new-password" name="newPassword" type="password" minlength="8" />

          <div class="row">
            <button class="primary" type="submit" ${!loggedIn || status === "loading" ? "disabled" : ""}>
              ${t("saveChanges")}
            </button>
            <button class="danger" type="button" id="deleteBtn" ${!loggedIn || status === "loading" ? "disabled" : ""}>
              ${t("deleteMyAccount")}
            </button>
          </div>
        </form>
      </section>
    `;

    this.bindEditForm();

    const deleteBtn = this.querySelector("#deleteBtn");
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        if (!confirm(t("confirmDelete"))) return;
        await userStore.deleteMe();
      };
    }
  }

  renderFull(status, loggedIn, me, error) {
    this.innerHTML = `
      <section class="panel">
        <h2>${t("loginEdit")}</h2>

        ${error ? `<p class="form-error">${error}</p>` : ""}

        <form id="login" novalidate>
          <label for="login-username">${t("username")}</label>
          <input id="login-username" name="username" type="text" minlength="3" required />

          <label for="login-password">${t("password")}</label>
          <input id="login-password" name="password" type="password" minlength="8" required />

          <div class="row">
            <button class="primary" type="submit" ${status === "loading" ? "disabled" : ""}>
              ${t("login")}
            </button>
            <button type="button" id="logoutBtn" ${!loggedIn || status === "loading" ? "disabled" : ""}>
              ${t("logout")}
            </button>
          </div>
        </form>

        <hr />

        <div class="profile-name">${t("loggedInAs")}: <strong>${me?.username ?? "-"}</strong></div>

        <form id="edit" novalidate>
          <label for="new-username">${t("newUsernameOptional")}</label>
          <input id="new-username" name="newUsername" type="text" minlength="3" />

          <label for="new-password">${t("newPasswordOptional")}</label>
          <input id="new-password" name="newPassword" type="password" minlength="8" />

          <div class="row">
            <button class="primary" type="submit" ${!loggedIn || status === "loading" ? "disabled" : ""}>
              ${t("saveChanges")}
            </button>
            <button class="danger" type="button" id="deleteBtn" ${!loggedIn || status === "loading" ? "disabled" : ""}>
              ${t("deleteMyAccount")}
            </button>
          </div>
        </form>
      </section>
    `;

    this.bindLoginForm();
    this.bindEditForm();

    const logoutBtn = this.querySelector("#logoutBtn");
    if (logoutBtn) logoutBtn.onclick = () => userStore.logout();

    const deleteBtn = this.querySelector("#deleteBtn");
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        if (!confirm(t("confirmDelete"))) return;
        await userStore.deleteMe();
      };
    }
  }

  bindLoginForm() {
    const loginForm = this.querySelector("#login");
    if (!loginForm) return;

    const loginUsername = this.querySelector("#login-username");
    const loginPassword = this.querySelector("#login-password");

    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      loginUsername.setCustomValidity("");
      loginPassword.setCustomValidity("");

      if (!loginUsername.value.trim()) {
        loginUsername.setCustomValidity(t("requiredField"));
      } else if (loginUsername.value.trim().length < 3) {
        loginUsername.setCustomValidity(t("usernameTooShort"));
      }

      if (!loginPassword.value.trim()) {
        loginPassword.setCustomValidity(t("requiredField"));
      } else if (loginPassword.value.trim().length < 8) {
        loginPassword.setCustomValidity(t("passwordTooShort"));
      }

      if (!loginForm.reportValidity()) return;

      const fd = new FormData(loginForm);

      try {
        await userStore.login({
          username: String(fd.get("username") || ""),
          password: String(fd.get("password") || ""),
        });
      } catch {}
    };

    loginUsername.oninput = () => loginUsername.setCustomValidity("");
    loginPassword.oninput = () => loginPassword.setCustomValidity("");
  }

  bindEditForm() {
    const editForm = this.querySelector("#edit");
    if (!editForm) return;

    const newUsername = this.querySelector("#new-username");
    const newPassword = this.querySelector("#new-password");

    editForm.onsubmit = async (e) => {
      e.preventDefault();

      newUsername.setCustomValidity("");
      newPassword.setCustomValidity("");

      const username = newUsername.value.trim();
      const password = newPassword.value.trim();

      if (username && username.length < 3) {
        newUsername.setCustomValidity(t("usernameTooShort"));
      }

      if (password && password.length < 8) {
        newPassword.setCustomValidity(t("passwordTooShort"));
      }

      if (!editForm.reportValidity()) return;

      const patch = {
        ...(username ? { username } : {}),
        ...(password ? { password } : {}),
      };

      if (Object.keys(patch).length === 0) return;

      try {
        await userStore.updateMe(patch);
        editForm.reset();
      } catch {}
    };

    newUsername.oninput = () => newUsername.setCustomValidity("");
    newPassword.oninput = () => newPassword.setCustomValidity("");
  }
}

customElements.define("user-edit", UserEdit);