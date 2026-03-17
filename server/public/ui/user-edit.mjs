class UserEdit extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="panel-form" id="profileForm" novalidate>
        <label for="profileUsername">New username (optional)</label>
        <input
          id="profileUsername"
          name="newUsername"
          type="text"
          minlength="3"
          autocomplete="username"
        />

        <label for="profilePassword">New password (optional)</label>
        <input
          id="profilePassword"
          name="newPassword"
          type="password"
          minlength="8"
          autocomplete="new-password"
        />

        <div class="row">
          <button type="submit">Save changes</button>
        </div>
      </form>
    `;

    const form = this.querySelector("#profileForm");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      this.dispatchEvent(
        new CustomEvent("user-edit-submit", {
          bubbles: true,
          composed: true,
          detail: {
            newUsername: String(formData.get("newUsername") ?? "").trim(),
            newPassword: String(formData.get("newPassword") ?? "").trim(),
            form,
          },
        }),
      );
    });
  }
}

if (!customElements.get("user-edit")) {
  customElements.define("user-edit", UserEdit);
}