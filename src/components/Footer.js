import React from "react";
import "./FooterStyles.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="topRow">
        {/* About Us Section */}
        <div className="section">
          <h3 className="heading">About BreathTech</h3>
          <p className="text">
            BreathTech is a student-driven project focused on integrating AI and
            healthcare.
            <br />
            Our mission is to create smart, accessible tools that help people
            monitor and improve their health.
          </p>
        </div>

        {/* Contact Info */}
        <div className="section">
          <h3 className="heading">Contact Us</h3>
          <p className="text">📧 contact@breathtech.com</p>
          <p className="text">📞 +20 1068506907</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="bottomRow">
        <p className="copy">
          © {new Date().getFullYear()} BreathTech. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
