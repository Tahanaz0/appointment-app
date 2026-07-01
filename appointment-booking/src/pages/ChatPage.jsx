import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./ChatPage.css";

function ChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: 1,
      sender: "support",
      text: "Hi, welcome to GentleCuts. How can we help with your appointment today?",
      time: "09:30 AM",
    },
    {
      id: 2,
      sender: "user",
      text: "I want to confirm my haircut booking time.",
      time: "09:32 AM",
    },
    {
      id: 3,
      sender: "support",
      text: "Sure. Please share your name or phone number and we will check your booking.",
      time: "09:33 AM",
    },
  ];

  const quickReplies = [
    "Confirm booking",
    "Change time",
    "Ask price",
    "Cancel booking",
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    setMessage("");
  };

  return (
    <div className="chat-page">
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

          <button className="nav-btn active" onClick={() => navigate("/chat")}>
            Chat
          </button>

          <button className="nav-btn" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <main className="chat-content">
        <section className="chat-shell">
          <aside className="chat-sidebar">
            <div className="chat-sidebar-header">
              <span className="chat-eyebrow">Messages</span>
              <h2>Salon Support</h2>
            </div>

            <div className="chat-contact active">
              <div className="chat-avatar">GC</div>
              <div>
                <h3>GentleCuts Desk</h3>
                <p>Usually replies in 5 minutes</p>
              </div>
              <span className="online-dot"></span>
            </div>

            <div className="chat-info-card">
              <span>Today</span>
              <strong>Need help with bookings?</strong>
              <p>Ask about appointment time, service prices, barber availability, or changes.</p>
            </div>
          </aside>

          <section className="chat-panel">
            <div className="chat-panel-header">
              <div className="chat-avatar">GC</div>
              <div>
                <h2>GentleCuts Desk</h2>
                <p>Online now</p>
              </div>
            </div>

            <div className="messages-area">
              <div className="message-date">Today</div>

              {conversations.map((item) => (
                <div
                  className={`message-row ${item.sender === "user" ? "from-user" : "from-support"}`}
                  key={item.id}
                >
                  <div className="message-bubble">
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-replies">
              {quickReplies.map((reply) => (
                <button key={reply} onClick={() => setMessage(reply)}>
                  {reply}
                </button>
              ))}
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" disabled={!message.trim()}>
                Send
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

export default ChatPage;
