import { useState, useEffect, cloneElement } from "react";
import PropTypes from "prop-types";
import "./AuthGate.css";

/** Must match MIN_PASSWORD_LENGTH in routes/auth.js. */
const MIN_PASSWORD_LENGTH = 8;

async function api(path, body) {
  const res = await fetch(`/api${path}`, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const registering = mode === "register";

  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Enter a username and password");
      return;
    }
    if (registering && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    try {
      const u = await api(registering ? "/auth/register" : "/auth/login", {
        username,
        password,
      });
      setUser(u);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  if (checking) return <div className="auth-loading">Loading…</div>;

  if (!user) {
    return (
      <main className="auth">
        <form className="auth__card" onSubmit={handleSubmit}>
          <h1 className="auth__brand">PaletteForge</h1>
          <h2 className="auth__title">
            {registering ? "Create account" : "Log in"}
          </h2>

          <label className="auth__label" htmlFor="auth-username">
            Username
          </label>
          <input
            id="auth-username"
            className="auth__input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="auth__label" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            className="auth__input"
            type="password"
            autoComplete={registering ? "new-password" : "current-password"}
            aria-describedby={registering ? "auth-pwhint" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {registering && (
            <p className="auth__hint" id="auth-pwhint">
              At least {MIN_PASSWORD_LENGTH} characters. Passwords are stored
              hashed with bcrypt, never in plain text.
            </p>
          )}

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button className="auth__btn" type="submit">
            {registering ? "Sign up" : "Log in"}
          </button>
          <button
            className="auth__switch"
            type="button"
            onClick={() => {
              setMode(registering ? "login" : "register");
              setUsername("");
              setPassword("");
              setError(null);
            }}
          >
            {registering
              ? "Have an account? Log in"
              : "Need an account? Sign up"}
          </button>
        </form>
      </main>
    );
  }

  // Hand the authenticated user and the logout handler down to App, which
  // renders the signed-in bar as part of its own navigation.
  return cloneElement(children, { authUser: user, onLogout: logout });
}

AuthGate.propTypes = {
  children: PropTypes.element.isRequired,
};

export default AuthGate;
