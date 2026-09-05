import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowUp } from "react-icons/hi2";
import "./Home.css";

function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleLaunch = (textToLaunch) => {
    const query = textToLaunch || prompt;
    if (!query.trim()) return;
    navigate("/chat", { state: { initialPrompt: query } });
  };

  const samplePills = [
    "Explain quantum computing simply",
    "Debug React component re-renders",
    "Brainstorm 3 micro-SaaS ideas",
    "Design a scalable REST API",
  ];

  return (
    <div className="home-clean-container">
      <div className="home-badge-minimal">
        <span className="status-pulse-dot"></span>
        <span>mVerse 2.0 • Active</span>
      </div>

      <h1 className="home-hero-title">Where Ideas Collide.</h1>
      <p className="home-hero-subtitle">
        Direct conversational intelligence. No clutter, zero noise.
      </p>

      {/* Direct Prompt Input */}
      <div className="home-prompt-box">
        <form
          className="home-prompt-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLaunch();
          }}
        >
          <input
            type="text"
            className="home-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask mVerse anything, or enter a prompt..."
            autoFocus
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="home-submit-btn"
            aria-label="Submit prompt"
          >
            <HiArrowUp />
          </button>
        </form>
      </div>

      {/* Suggested Quick Starters */}
      <div className="quick-pills-row">
        {samplePills.map((pill, idx) => (
          <button
            key={idx}
            className="quick-pill-btn"
            onClick={() => handleLaunch(pill)}
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
