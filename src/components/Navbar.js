import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Logo3.png";
import avatar from "../assets/avatar.png";
import "./NavbarCSS.css";

const Navbar = ({ user }) => {
  const [theme, setTheme] = useState(() => {
    document.documentElement.setAttribute("data-theme", "light");
    return "light";
  });
  const [lang, setLang] = useState("EN");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleLang = () => setLang(lang === "EN" ? "AR" : "EN");

  return (
    <nav className="navbar">
      <div className="left">
        <Link to="/" className="homeLink">
          <img src={logo} alt="Team Logo" className="logo" />
          <span className="teamName">BreathTech</span>
        </Link>
      </div>

      <div className="links">
        <Link to="/" className="navBtn">
          Home
        </Link>
        <Link to="/lungs-chat" className="navBtn">
          Lungs Chat
        </Link>
        <Link to="/skin-chat" className="navBtn">
          Skin Chat
        </Link>
        <Link to="/general-chat" className="navBtn">
          General Chat
        </Link>
      </div>

      <div className="right">
        <button
          className="iconToggleBtn"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to Dark" : "Switch to Light"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button className="toggleBtn" onClick={toggleLang}>
          {lang === "EN" ? "AR" : "EN"}
        </button>

        {!user && (
          <>
            <Link to="/login" className="button">
              Login
            </Link>
            <Link to="/signup" className="button">
              Signup
            </Link>
          </>
        )}

        {user && (
          <Link to="/profile">
            <img src={avatar} alt="Profile Avatar" className="avatar" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
