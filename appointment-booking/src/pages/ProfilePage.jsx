import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./ProfilePage.css";
import Navbar from "../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { FaClock } from "react-icons/fa";
function ProfilePage({ user, appointments = [], isAdmin = false }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("21:00");
  const [savingTiming, setSavingTiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // User profile
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        const profileData = profileSnap.exists() ? profileSnap.data() : null;

        setProfile(profileData);
        setDisplayName(profileData?.fullName || user?.displayName || "");

        // ✅ Salon settings
        const settingsSnap = await getDoc(doc(db, "settings", "salon"));

        if (settingsSnap.exists()) {
          setOpeningTime(settingsSnap.data().openingTime || "09:00");
          setClosingTime(settingsSnap.data().closingTime || "21:00");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!displayName.trim()) {
      setError("Name is required.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: displayName.trim(),
          email: profile?.email || user?.email || "",
          updatedAt: new Date(),
        },
        { merge: true },
      );

      if (password) {
        const emailAddress =
          profile?.email || user?.email || auth.currentUser?.email;

        if (!emailAddress) {
          throw new Error("No email address found to send the reset link.");
        }

        await sendPasswordResetEmail(auth, emailAddress);
        setMessage(
          "Password reset link sent to your email. Please check your inbox to choose a new password.",
        );
      } else {
        setMessage("Profile updated successfully.");
      }

      setProfile((prev) => ({ ...prev, fullName: displayName.trim() }));
      setPassword("");
      setConfirmPassword("");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(profile?.fullName || user?.displayName || "");
    setPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setError("");
    setMessage("");
  };
  const handleSaveTiming = async () => {
    try {
      setSavingTiming(true);

      await setDoc(
        doc(db, "settings", "salon"),
        {
          openingTime,
          closingTime,
        },
        { merge: true },
      );

      setMessage("Salon timing updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to update salon timing.");
    } finally {
      setSavingTiming(false);
    }
  };

  const email = profile?.email || user?.email || "No email";
  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString()
    : "Recently joined";

  return (
    <div className="profile-page">
      {isAdmin && <AdminNavbar />}
      {!isAdmin && <Navbar />}
      {/* <header className="profile-header">
        <h1>👤 Profile</h1>
        <p>Manage your account details and view your recent bookings.</p>
      </header> */}

      <main className="profile-content">
        {loading ? (
          <div className="profile-panel">Loading profile...</div>
        ) : (
          <>
            <section className="profile-panel profile-card">
              <div className="profile-avatar">
                {email.charAt(0).toUpperCase()}
              </div>
              <div className="profile-card-details">
                <span className="profile-eyebrow">
                  {isAdmin ? "Admin account" : "Logged in user"}
                </span>
                <h2>{profile?.fullName || user?.displayName || email}</h2>
                <p>{email}</p>
                <p>Member since {memberSince}</p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  className="profile-card-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </section>

            {error && <p className="profile-error">{error}</p>}
            {message && <p className="profile-success">{message}</p>}

            <section className="profile-grid">
              <div className="profile-panel">
                <span className="profile-label">Email</span>
                <strong>{email}</strong>
              </div>
              <div className="profile-panel">
                <span className="profile-label">Account Type</span>
                <strong>{isAdmin ? "Administrator" : "Customer"}</strong>
              </div>
              <div className="profile-panel">
                <span className="profile-label">Total Bookings</span>
                <strong>{appointments.length}</strong>
              </div>
            </section>

            {isAdmin && (
              <>
                <section className="profile-panel profile-admin-overview">
                  <div className="profile-section-header">
                    <div>
                      <span className="profile-eyebrow">Admin overview</span>
                      <h3>Access & permissions</h3>
                    </div>
                  </div>
                  <div className="profile-admin-pill-group">
                    <span className="profile-admin-pill">Manage bookings</span>
                    <span className="profile-admin-pill">Control barbers</span>
                    <span className="profile-admin-pill">Update gallery</span>
                    <span className="profile-admin-pill">
                      Chat with clients
                    </span>
                  </div>
                </section>
                <section className="profile-panel">
                  <div className="profile-section-header">
                    <div>
                      <span className="profile-eyebrow">Salon Settings</span>
                      <h3>Opening Hours</h3>
                    </div>
                  </div>

                  <div className="timing-grid">
                    <div>
                      <label>Opening Time</label>

                      <div className="time-input">
                       

                        <input
                          type="time"
                          value={openingTime}
                          onChange={(e) => setOpeningTime(e.target.value)}
                        />
                         <FaClock className="time-icon" />
                      </div>
                    </div>

                    <div>
                      <label>Closing Time</label>

                      <div className="time-input">
                        <FaClock className="time-icon" />

                        <input
                          type="time"
                          value={closingTime}
                          onChange={(e) => setClosingTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className="save-timing-btn"
                    onClick={handleSaveTiming}
                    disabled={savingTiming}
                  >
                    {savingTiming ? "Saving..." : "Save Timing"}
                  </button>
                </section>
              </>
            )}

            {isEditing && (
              <div
                className="profile-modal-backdrop"
                onClick={handleCancelEdit}
              >
                <div
                  className="profile-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="profile-modal-header">
                    <h3>Edit Profile</h3>
                    <button
                      type="button"
                      className="profile-modal-close"
                      onClick={handleCancelEdit}
                    >
                      ×
                    </button>
                  </div>

                  <form
                    className="profile-edit-form"
                    onSubmit={handleSaveProfile}
                  >
                    <label>
                      Name
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      New Password
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                      />
                    </label>

                    <label>
                      Confirm New Password
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </label>

                    <p className="profile-password-help">
                      If you enter a new password, a reset link will be sent to
                      your email so you can set it securely.
                    </p>

                    <div className="profile-edit-actions">
                      <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="profile-cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <section className="profile-panel">
              <div className="profile-section-header">
                <h3>Recent Bookings</h3>
                <button type="button" onClick={() => navigate("/book")}>
                  View All
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="profile-empty">This user has no bookings yet.</p>
              ) : (
                <div className="profile-bookings">
                  {appointments.slice(0, 3).map((appointment) => (
                    <article key={appointment.id} className="profile-booking">
                      <div>
                        <strong>{appointment.service || "Service"}</strong>
                        <p>
                          {appointment.barber ||
                            appointment.doctor ||
                            "Barber not selected"}
                        </p>
                      </div>
                      <span>
                        {appointment.date} {appointment.time}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ProfilePage;
