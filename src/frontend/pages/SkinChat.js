import React, { useState, useEffect } from "react";
import "./SkinChat.css";

function SkinChat() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedFile, setCapturedFile] = useState(null);

  // Map for skin diseases
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

  // Detect mobile devices
  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setCapturedFile(null);
    setPrediction(null);
  };

  const handleCapture = (e) => {
    if (e.target.files[0]) {
      setCapturedFile(e.target.files[0]);
      setFile(null);
      setPrediction(null);
    }
  };

  const handleUpload = async (inputFile) => {
    if (!inputFile) return alert("Please select or capture an image first!");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", inputFile);

      const response = await fetch(
        "https://breath-tech-backend-production.up.railway.app/api/skin-diagnose",
        { method: "POST", body: formData }
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
      <p>Upload or capture a photo of the affected area</p>

      <div className="chat-input-container">
        {/* File Upload */}
        <div className="file-input-wrapper">
          <input
            type="file"
            id="skinFileInput"
            accept="image/*"
            onChange={handleFileChange}
            disabled={cameraActive}
          />
          <label
            htmlFor="skinFileInput"
            className="file-btn"
            style={{ opacity: cameraActive ? 0.5 : 1 }}
          >
            {file ? file.name : "Choose Image"}
          </label>
        </div>

        {/* Camera Capture (Mobile only) */}
        {isMobile && (
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="cameraInput"
              onChange={handleCapture}
              disabled={file !== null}
            />
            <label
              htmlFor="cameraInput"
              className="file-btn"
              style={{ opacity: file ? 0.5 : 1 }}
            >
              {capturedFile ? capturedFile.name : "Capture with Camera"}
            </label>
          </div>
        )}

        {/* Upload & Diagnose */}
        <button
          className="send-btn"
          onClick={() => handleUpload(file || capturedFile)}
          disabled={loading || (!file && !capturedFile)}
        >
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
