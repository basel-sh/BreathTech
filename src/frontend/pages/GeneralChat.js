// GeneralChat.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GeneralChat.css";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

function GeneralChat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // ✅ Always fetch latest user info and auto-refresh
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        navigate("/"); // redirect if no token
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));

          // redirect if role becomes patient (optional restrictions)
          if (data.user.role === "patient") {
            navigate("/");
          }
        } else {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/"); // redirect if user deleted
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
        navigate("/"); // redirect on error
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    window.addEventListener("focus", fetchUser); // auto-refresh on tab focus
    return () => window.removeEventListener("focus", fetchUser);
  }, [navigate]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory((prev) => [...prev, { from: "user", text: message }]);
    setMessage("");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { from: "bot", text: `AI Response to: "${message}"` },
      ]);
    }, 500);
  };

  if (loadingUser) return <p>Loading user info...</p>;

  return (
    <div className="general-chat-container">
      <h2>General AI Chat</h2>

      <div className="chat-history">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          placeholder="Type your question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default GeneralChat;
