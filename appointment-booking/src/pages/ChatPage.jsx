import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./ChatPage.css";
import Navbar from "../components/Navbar";

function ChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [threadInfo, setThreadInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const quickReplies = [
    "Confirm booking",
    "Change time",
    "Ask price",
    "Cancel booking",
  ];

  useEffect(() => {
    const initializeThread = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userEmail = user.email || "customer@example.com";
      const userName = user.displayName || user.email?.split("@")[0] || "Customer";
      const threadKey = `user-${user.uid}`;
      const threadRef = doc(db, "chats", threadKey);
      const threadSnap = await setDoc(
        threadRef,
        {
          userId: user.uid,
          userEmail,
          userName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: "",
        },
        { merge: true }
      );

      setThreadId(threadKey);
      setThreadInfo({ userEmail, userName });

      const messagesQuery = query(collection(db, "chats", threadKey, "messages"), orderBy("createdAt"));
      const unsub = onSnapshot(messagesQuery, (snapshot) => {
        setMessages(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setLoading(false);
      });

      return () => unsub();
    };

    const unsubscribePromise = initializeThread();
    return () => {
      unsubscribePromise?.then((cleanup) => cleanup?.());
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !threadId) return;

    const threadRef = doc(db, "chats", threadId);
    await addDoc(collection(db, "chats", threadId, "messages"), {
      sender: "user",
      text: trimmed,
      createdAt: serverTimestamp(),
      senderName: threadInfo?.userName || "You",
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
    <Navbar onLogout={handleLogout} />
      <header className="chat-header">
        <h1>💬 Chat with GentleCuts</h1>
        <p>Get assistance with your appointments and inquiries.</p>
      </header>

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

              {loading ? (
                <div className="message-date">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="message-date">Start a conversation with the salon.</div>
              ) : (
                messages.map((item) => (
                  <div
                    className={`message-row ${item.sender === "user" ? "from-user" : "from-support"}`}
                    key={item.id}
                  >
                    <div className="message-bubble">
                      <p>{item.text}</p>
                      <span>
                        {item.createdAt?.toDate?.().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) || ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
