import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(loginMode === "admin" ? "/admin/dashboard" : "/home");
    } catch (err) {
      console.log(err);
      setError(err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">GentleCuts</h1>
        <p className="login-subtitle">Welcome Back</p>

        <div className="login-mode-switch">
          <button
            type="button"
            className={`mode-btn ${loginMode === "user" ? "active" : ""}`}
            onClick={() => setLoginMode("user")}
          >
            User Login
          </button>
          <button
            type="button"
            className={`mode-btn ${loginMode === "admin" ? "active" : ""}`}
            onClick={() => setLoginMode("admin")}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : loginMode === "admin" ? "Admin Login" : "User Login"}
          </button>
        </form>

        <p className="signup-text">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
