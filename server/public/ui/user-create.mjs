class UserCreate extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="panel-form" id="signupForm" novalidate>
        <label for="signupUsername">Username</label>
        <input
          id="signupUsername"
          name="username"
          type="text"
          minlength="3"
          autocomplete="username"
          required
        />

        <label for="signupPassword">Password</label>
        <input
          id="signupPassword"
          name="password"
          type="password"
          minlength="8"
          autocomplete="new-password"
          required
        />

        <div class="consent-row">
          <input
            id="signupConsent"
            name="consent"
            type="checkbox"
            required
          />
          <label for="signupConsent" class="consent-label">
            I accept the
            <a href="/terms.html" target="_blank" rel="noopener">Terms of Service</a>
            and
            <a href="/privacy.html" target="_blank" rel="noopener">Privacy Policy</a>
          </label>
        </div>

        <div class="row">
          <button type="submit">Sign up</button>
        </div>
      </form>
    `;

    const form = this.querySelector("#signupForm");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      this.dispatchEvent(
        new CustomEvent("user-create-submit", {
          bubbles: true,
          composed: true,
          detail: {
            username: String(formData.get("username") ?? "").trim(),
            password: String(formData.get("password") ?? "").trim(),
            consent: Boolean(formData.get("consent")),
            form,
          },
        }),
      );
    });
  }
}

if (!customElements.get("user-create")) {
  customElements.define("user-create", UserCreate);
}