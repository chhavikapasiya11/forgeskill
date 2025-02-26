import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/About";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Skillswapping from "./components/Skillswapping";
import Mentorship from "./components/Mentorship";
import GrowthLearning from "./components/Growthlearning";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/about" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/skill-swapping" element={<Skillswapping />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/growth-learning" element={<GrowthLearning />} />
      </Routes>
    </Router>
  );
}

export default App;
