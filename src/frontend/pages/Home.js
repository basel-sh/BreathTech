import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

import LungsDoctorImg from "../../assets/LungsDoctor.png";
import SkinsDoctorImg from "../../assets/SkinDoctor.png";
import GeneralDoctorImg from "../../assets/GeneralDoctor.png";
import HomeAiDoctor from "../../assets/HomeVideo.mp4";

const Home = () => {
  const scrollerRef = useRef(null);

  // No need for isDark state, CSS handles theme via variables

  const scroll = (dir) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ background: "transparent", margin: 0, padding: 0 }}>
      {/* HERO */}
      <section className="hero">
        <video autoPlay loop muted playsInline className="heroVideo">
          <source src={HomeAiDoctor} type="video/mp4" />
        </video>
        <div className="heroOverlay" />
        <div className="heroContent">
          <h1 className="heroTitle">BreathTech AI Clinic</h1>
          <p className="heroSubtitle">
            Fast, private, and intelligent health assistance for lungs, skin,
            and general wellness.
          </p>
        </div>
      </section>

      {/* CARDS / SESSIONS */}
      <section className="cardsSection">
        <h2 className="sectionTitle">Explore Our AI Specialties</h2>

        <div className="carousel">
          <button
            onClick={() => scroll("left")}
            className="arrowBtn"
            style={{ left: 8 }}
            aria-label="Scroll left"
          >
            ‹
          </button>

          <div ref={scrollerRef} className="scroller">
            {cards.map((c) => (
              <div
                key={c.title}
                className="card"
                style={{ backgroundImage: `url(${c.bg})` }}
              >
                <div className="cardOverlay" />
                <div className="cardContent">
                  <h3 className="cardTitle">{c.title}</h3>
                  <p className="cardMeta">
                    Detection Accuracy: {c.accuracy}% (demo)
                  </p>
                  <Link to={c.to} className="cardBtn">
                    Diagnose Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="arrowBtn"
            style={{ right: 8 }}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </section>
    </div>
  );
};

const cards = [
  {
    title: "Lungs Diagnosis",
    accuracy: 87,
    to: "/lungs-chat",
    bg: LungsDoctorImg,
  },
  {
    title: "Skin Analysis",
    accuracy: 92,
    to: "/skin-chat",
    bg: SkinsDoctorImg,
  },
  {
    title: "General Health",
    accuracy: 85,
    to: "/general-chat",
    bg: GeneralDoctorImg,
  },
  {
    title: "Lungs Diagnosis",
    accuracy: 87,
    to: "/lungs-chat",
    bg: LungsDoctorImg,
  },
  {
    title: "Skin Analysis",
    accuracy: 92,
    to: "/skin-chat",
    bg: SkinsDoctorImg,
  },
  {
    title: "General Health",
    accuracy: 85,
    to: "/general-chat",
    bg: GeneralDoctorImg,
  },
];

export default Home;
