import { userStore } from "../data/userStore.mjs";
import { t } from "../i18n/index.mjs";

class UserCreate extends HTMLElement {
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
    const { status } = userStore.state;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="../app.css">
      <section class="panel">
        <h2>${t("createUser")}</h2>

        <form id="f" novalidate>
          <label for="username">${t("username")}</label>
          <input id="username" name="username" type="text" minlength="3" required />

          <label for="password">${t("password")}</label>
          <input id="password" name="password" type="password" minlength="8" required />

          <label class="row" style="margin-top:10px">
            <input name="tosAccepted" type="checkbox" required />
            <span>${t("acceptTerms")} <a href="/TERMS.MD">${t("terms")}</a> ${t("and")} <a href="/PRIVACY.MD">${t("privacy")}</a></span>
          </label>

          <div class="row" style="margin-top:12px">
            <button class="primary" type="submit" ${status === "loading" ? "disabled" : ""}>${t("signUp")}</button>
          </div>

          <small class="muted">${t("calling")}: <code>POST /api/v1/users</code></small>
        </form>
      </section>
    `;

    const form = this.shadowRoot.querySelector("#f");
    const usernameInput = this.shadowRoot.querySelector("#username");
    const passwordInput = this.shadowRoot.querySelector("#password");
    const tosInput = this.shadowRoot.querySelector('input[name="tosAccepted"]');

    form.onsubmit = async (e) => {
      e.preventDefault();

      usernameInput.setCustomValidity("");
      passwordInput.setCustomValidity("");
      tosInput.setCustomValidity("");

      if (!usernameInput.value.trim()) {
        usernameInput.setCustomValidity(t("requiredField"));
      } else if (usernameInput.value.trim().length < 3) {
        usernameInput.setCustomValidity(t("usernameTooShort"));
      }

      if (!passwordInput.value.trim()) {
        passwordInput.setCustomValidity(t("requiredField"));
      } else if (passwordInput.value.trim().length < 8) {
        passwordInput.setCustomValidity(t("passwordTooShort"));
      }

      if (!tosInput.checked) {
        tosInput.setCustomValidity(t("acceptTermsRequired"));
      }

      if (!form.reportValidity()) return;

      const fd = new FormData(form);

      await userStore.signup({
        username: String(fd.get("username") || ""),
        password: String(fd.get("password") || ""),
        tosAccepted: Boolean(fd.get("tosAccepted"))
      });

      form.reset();
    };

    usernameInput.oninput = () => usernameInput.setCustomValidity("");
    passwordInput.oninput = () => passwordInput.setCustomValidity("");
    tosInput.onchange = () => tosInput.setCustomValidity("");
  }
}

customElements.define("user-create", UserCreate);