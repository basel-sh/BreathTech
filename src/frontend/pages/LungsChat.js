// LungsChat.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LungsChat.css";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

function LungsChat() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Fetch latest user info and redirect if deleted or role/permissions changed
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        navigate("/"); // redirect if not logged in
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

          // redirect if role is patient or lungsChat permission is false
          if (
            data.user.role === "patient" &&
            !data.user.permissions?.lungsChat
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

  const diagnosisMap = {
    0: "Healthy",
    1: "URTI",
    2: "Asthma",
    3: "COPD",
    4: "LRTI",
    5: "Bronchiectasis",
    6: "Pneumonia",
    7: "Bronchiolitis",
  };

  const patientInfo = {
    Age: 25,
    BMI: 22,
    Is_Adult: 1,
    Has_Crackles: 0,
    Has_Wheezes: 0,
    SBP: 120,
    DBP: 80,
    HR: 75,
    SpO2: 98,
    Sex_M: 1,
    Chest_Location_Al: 0,
    Chest_Location_Ar: 0,
    Chest_Location_Pl: 0,
    Chest_Location_Pr: 0,
    Chest_Location_Ll: 0,
    Chest_Location_Lr: 1,
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPrediction(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an audio file first!");
    if (!user) return alert("⚠️ You must be logged in to use this feature.");
    if (user.role === "patient" && !user.permissions?.lungsChat) {
      return alert("⚠️ Patients are not allowed to use Lungs AI.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.entries(patientInfo).forEach(([key, value]) =>
        formData.append(key, value)
      );

      const response = await fetch(`${BASE_URL}/api/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Prediction failed");
      }

      const data = await response.json();
      const diagnosis =
        data.prediction in diagnosisMap
          ? diagnosisMap[data.prediction]
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
    <div className="lungschat-container">
      <h2>Lungs AI Assistant</h2>
      <p>Upload your lung sound recording (WAV/MP3)</p>

      <div className="chat-input-container">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="fileInput"
            accept="audio/*"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="file-btn">
            {file ? file.name : "Choose File"}
          </label>
        </div>
        <button className="send-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Predicting..." : "Upload & Predict"}
        </button>
      </div>

      {prediction && (
        <div className="chat-messages">
          <div className="message bot">Predicted Diagnosis: {prediction}</div>
        </div>
      )}
    </div>
  );
}

export default LungsChat;
