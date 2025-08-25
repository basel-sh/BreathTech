// SkinChat.js
import React, { useState, useEffect } from "react";
import "./SkinChat.css";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

function SkinChat() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Always fetch the latest user info
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoadingUser(false);
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
        } else {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    window.addEventListener("focus", fetchUser); // refresh on tab focus
    return () => window.removeEventListener("focus", fetchUser);
  }, []);

  const skinDiagnosisMap = {
    0: "Acne",
    1: "Bacterial Impetigo/Cellulitis",
    2: "Bad Image",
    3: "Eczema/Dermatitis",
    4: "Other/Uncertain",
    5: "Psoriasis",
    6: "Suspicious Mole",
    7: "Tinea/Ringworm",
    8: "Urticaria/Hives",
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPrediction(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image first!");
    if (!user) return alert("⚠️ You must be logged in to use this feature.");
    if (user.role === "patient" && !user.permissions?.skinChat) {
      return alert("⚠️ Patients are not allowed to use Skin AI.");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/api/skin-diagnose`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Skin diagnosis failed");
      }

      const data = await response.json();
      const diagnosis =
        data.diagnosis in skinDiagnosisMap
          ? skinDiagnosisMap[data.diagnosis]
          : "Unknown";

      setPrediction(diagnosis);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) return <p>Loading user info...</p>;

  return (
    <div className="skinchat-container">
      <h2>Skin AI Assistant</h2>
      <p>Upload a photo of the affected area</p>

      <div className="chat-input-container">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="skinFileInput"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label htmlFor="skinFileInput" className="file-btn">
            {file ? file.name : "Choose Image"}
          </label>
        </div>
        <button className="send-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Upload & Diagnose"}
        </button>
      </div>

      {prediction && (
        <div className="chat-messages">
          <div className="message bot">Predicted Condition: {prediction}</div>
        </div>
      )}
    </div>
  );
}

export default SkinChat;
