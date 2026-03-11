import { userStore } from "../data/userStore.mjs";
import { t } from "../i18n/index.mjs";

class UserDelete extends HTMLElement {
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
    const { status, token } = userStore.state;
    const loggedIn = Boolean(token);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="../app.css">
      <section class="panel">
        <h2>${t("deleteAccount")}</h2>
        <p class="muted">${t("requiresLogin")}</p>

        <div class="row">
          <button class="danger" id="del" ${!loggedIn || status === "loading" ? "disabled" : ""}>
            ${t("deleteMyAccount")}
          </button>
        </div>
      </section>
    `;

    this.shadowRoot.querySelector("#del").onclick = async () => {
      if (!confirm(t("confirmDelete"))) return;
      await userStore.deleteMe();
    };
  }
}

customElements.define("user-delete", UserDelete);