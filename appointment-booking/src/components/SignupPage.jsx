import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./SignupPage.css";

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(phoneNumber.replace(/\s+/g, ""))) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName.trim(),
        email: user.email,
        phoneNumber: phoneNumber.trim(),
        role: isAdmin ? "admin" : "user",
        createdAt: new Date()
      });

      navigate(isAdmin ? "/admin/dashboard" : "/home");
    } catch (err) {
      console.log(err);
      setError(err.code || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">GentleCuts</h1>
        <p className="signup-subtitle">Create Your Account</p>

        <form onSubmit={handleSignup} className="signup-form">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            required
          />

          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin((prev) => !prev)}
            />
            <span>Create admin account</span>
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="login-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
