import React, { useState } from "react";
import "./SkinChat.css";

function SkinChat() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Map for skin diseases (adjust to your model labels)
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
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://breath-tech-backend-production.up.railway.app/api/skin-diagnose",
        {
          method: "POST",
          body: formData,
        }
      );

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
