// Navbar.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WebsiteMainLogo from "../assets/HQWebsiteLogo2.png";
import defaultAvatar from "../assets/avatar.png"; // default avatar
import "./NavbarCSS.css";

const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

const Navbar = ({ user }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [lang, setLang] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect window size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleLang = () => setLang(lang === "EN" ? "AR" : "EN");
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Disable links based on user role
  const isLinkDisabled = (linkName) => {
    if (linkName === "Home") return false;
    if (!user) return true;
    if (user.role === "patient" && linkName !== "General Chat") return true;
    return false;
  };

  const renderLink = (to, name) => (
    <Link
      to={isLinkDisabled(name) ? "#" : to}
      className={`navBtn ${isLinkDisabled(name) ? "disabled" : ""}`}
      onClick={(e) => {
        if (isLinkDisabled(name)) e.preventDefault();
        if (isMobile) setMenuOpen(false);
      }}
    >
      {name}
    </Link>
  );

  // Reactive avatar source
  const avatarSrc =
    user && user.avatar && user.avatar !== "/default-avatar.png"
      ? `${BASE_URL}${user.avatar}`
      : defaultAvatar;

  return (
    <>
      <div className="navbar">
        <div className="ForFixingTheMenu">
          <div>
            <span className="logoContainer">
              <Link to="/" className="homeLink">
                <img
                  src={WebsiteMainLogo}
                  alt="BreathTech Logo"
                  className="logo"
                  style={{ height: isMobile ? "70px" : "80px" }}
                />
                <span className="teamName">BreathTech</span>
              </Link>
            </span>
          </div>
          <div className="hamburgerContainer">
            {isMobile && (
              <div
                className={`hamburger ${menuOpen ? "active" : ""}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        </div>

        {!isMobile && (
          <>
            <div className="links">
              {renderLink("/", "Home")}
              {renderLink("/lungs-chat", "Lungs Chat")}
              {renderLink("/skin-chat", "Skin Chat")}
              {renderLink("/general-chat", "General Chat")}
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
                  <img
                    src={avatarSrc}
                    alt="Profile Avatar"
                    className="avatar"
                    key={avatarSrc} // forces re-render on change
                  />
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {isMobile && (
        <>
          <div className={`sidebar ${menuOpen ? "active" : ""}`}>
            <h1>Menu Bar</h1>
            {renderLink("/", "Home")}
            {renderLink("/lungs-chat", "Lungs Chat")}
            {renderLink("/skin-chat", "Skin Chat")}
            {renderLink("/general-chat", "General Chat")}

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
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="avatar"
                      key={avatarSrc} // forces re-render
                    />
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
