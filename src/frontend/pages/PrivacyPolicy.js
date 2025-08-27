import React from "react";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <h2>Privacy Policy & Terms of Use</h2>

      <section className="privacy-section">
        <h3>1. Privacy Policy</h3>
        <ul>
          <li>We respect your privacy and protect your personal data.</li>
          <li>
            Basic info (name, email, role, avatar) is collected at registration.
          </li>
          <li>
            Health data used by AI is stored securely and never shared without
            consent.
          </li>
          <li>Users can update or delete their data anytime.</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h3>2. Terms of Use</h3>
        <ul>
          <li>
            Service is mainly for medical students and doctors to use AI tools.
          </li>
          <li>General users can access only the General AI section.</li>
          <li>Account sharing or bypassing permissions is prohibited.</li>
          <li>
            Platform is not responsible for misuse of data or AI
            interpretations.
          </li>
          <li>
            By using the service, you agree to data collection and processing.
          </li>
        </ul>
      </section>

      <section className="privacy-section">
        <h3>3. Security & Compliance</h3>
        <ul>
          <li>Data is encrypted using HTTPS & JWT.</li>
          <li>Files and images are stored securely per user.</li>
          <li>We follow medical data protection regulations.</li>
        </ul>
      </section>
    </div>
  );
}

export default PrivacyPolicy;
