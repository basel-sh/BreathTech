import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import LungsDoctorImg from "../../assets/LungsDoctor.png";
import SkinsDoctorImg from "../../assets/SkinDoctor.png";
import GeneralDoctorImg from "../../assets/GeneralDoctor.png";
import HomeAiDoctor from "../../assets/HomeVideo.mp4";

const cards = [
  {
    title: "General Health",
    accuracy: 85,
    to: "/general-chat",
    img: GeneralDoctorImg,
  },
  {
    title: "Lungs Diagnosis",
    accuracy: 87,
    to: "/lungs-chat",
    img: LungsDoctorImg,
  },
  {
    title: "Skin Analysis",
    accuracy: 92,
    to: "/skin-chat",
    img: SkinsDoctorImg,
  },
  {
    title: "General Health",
    accuracy: 85,
    to: "/general-chat",
    img: GeneralDoctorImg,
  },
  {
    title: "Lungs Diagnosis",
    accuracy: 87,
    to: "/lungs-chat",
    img: LungsDoctorImg,
  },
  {
    title: "Skin Analysis",
    accuracy: 92,
    to: "/skin-chat",
    img: SkinsDoctorImg,
  },
];

const aboutCards = [
  {
    title: "Patients",
    desc: "Patients can access only the General Health AI model for a quick, broad health assessment.",
  },
  {
    title: "Doctors & Students",
    desc: "Doctors or students with a faculty email can access all AI models to help patients or study and research.",
  },
];

const Home = ({ user }) => {
  const scrollerRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = user || JSON.parse(localStorage.getItem("user"));

  const scroll = (dir) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleCardClick = (card) => {
    if (!currentUser) {
      alert("⚠️ You need to sign up first!");
      navigate("/signup");
      return;
    }

    if (currentUser.role === "patient" && card.title !== "General Health") {
      alert("⚠️ Patients can only access General Health.");
      return;
    }

    navigate(card.to);
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

      {/* ABOUT OUR IDEA */}
      <section className="aboutIdea">
        <h2 className="sectionTitle">About Our Idea</h2>
        <div className="aboutCardsContainer">
          {aboutCards.map((card, i) => (
            <div key={i} className="aboutCard textOnly">
              <h3 className="aboutCardTitle">{card.title}</h3>
              <p className="aboutCardDesc">{card.desc}</p>
            </div>
          ))}
        </div>
        {!currentUser && (
          <button className="signupBtn" onClick={() => navigate("/signup")}>
            Sign Up to Access
          </button>
        )}
      </section>

      <hr className="fancySeparator" />

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
            {cards.map((card, i) => {
              const isDisabled =
                currentUser &&
                currentUser.role === "patient" &&
                card.title !== "General Health";

              return (
                <div
                  key={i}
                  className={`card ${isDisabled ? "disabledCard" : ""}`}
                  style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                >
                  <img src={card.img} alt={card.title} className="cardImg" />
                  <div className="cardOverlay" />
                  <div className="cardContent">
                    <h3 className="cardTitle">{card.title}</h3>
                    <p className="cardMeta">
                      Detection Accuracy: {card.accuracy}% (demo)
                    </p>
                    <button
                      className="cardBtn"
                      disabled={isDisabled}
                      onClick={() => handleCardClick(card)}
                    >
                      Diagnose Now
                    </button>
                  </div>
                </div>
              );
            })}
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

export default Home;
