import React, { useState, useEffect, useRef } from "react";
import "./SkinChat.css";

function SkinChat() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [capturedFile, setCapturedFile] = useState(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Skin disease labels
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

  // Start camera on mobile
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      } catch (err) {
        alert("Camera access denied or unavailable");
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const photoFile = new File([blob], "captured.jpg", {
        type: "image/jpeg",
      });
      setCapturedFile(photoFile);
      setFile(null);
      setPrediction(null);
      stopCamera();
    }, "image/jpeg");
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setCapturedFile(null);
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
            disabled={cameraActive || capturedFile}
          />
          <label
            htmlFor="skinFileInput"
            className="file-btn"
            style={{ opacity: cameraActive || capturedFile ? 0.5 : 1 }}
          >
            {file ? file.name : "Choose Image"}
          </label>
        </div>

        {/* Camera Capture (Mobile only) */}
        {isMobile && (
          <div className="file-input-wrapper">
            {!cameraActive && !capturedFile && (
              <button className="file-btn" onClick={startCamera}>
                Activate Camera
              </button>
            )}
            {cameraActive && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="camera-preview"
                />
                <button className="file-btn" onClick={capturePhoto}>
                  Capture Photo
                </button>
                <button className="file-btn cancel-btn" onClick={stopCamera}>
                  Cancel
                </button>
              </>
            )}
            {capturedFile && (
              <span className="captured-name">{capturedFile.name}</span>
            )}
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
