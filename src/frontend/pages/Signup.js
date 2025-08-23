import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

const SignUp = ({ setUser }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // patient or doctor
  const [avatar, setAvatar] = useState(null); // new
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return alert("Please select a role!");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("age", age);
      formData.append("sex", sex);
      formData.append("weight", weight || "");
      formData.append("height", height || "");
      formData.append("email", email.trim());
      formData.append("password", password.trim());
      formData.append("role", role);
      if (avatar) formData.append("avatar", avatar);

      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      alert("Signup successful!");
      navigate("/profile");
    } catch (err) {
      console.error("Signup error:", err);
      alert(`Signup failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />

        {/* Gender Selector */}
        <div className="sex-selector">
          <label>
            <input
              type="radio"
              value="Male"
              checked={sex === "Male"}
              onChange={(e) => setSex(e.target.value)}
            />
            <span>Male</span>
          </label>
          <label>
            <input
              type="radio"
              value="Female"
              checked={sex === "Female"}
              onChange={(e) => setSex(e.target.value)}
            />
            <span>Female</span>
          </label>
        </div>

        <input
          type="number"
          step="0.1"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Role Selector */}
        <div className="sex-selector">
          <label>
            <input
              type="radio"
              value="patient"
              checked={role === "patient"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span>Patient</span>
          </label>
          <label>
            <input
              type="radio"
              value="doctor"
              checked={role === "doctor"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span>Doctor</span>
          </label>
        </div>

        {/* Avatar Upload */}
        <label className="avatar-upload">
          {avatar ? avatar.name : "Click to upload profile photo"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>

        {/* Preview */}
        {avatar && (
          <div className="avatar-preview">
            <img src={URL.createObjectURL(avatar)} alt="Avatar Preview" />
          </div>
        )}

        {/* Sign Up Button */}
        <button type="submit" disabled={loading || !role}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
