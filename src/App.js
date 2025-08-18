import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./frontend/pages/Home";
import Login from "./frontend/pages/Login";
import Signup from "./frontend/pages/Signup";
import Profile from "./frontend/pages/Profile";
import LungsChat from "./frontend/pages/LungsChat";
import SkinChat from "./frontend/pages/SkinChat";
import GeneralChat from "./frontend/pages/GeneralChat";

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        setUser(null); // fallback
      }
    }
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <div style={{ paddingTop: 40 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route
            path="/profile"
            element={<Profile user={user} setUser={setUser} />}
          />
          <Route path="/lungs-chat" element={<LungsChat />} />
          <Route path="/skin-chat" element={<SkinChat />} />
          <Route path="/general-chat" element={<GeneralChat />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
