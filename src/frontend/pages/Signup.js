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
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!age) newErrors.age = "Age is required";
    if (!sex) newErrors.sex = "Gender is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!role) newErrors.role = "Please select a role";
    if (!acceptedPolicy)
      newErrors.acceptedPolicy = "You must accept Privacy Policy & Terms";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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

      if (!res.ok) {
        setErrors({ apiError: data.error || "Signup failed" });
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);

      if (data.token) {
        const profileRes = await fetch(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) setUser(profileData.user);
      }

      navigate("/profile");
    } catch (err) {
      setErrors({ apiError: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    fullName.trim() &&
    age &&
    sex &&
    email.trim() &&
    password &&
    role &&
    acceptedPolicy;

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <input
          className="input-bordered"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errors.fullName && (
          <span className="error-msg">{errors.fullName}</span>
        )}

        {/* Age */}
        <input
          className="input-bordered"
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        {errors.age && <span className="error-msg">{errors.age}</span>}

        {/* Gender */}
        <div className="option-wrapper">
          <div className="sex-selector bordered-options">
            <label>
              <input
                type="radio"
                value="Male"
                checked={sex === "Male"}
                onChange={(e) => setSex(e.target.value)}
              />
              <span className="SPANOption">Male</span>
            </label>
            <label>
              <input
                type="radio"
                value="Female"
                checked={sex === "Female"}
                onChange={(e) => setSex(e.target.value)}
              />
              <span className="SPANOption">Female</span>
            </label>
          </div>
          {errors.sex && <span className="error-msg">{errors.sex}</span>}
        </div>

        {/* Weight & Height */}
        <input
          className="input-bordered"
          type="number"
          step="0.1"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          className="input-bordered"
          type="number"
          step="0.1"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        {/* Email */}
        <input
          className="input-bordered"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}

        {/* Password */}
        <input
          className="input-bordered"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <span className="error-msg">{errors.password}</span>
        )}

        {/* Role */}
        <div className="option-wrapper">
          <div className="sex-selector bordered-options">
            <label>
              <input
                type="radio"
                value="patient"
                checked={role === "patient"}
                onChange={(e) => setRole(e.target.value)}
              />
              <span className="SPANOption">Patient</span>
            </label>
            <label>
              <input
                type="radio"
                value="doctor"
                checked={role === "doctor"}
                onChange={(e) => setRole(e.target.value)}
              />
              <span className="SPANOption">Doctor</span>
            </label>
          </div>
          {errors.role && <span className="error-msg">{errors.role}</span>}
        </div>

        {/* Avatar */}
        <label className="avatar-upload input-bordered">
          {avatar ? avatar.name : "Click to upload profile photo"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>
        {avatar && (
          <div className="avatar-preview">
            <img src={URL.createObjectURL(avatar)} alt="Avatar Preview" />
          </div>
        )}

        {/* Privacy Policy */}
        <div className="option-wrapper">
          <label className="policy-checkbox">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
            />
            I have read and accept the{" "}
            <a href="/privacy-policy" target="_blank">
              Privacy Policy & Terms
            </a>
          </label>
          {errors.acceptedPolicy && (
            <span className="error-msg">{errors.acceptedPolicy}</span>
          )}
        </div>

        {/* API Error */}
        {errors.apiError && (
          <span className="error-msg">{errors.apiError}</span>
        )}

        {/* Submit */}
        <button type="submit" disabled={!isFormValid || loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
