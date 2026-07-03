import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../components/LoginPage.css";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profileSnap = await getDoc(doc(db, "users", userCredential.user.uid));
      const role = profileSnap.exists() ? profileSnap.data().role : "user";

      if (role !== "admin") {
        await signOut(auth);
        setError("This account is not an admin account.");
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.code || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">GentleCuts Admin</h1>
        <p className="login-subtitle">Admin Panel Login</p>

        <form onSubmit={handleAdminLogin} className="login-form">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Checking..." : "Admin Login"}
          </button>
        </form>

        <p className="signup-text">
          User login? <a href="/login">Go to User Login</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;
