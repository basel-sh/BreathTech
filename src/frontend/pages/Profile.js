import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import defaultAvatar from "../../assets/avatar.png";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

const Profile = ({ user, setUser }) => {
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        setUser(savedUser);
        setFormData(savedUser);
      } else {
        navigate("/login");
      }
    } else {
      setFormData(user);
    }
  }, [user, setUser, navigate]);

  if (!user) return <p>Loading profile...</p>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const formDataUpdate = new FormData();
      formDataUpdate.append("email", formData.email);
      formDataUpdate.append("fullName", formData.fullName);
      formDataUpdate.append("age", formData.age);
      formDataUpdate.append("weight", formData.weight || "");
      formDataUpdate.append("height", formData.height || "");
      formDataUpdate.append("conditions", formData.conditions || "");

      if (avatarFile) {
        formDataUpdate.append("avatar", avatarFile);
      } else if (formData.avatar === "") {
        // signal backend to delete avatar
        formDataUpdate.append("avatar", "");
      }

      const res = await fetch(`${BASE_URL}/api/update-profile`, {
        method: "PUT",
        body: formDataUpdate,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Profile updated successfully!");
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setFormData(data.user);
        setEditing(false);
        setAvatarFile(null);
      } else {
        setMessage("❌ Error updating profile: " + data.message);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Server error.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete your account?"))
      return;

    try {
      const res = await fetch(`${BASE_URL}/api/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        setMessage("🗑️ Account deleted successfully.");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
      } else {
        setMessage("❌ Error deleting account.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Server error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Avatar source: uploaded file > backend avatar > local default
  const avatarSrc = avatarFile
    ? URL.createObjectURL(avatarFile)
    : formData.avatar && formData.avatar !== "/default-avatar.png"
    ? `${BASE_URL}${formData.avatar}`
    : defaultAvatar;

  return (
    <div className="profile-container">
      <h2>👤 Profile</h2>

      {message && (
        <p className={message.startsWith("✅") ? "success-msg" : "error-msg"}>
          {message}
        </p>
      )}

      {/* Avatar */}
      <img src={avatarSrc} alt="Profile" className="profile-avatar" />

      {!editing ? (
        <>
          <p>
            <strong>Full Name:</strong> {user.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Age:</strong> {user.age}
          </p>
          <p>
            <strong>Weight:</strong> {user.weight ?? "Not set"}
          </p>
          <p>
            <strong>Height:</strong> {user.height ?? "Not set"}
          </p>
          <p>
            <strong>BMI:</strong>{" "}
            {user.weight && user.height
              ? (user.weight / (user.height / 100) ** 2).toFixed(2) + " kg/m²"
              : "Not calculated"}
          </p>
          <p>
            <strong>Conditions:</strong> {user.conditions || "None"}
          </p>

          <button className="edit-btn" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
          <button className="delete-btn" onClick={handleDeleteAccount}>
            🗑️ Delete Account
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Log Out
          </button>
        </>
      ) : (
        <div className="profile-form">
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            placeholder="Full Name"
          />
          <input
            type="number"
            name="age"
            value={formData.age || ""}
            onChange={handleChange}
            placeholder="Age"
          />
          <input
            type="number"
            name="weight"
            value={formData.weight || ""}
            onChange={handleChange}
            placeholder="Weight (kg)"
          />
          <input
            type="number"
            name="height"
            value={formData.height || ""}
            onChange={handleChange}
            placeholder="Height (cm)"
          />
          <input
            type="text"
            name="conditions"
            value={formData.conditions || ""}
            onChange={handleChange}
            placeholder="Medical Conditions"
          />

          {/* Upload new avatar */}
          <label className="avatar-upload">
            {avatarFile ? avatarFile.name : "Click to upload new avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </label>

          {avatarFile && (
            <div className="avatar-preview">
              <img src={URL.createObjectURL(avatarFile)} alt="Preview" />
            </div>
          )}

          {/* Delete avatar button */}
          {formData.avatar &&
            formData.avatar !== "/default-avatar.png" &&
            !avatarFile && (
              <button
                className="delete-avatar-btn"
                onClick={() => setFormData({ ...formData, avatar: "" })}
              >
                🗑️ Delete Avatar
              </button>
            )}

          <button className="save-btn" onClick={handleUpdate}>
            💾 Save Changes
          </button>
          <button className="cancel-btn" onClick={() => setEditing(false)}>
            ❌ Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
