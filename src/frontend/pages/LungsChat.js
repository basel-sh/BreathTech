import React, { useState } from "react";

function LungsChat() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Patient info (can make dynamic later with inputs)
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
    setLoading(true);

    try {
      // Build multipart/form-data
      const formData = new FormData();
      formData.append("file", file); // 🔑 must match Multer field name

      // append patient info
      Object.entries(patientInfo).forEach(([key, value]) =>
        formData.append(key, value)
      );

      const response = await fetch(
        "https://breath-tech-backend-production.up.railway.app/api/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Prediction failed");
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Lungs AI Assistant</h2>
      <p>Upload your lung sound recording (WAV/MP3)</p>

      <input type="file" accept="audio/*" onChange={handleFileChange} />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Predicting..." : "Upload & Predict"}
      </button>

      {prediction !== null && <p>Predicted Class: {prediction}</p>}
    </div>
  );
}

export default LungsChat;
