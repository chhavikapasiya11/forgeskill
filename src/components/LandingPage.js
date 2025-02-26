import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="landing-container">
      <header className="hero-section text-center mb-5">
        <h1 className="hero-title">Unlock Your Potential</h1>
        <p className="hero-subtitle">Learn, Teach, and Grow with SkillSwap</p>
        <p className="lead">Exchange skills and learn from fellow students!</p>
        <div className="button-group mt-4">
          {!isLoggedIn && (
            <>
              <a href="/signup" className="btn btn-success btn-lg">Create account</a>
              <br /><br />
              <a href="/login" className="btn btn-success btn-lg">Login</a>
            </>
          )}
        </div>
      </header>
      
      {isLoggedIn && (
        <>
          <section className="features-section mb-5">
            <h2 className="text-center section-title mb-4">What We Offer</h2>
            <div className="row g-5">
              {[{ title: "Skill Swapping", text: "Exchange skills with others and grow together.", link: "/skill-swapping", color: "#3498db" },  
                { title: "Mentorship", text: "Guide to achieve personal and professional growth.", link: "/mentorship", color: "#2ecc71" },  
                { title: "Growth & Learning", text: "Discover new opportunities to learn and advance.", link: "/growth-learning", color: "#e74c3c" }  
              ].map(({ title, text, link, color }, index) => (
                <div key={index} className="col-md-4">
                  <div className="card feature-card p-4 text-white text-center" style={{ backgroundColor: color }}>
                    <div className="card-body">
                      <h3 className="card-title">{title}</h3>
                      <p className="card-text">{text}</p>
                      <button className="btn btn-primary btn-lg mt-3" onClick={() => window.location.href = link}>
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="key-features-section mb-5">
            <h2 className="text-center section-title mb-4">Key Features</h2>
            <div className="row g-5">
              {["Verified Users", "Personalized Learning", "Community Support"].map((feature, index) => (
                <div key={index} className="col-md-4">
                  <div className="card feature-card p-4">
                    <div className="card-body">
                      <h3 className="card-title">{feature}</h3>
                      <p className="card-text">Ensure trust and authenticity in each and every connection.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="how-it-works-section mb-5">
            <h2 className="text-center section-title mb-4">How It Works</h2>
            <div className="d-flex flex-column align-items-center gap-5">
              {["Sign Up", "List Skills", "Start Learning"].map((step, index) => (
                <div key={index} className="card step-card p-4" style={{ width: "80%" }}>
                  <div className="card-body">
                    <h3 className="card-title">{index + 1}. {step}</h3>
                    <p className="card-text">{index === 0 ? "Create your account and set up your profile." : index === 1 ? "Showcase what you can teach and what you want to learn." : "Find a match and begin exchanging skills."}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="testimonials-section mb-5">
            <h2 className="text-center section-title mb-4">What Our Users Say</h2>
            <div className="d-flex flex-column align-items-center gap-5">
              {[{ name: "Rohit Saraf", text: "SkillSwap helped me learn coding and improve my career prospects!" },
                { name: "Arshpreet", text: "A great platform for connecting with like-minded learners." }
              ].map(({ name, text }, index) => (
                <div key={index} className="card testimonial p-4" style={{ width: "80%" }}>
                  <div className="card-body">
                    <p className="card-text">"{text}"</p>
                    <h4 className="card-title">- {name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="contact-section mb-5">
            <h2 className="text-center section-title mb-4">Contact Us</h2>
            <div className="card p-3">
              <div className="card-body text-center">
                <p>Have questions? Reach out to us at <strong>support@skillswap.com</strong></p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default LandingPage;