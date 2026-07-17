import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./AuthGate.css";

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

  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function submit() {
    setError(null);
    if (!username || !password) {
      setError("Enter a username and password");
      return;
    }
    try {
      const u = await api(mode === "login" ? "/auth/login" : "/auth/register", {
        username,
        password,
      });
      setUser(u);
      setPassword("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  if (checking) return <div className="auth-loading">Loading…</div>;

  if (!user) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__brand">PaletteForge</h1>
          <h2 className="auth__title">
            {mode === "login" ? "Log in" : "Create account"}
          </h2>

          <input
            className="auth__input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="auth__input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="button" onClick={submit}>
            {mode === "login" ? "Log in" : "Sign up"}
          </button>

          <button
            className="auth__switch"
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setUsername("");
              setPassword("");
              setError(null);
            }}
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Have an account? Log in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth__bar">
        <span className="auth__who">Signed in as {user.username}</span>
        <button type="button" className="auth__logout" onClick={logout}>
          Log out
        </button>
      </div>
      {children}
    </>
  );
}

AuthGate.propTypes = {
  children: PropTypes.node,
};

AuthGate.defaultProps = {
  children: null,
};

export default AuthGate;
