import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import "./ChatPage.css";

function AdminChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const threadsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(threadsQuery, (snapshot) => {
      setThreads(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", selectedThread.id, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [selectedThread]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !selectedThread) return;

    const threadRef = doc(db, "chats", selectedThread.id);
    await addDoc(collection(db, "chats", selectedThread.id, "messages"), {
      sender: "admin",
      text: trimmed,
      createdAt: serverTimestamp(),
      senderName: "Admin",
    });

    await setDoc(
      threadRef,
      {
        lastMessage: trimmed,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setMessage("");
  };

  return (
    <div className="chat-page">
      <div className="admin-header">
        <div className="header-left">
          <span className="admin-eyebrow">Admin Panel</span>
          <h1>GentleCuts Admin Chat</h1>
          <p className="header-time">Support customer messaging</p>
        </div>

        <div className="admin-bottom-nav">
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/dashboard" ? "active" : ""}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/completed-bookings" ? "active" : ""}`}
            onClick={() => navigate("/admin/completed-bookings")}
          >
            Completed
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/chat" ? "active" : ""}`}
            onClick={() => navigate("/admin/chat")}
          >
            Chat
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${location.pathname === "/admin/profile" ? "active" : ""}`}
            onClick={() => navigate("/admin/profile")}
          >
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
              <span className="chat-eyebrow">Conversations</span>
              <h2>Customer Chats</h2>
            </div>

            {threads.length === 0 ? (
              <div className="chat-info-card">
                <span>No active conversations</span>
                <strong>Waiting for customer messages</strong>
                <p>Customer chats will appear here once they start messaging.</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`chat-contact ${selectedThread?.id === thread.id ? "active" : ""}`}
                  onClick={() => handleSelectThread(thread)}
                >
                  <div className="chat-avatar">
                    {thread.userName ? thread.userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3>{thread.userName || "Customer"}</h3>
                    <p>{thread.userEmail || "No email"}</p>
                  </div>
                  <span className="online-dot"></span>
                </div>
              ))
            )}
          </aside>

          <section className="chat-panel">
            <div className="chat-panel-header">
              <div className="chat-avatar">GC</div>
              <div>
                <h2>{selectedThread?.userName || "Select a customer"}</h2>
                <p>{selectedThread ? selectedThread.userEmail : "Choose a conversation from the left."}</p>
              </div>
            </div>

            <div className="messages-area">
              {!selectedThread ? (
                <div className="message-date">Select a chat to begin</div>
              ) : messages.length === 0 ? (
                <div className="message-date">No messages yet. Start the conversation.</div>
              ) : (
                <>
                  <div className="message-date">Conversation</div>
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`message-row ${item.sender === "admin" ? "from-user" : "from-support"}`}
                    >
                      <div className="message-bubble">
                        <p>{item.text}</p>
                        <span>{item.createdAt?.toDate?.().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || ""}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                placeholder={selectedThread ? "Type your message..." : "Select a customer first..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!selectedThread}
              />
              <button type="submit" disabled={!message.trim() || !selectedThread}>
                Send
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

export default AdminChatPage;
