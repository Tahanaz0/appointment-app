import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./ProfilePage.css";

function ProfilePage({ user, appointments = [] }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        setProfile(profileSnap.exists() ? profileSnap.data() : null);
      } catch (err) {
        console.error(err);
        setError("Profile data load nahi ho saka");
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

  const email = profile?.email || user?.email || "No email";
  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString()
    : "Recently joined";

  return (
    <div className="profile-page">
      <div className="home-header">
        <div className="header-left">
          <h1 className="brand-title">GentleCuts</h1>
          <p className="header-time">Available 9:00 AM - 9:00 PM</p>
        </div>

        <div className="bottom-nav">
          <button className="nav-btn" onClick={() => navigate("/home")}>
            Home
          </button>
          <button className="nav-btn" onClick={() => navigate("/book")}>
            Book
          </button>
          <button className="nav-btn" onClick={() => navigate("/chat")}>
            Chat
          </button>
          <button className="nav-btn active" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <main className="profile-content">
        {loading ? (
          <div className="profile-panel">Loading profile...</div>
        ) : (
          <>
            <section className="profile-panel profile-card">
              <div className="profile-avatar">
                {email.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="profile-eyebrow">Logged in user</span>
                <h2>{email}</h2>
                <p>Member since {memberSince}</p>
              </div>
            </section>

            {error && <p className="profile-error">{error}</p>}

            <section className="profile-grid">
              <div className="profile-panel">
                <span className="profile-label">Email</span>
                <strong>{email}</strong>
              </div>
              <div className="profile-panel">
                <span className="profile-label">User ID</span>
                <strong>{user?.uid}</strong>
              </div>
              <div className="profile-panel">
                <span className="profile-label">Total Bookings</span>
                <strong>{appointments.length}</strong>
              </div>
            </section>

            <section className="profile-panel">
              <div className="profile-section-header">
                <h3>Recent Bookings</h3>
                <button type="button" onClick={() => navigate("/book")}>
                  View All
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="profile-empty">Abhi is user ki koi booking nahi hai.</p>
              ) : (
                <div className="profile-bookings">
                  {appointments.slice(0, 3).map((appointment) => (
                    <article key={appointment.id} className="profile-booking">
                      <div>
                        <strong>{appointment.service || "Service"}</strong>
                        <p>{appointment.barber || appointment.doctor || "Barber not selected"}</p>
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
