import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = ({ user, setUser }) => {
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Load user from localStorage if not in state
  useEffect(() => {
    if (!user) {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        setUser(savedUser);
        setFormData(savedUser);
      } else {
        navigate("/login"); // redirect if no user
      }
    } else {
      setFormData(user);
    }
  }, [user, setUser, navigate]);

  if (!user) return <p>Loading profile...</p>;

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Update profile
  const handleUpdate = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Profile updated successfully!");
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setEditing(false);
      } else {
        setMessage("❌ Error updating profile: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Server error.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete your account?"))
      return;

    try {
      const response = await fetch("http://localhost:5000/api/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        setMessage("🗑️ Account deleted successfully.");
        localStorage.removeItem("user");
        setUser(null);

        setTimeout(() => {
          navigate("/");
        }, 0);
      } else {
        setMessage("❌ Error deleting account.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Server error.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setTimeout(() => navigate("/"), 0);
  };

  return (
    <div className="profile-container">
      <h2>👤 Profile</h2>
      {message && (
        <p className={message.startsWith("✅") ? "success-msg" : "error-msg"}>
          {message}
        </p>
      )}

      {!editing ? (
        <>
          <p>
            <strong>Full Name:</strong> {user.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
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
              ? (
                  user.weight /
                  ((user.height / 100) * (user.height / 100))
                ).toFixed(2) + " kg/m²"
              : "Not calculated"}
          </p>
          <p>
            <strong>Conditions:</strong> {user.conditions || "None"}
          </p>

          <button className="logout-btn" onClick={() => setEditing(true)}>
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

          <button className="logout-btn" onClick={handleUpdate}>
            💾 Save Changes
          </button>
          <button className="delete-btn" onClick={() => setEditing(false)}>
            ❌ Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
