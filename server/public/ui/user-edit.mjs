import { userStore } from "../data/userStore.mjs";
import { t } from "../i18n/index.mjs";

class UserEdit extends HTMLElement {
  #onChange;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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
    const { status, token, me } = userStore.state;
    const loggedIn = Boolean(token);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="../app.css">
      <section class="panel">
        <h2>${t("loginEdit")}</h2>

        <form id="login" novalidate>
          <label for="login-username">${t("username")}</label>
          <input id="login-username" name="username" type="text" minlength="3" required />

          <label for="login-password">${t("password")}</label>
          <input id="login-password" name="password" type="password" minlength="8" required />

          <div class="row" style="margin-top:12px">
            <button class="primary" type="submit" ${status === "loading" ? "disabled" : ""}>${t("login")}</button>
            <button type="button" id="meBtn" ${!loggedIn || status === "loading" ? "disabled" : ""}>${t("reloadMe")}</button>
            <button type="button" id="logoutBtn" ${!loggedIn || status === "loading" ? "disabled" : ""}>${t("logout")}</button>
          </div>

          <small class="muted">
            ${t("calling")}: <code>POST /api/v1/auth/login</code>, <code>GET /api/v1/auth/me</code>, <code>POST /api/v1/auth/logout</code>
          </small>
        </form>

        <hr />

        <form id="edit" novalidate>
          <div class="muted">${t("loggedInAs")}: <code>${me?.username ?? "-"}</code></div>

          <label for="new-username">${t("newUsernameOptional")}</label>
          <input id="new-username" name="newUsername" type="text" minlength="3" />

          <label for="new-password">${t("newPasswordOptional")}</label>
          <input id="new-password" name="newPassword" type="password" minlength="8" />

          <div class="row" style="margin-top:12px">
            <button class="primary" type="submit" ${!loggedIn || status === "loading" ? "disabled" : ""}>${t("saveChanges")}</button>
          </div>

          <small class="muted">${t("calling")}: <code>PATCH /api/v1/users/me</code></small>
        </form>
      </section>
    `;

    const loginForm = this.shadowRoot.querySelector("#login");
    const loginUsername = this.shadowRoot.querySelector("#login-username");
    const loginPassword = this.shadowRoot.querySelector("#login-password");

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

      await userStore.login({
        username: String(fd.get("username") || ""),
        password: String(fd.get("password") || "")
      });
    };

    loginUsername.oninput = () => loginUsername.setCustomValidity("");
    loginPassword.oninput = () => loginPassword.setCustomValidity("");

    this.shadowRoot.querySelector("#meBtn").onclick = () => userStore.loadMe();
    this.shadowRoot.querySelector("#logoutBtn").onclick = () => userStore.logout();

    const editForm = this.shadowRoot.querySelector("#edit");
    const newUsername = this.shadowRoot.querySelector("#new-username");
    const newPassword = this.shadowRoot.querySelector("#new-password");

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
        ...(password ? { password } : {})
      };

      if (Object.keys(patch).length === 0) return;

      await userStore.updateMe(patch);
      editForm.reset();
    };

    newUsername.oninput = () => newUsername.setCustomValidity("");
    newPassword.oninput = () => newPassword.setCustomValidity("");
  }
}

customElements.define("user-edit", UserEdit);