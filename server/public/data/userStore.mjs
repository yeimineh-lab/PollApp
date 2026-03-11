import { request } from "./api.mjs";

const TOKEN_KEY = "pollapp_token";

class UserStore extends EventTarget {
  state = {
    token: localStorage.getItem(TOKEN_KEY),
    me: null,
    status: "idle",
    error: null,
    lastAction: null,
  };

  #set(patch) {
    this.state = { ...this.state, ...patch };
    this.dispatchEvent(new Event("change"));
  }

  #saveToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async bootstrap() {
    if (!this.state.token) return null;

    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "bootstrap" },
    });

    try {
      const me = await request("/api/v1/auth/me", { token: this.state.token });
      this.#set({
        me,
        status: "idle",
        lastAction: { name: "bootstrap", ok: true, result: me },
      });
      return me;
    } catch (error) {
      this.#saveToken(null);
      this.#set({
        token: null,
        me: null,
        status: "idle",
        error: null,
        lastAction: { name: "bootstrap", ok: false },
      });
      return null;
    }
  }

  async signup(payload) {
    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "signup", endpoint: "POST /api/v1/users" },
    });

    try {
      const created = await request("/api/v1/users", {
        method: "POST",
        body: payload,
      });

      this.#set({
        status: "idle",
        lastAction: { name: "signup", ok: true, result: created },
      });

      return created;
    } catch (error) {
      this.#set({
        status: "error",
        error: error?.message ?? String(error),
        lastAction: { name: "signup", ok: false },
      });
      throw error;
    }
  }

  async login(payload) {
    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "login", endpoint: "POST /api/v1/auth/login" },
    });

    try {
      const data = await request("/api/v1/auth/login", {
        method: "POST",
        body: payload,
      });

      this.#saveToken(data.token);

      this.#set({
        token: data.token,
        me: data.user,
        status: "idle",
        lastAction: { name: "login", ok: true, result: data.user },
      });

      return data;
    } catch (error) {
      this.#set({
        status: "error",
        error: error?.message ?? String(error),
        lastAction: { name: "login", ok: false },
      });
      throw error;
    }
  }

  async loadMe() {
    if (!this.state.token) return null;

    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "loadMe", endpoint: "GET /api/v1/auth/me" },
    });

    try {
      const me = await request("/api/v1/auth/me", { token: this.state.token });

      this.#set({
        me,
        status: "idle",
        lastAction: { name: "loadMe", ok: true, result: me },
      });

      return me;
    } catch (error) {
      this.#set({
        status: "error",
        error: error?.message ?? String(error),
        lastAction: { name: "loadMe", ok: false },
      });
      throw error;
    }
  }

  async logout() {
    if (!this.state.token) return;

    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "logout", endpoint: "POST /api/v1/auth/logout" },
    });

    try {
      await request("/api/v1/auth/logout", {
        method: "POST",
        token: this.state.token,
      });

      this.#saveToken(null);

      this.#set({
        token: null,
        me: null,
        status: "idle",
        lastAction: { name: "logout", ok: true },
      });
    } catch (error) {
      this.#set({
        status: "error",
        error: error?.message ?? String(error),
        lastAction: { name: "logout", ok: false },
      });
      throw error;
    }
  }

  async updateMe(patch) {
    if (!this.state.token) throw new Error("Du må være logget inn for å redigere.");

    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "updateMe", endpoint: "PATCH /api/v1/users/me" },
    });

    try {
      const me = await request("/api/v1/users/me", {
        method: "PATCH",
        body: patch,
        token: this.state.token,
      });

      this.#set({
        me,
        status: "idle",
        lastAction: { name: "updateMe", ok: true, result: me },
      });

      return me;
    } catch (error) {
      this.#set({
        status: "error",
        error: error?.message ?? String(error),
        lastAction: { name: "updateMe", ok: false },
      });
      throw error;
    }
  }

  async deleteMe() {
    if (!this.state.token) throw new Error("Du må være logget inn for å slette konto.");

    this.#set({
      status: "loading",
      error: null,
      lastAction: { name: "deleteMe", endpoint: "DELETE /api/v1/users/me" },
    });

    try {
      const out = await request("/api/v1/users/me", {
        method: "DELETE",
        token: this.state.token,
      });

      this.#saveToken(null);

      this.#set({
        token: null,
        me: null,
        status: "idle",
        lastAction: { name: "deleteMe", ok: true, result: out },
      });

      return out;
    } catch (error) {
      this.#set({
        status: "error",
        error: error?.message ?? String(error),
        lastAction: { name: "deleteMe", ok: false },
      });
      throw error;
    }
  }
}

export const userStore = new UserStore();