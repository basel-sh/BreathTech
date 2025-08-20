import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Logo3.png";
import avatar from "../assets/avatar.png";
import "./NavbarCSS.css";
import WebsiteMainLogo from "../assets/WebsiteMainLogo.png";

const Navbar = ({ user }) => {
  // Set dark mode as default
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme : "dark"; // Default to dark mode
  });

  const [lang, setLang] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial state and add event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Apply the theme on initial load
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme); // Save theme preference

    return () => window.removeEventListener("resize", handleResize);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme); // Save the new theme preference
  };

  const toggleLang = () => setLang(lang === "EN" ? "AR" : "EN");
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <nav className="navbar">
        {/* Logo and Title (Always visible) */}
        <Link to="/" className="homeLink">
          <img
            src={WebsiteMainLogo}
            alt="BreathTech Logo"
            className="logo"
            style={{ height: isMobile ? "70px" : "80px" }} // Responsive logo size
          />
          <span className="teamName">BreathTech</span>
        </Link>

        {/* Desktop Navigation (Hidden on mobile) */}
        {!isMobile && (
          <>
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
                aria-label="Toggle Theme"
                title={theme === "light" ? "Switch to Dark" : "Switch to Light"}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>

              <button className="toggleBtn" onClick={toggleLang}>
                {lang === "EN" ? "AR" : "EN"}
              </button>

              {!user ? (
                <>
                  <Link to="/login" className="button">
                    Login
                  </Link>
                  <Link to="/signup" className="button">
                    Signup
                  </Link>
                </>
              ) : (
                <Link to="/profile">
                  <img src={avatar} alt="Profile Avatar" className="avatar" />
                </Link>
              )}
            </div>
          </>
        )}

        {/* Mobile Hamburger (Only visible on mobile) */}
        {isMobile && (
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
      </nav>

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          <div className={`sidebar ${menuOpen ? "active" : ""}`}>
            <h1>Menu Bar</h1>
            <Link to="/" className="navBtn" onClick={toggleMenu}>
              Home
            </Link>
            <Link to="/lungs-chat" className="navBtn" onClick={toggleMenu}>
              Lungs Chat
            </Link>
            <Link to="/skin-chat" className="navBtn" onClick={toggleMenu}>
              Skin Chat
            </Link>
            <Link to="/general-chat" className="navBtn" onClick={toggleMenu}>
              General Chat
            </Link>
            <div className="mobile-actions">
              <button className="button" onClick={toggleTheme}>
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
              <button className="button" onClick={toggleLang}>
                Switch to {lang === "EN" ? "Arabic" : "English"}
              </button>
              <div className="mobile-SIGNLOGPROFILE">
                {!user ? (
                  <>
                    <Link to="/login" className="button" onClick={toggleMenu}>
                      Login
                    </Link>
                    <Link to="/signup" className="button" onClick={toggleMenu}>
                      Signup
                    </Link>
                  </>
                ) : (
                  <Link to="/profile" onClick={toggleMenu}>
                    <img src={avatar} alt="Profile" className="avatar" />
                  </Link>
                )}
              </div>
            </div>
          </div>
          {menuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        </>
      )}
    </>
  );
};

export default Navbar;
