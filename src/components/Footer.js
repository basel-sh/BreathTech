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

        {/* Privacy Policy */}
        <div className="section">
          <h3 className="heading">Legal</h3>
          <p className="text">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link"
            >
              Privacy Policy & Terms
            </a>
          </p>
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
