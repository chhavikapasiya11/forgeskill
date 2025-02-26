import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="landing-container">
      {!isLoggedIn && (
        <div className="overlay">
          <p className="overlay-text">Please log in to access features.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn btn-secondary btn-lg my-2" onClick={() => navigate("/signup")}>
           Create your acoount
          </button>
        </div>
      )}

      <header className="hero-section text-center mb-5">
        <h1 className="hero-title">Unlock Your Potential</h1>
        <p className="hero-subtitle">Learn, Teach, and Grow with SkillSwap</p>
        <p className="lead">Exchange skills and learn from fellow students!</p>
      </header>

      <section className="features-section mb-5">
        <h2 className="text-center section-title mb-4">What We Offer</h2>
        <div className="row g-5">
          {[
            { title: "Skill Swapping", text: "Exchange skills with others and grow together.", link: "/skill-swapping", color: "#3498db" },
            { title: "Mentorship", text: "Guide to achieve personal and professional growth.", link: "/mentorship", color: "#2ecc71" },
            { title: "Growth & Learning", text: "Discover new opportunities to learn and advance.", link: "/growth-learning", color: "#e74c3c" }
          ].map(({ title, text, link, color }, index) => (
            <div key={index} className="col-md-4">
              <div
                className={`card feature-card p-4 text-white text-center ${!isLoggedIn ? "disabled-card" : ""}`}
                style={{ backgroundColor: color }}
              >
                <div className="card-body">
                  <h3 className="card-title">{title}</h3>
                  <p className="card-text">{text}</p>
                  <button
                    className="btn btn-primary btn-lg mt-3"
                    onClick={() => isLoggedIn && (window.location.href = link)}
                    disabled={!isLoggedIn}
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
