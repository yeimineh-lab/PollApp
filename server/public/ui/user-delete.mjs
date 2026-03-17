class UserDelete extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="row">
        <button id="deleteAccountBtn" class="danger" type="button">
          Delete my account
        </button>
      </div>
    `;

    const button = this.querySelector("#deleteAccountBtn");

    button?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("user-delete-click", {
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

if (!customElements.get("user-delete")) {
  customElements.define("user-delete", UserDelete);
}