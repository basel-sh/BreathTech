// HeartAnalysis.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeartAnalysis.css";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

function HeartAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

          // redirect if role is patient or heartChat permission is false
          if (
            data.user.role === "patient" ||
            !data.user.permissions?.heartChat
          ) {
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
    window.addEventListener("focus", fetchUser); // refresh on tab focus
    return () => window.removeEventListener("focus", fetchUser);
  }, [navigate]);

  const heartDiagnosisMap = {
    0: "Normal",
    1: "Arrhythmia",
    2: "Atrial Fibrillation",
    3: "Bradycardia",
    4: "Tachycardia",
    5: "Other/Unknown",
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPrediction(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    if (!user) return alert("⚠️ You must be logged in to use this feature.");
    if (user.role === "patient" && !user.permissions?.heartChat) {
      return alert("⚠️ Patients are not allowed to use Heart AI.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/api/heart-analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Heart analysis failed");
      }

      const data = await response.json();
      const diagnosis =
        data.diagnosis in heartDiagnosisMap
          ? heartDiagnosisMap[data.diagnosis]
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
    <div className="heart-analysis-container">
      <h2>Heart AI Assistant</h2>
      <p>Upload your heart data (ECG/audio/image)</p>

      <div className="chat-input-container">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="heartFileInput"
            accept="*/*"
            onChange={handleFileChange}
          />
          <label htmlFor="heartFileInput" className="file-btn">
            {file ? file.name : "Choose File"}
          </label>
        </div>
        <button className="send-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Upload & Analyze"}
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

export default HeartAnalysis;
