import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowUp,
  HiSparkles,
  HiCodeBracket,
  HiCpuChip,
  HiLightBulb,
  HiCommandLine,
  HiBolt,
  HiShieldCheck,
  HiArrowRight,
} from "react-icons/hi2";
import "./Home.css";

function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleLaunch = (textToLaunch) => {
    const query = textToLaunch || prompt;
    if (!query.trim()) return;
    navigate("/chat", { state: { initialPrompt: query.trim() } });
  };

  const starterCards = [
    {
      icon: <HiCodeBracket />,
      title: "Debug Component Re-renders",
      prompt: "Debug React component re-renders and memory leaks with practical fixes",
      tag: "Code",
    },
    {
      icon: <HiCpuChip />,
      title: "Quantum Computing Analogy",
      prompt: "Explain quantum computing simply with intuitive analogies and practical uses",
      tag: "Science",
    },
    {
      icon: <HiLightBulb />,
      title: "High-Moat Micro-SaaS",
      prompt: "Brainstorm 3 viable micro-SaaS ideas with high moat and low overhead",
      tag: "Product",
    },
    {
      icon: <HiCommandLine />,
      title: "Scalable REST Architecture",
      prompt: "Design a scalable REST API architecture with token bucket rate limiting",
      tag: "Architecture",
    },
  ];

  return (
    <div className="home-container">
      {/* Ethereal ambient light glow */}
      <div className="home-ambient-glow" />

      {/* Hero section */}
      <section className="home-hero-section">
        <div className="home-status-pill">
          <span className="home-status-dot" />
          <span className="home-status-text">mVerse Core 2.0 • Ultra-Low Latency</span>
        </div>

        <h1 className="home-hero-title">
          Intelligence without <span className="home-hero-gradient">limits.</span>
        </h1>
        <p className="home-hero-subtitle">
          Direct conversational intelligence powered by real-time multi-model fallback. Ask complex questions, brainstorm ideas, or debug code instantly.
        </p>

        {/* Command bar input */}
        <div className="home-command-card">
          <form
            className="home-command-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLaunch();
            }}
          >
            <div className="home-command-icon" aria-hidden="true">
              <HiSparkles />
            </div>
            <input
              type="text"
              className="home-command-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything, explore ideas, or paste code..."
              autoFocus
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="home-command-submit"
              aria-label="Submit prompt"
              title="Launch into chat"
            >
              <HiArrowUp />
            </button>
          </form>

          <div className="home-command-hints">
            <span>Press <strong>Enter ↵</strong> to launch</span>
            <span className="hint-divider">•</span>
            <span>Multi-model fallback enabled</span>
          </div>
        </div>
      </section>

      {/* Quick Launch Cards Grid */}
      <section className="home-cards-section">
        <div className="home-cards-header">
          <span className="home-cards-label">Curated Starting Points</span>
        </div>

        <div className="home-cards-grid">
          {starterCards.map((card, idx) => (
            <div
              key={idx}
              className="home-starter-card"
              onClick={() => handleLaunch(card.prompt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleLaunch(card.prompt)}
            >
              <div className="home-starter-top">
                <div className="home-starter-icon-box">{card.icon}</div>
                <span className="home-starter-tag">{card.tag}</span>
              </div>
              <div className="home-starter-content">
                <h4 className="home-starter-title">{card.title}</h4>
                <p className="home-starter-desc">{card.prompt}</p>
              </div>
              <div className="home-starter-footer">
                <span className="home-starter-action">Try prompt</span>
                <HiArrowRight className="home-starter-arrow" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature & Trust Badges */}
      <section className="home-features-row">
        <div className="home-feature-item">
          <div className="home-feature-icon">
            <HiBolt />
          </div>
          <div className="home-feature-text">
            <strong>Sub-Second Speed</strong>
            <span>Flash-Lite ultra-low latency inference</span>
          </div>
        </div>

        <div className="home-feature-item">
          <div className="home-feature-icon">
            <HiShieldCheck />
          </div>
          <div className="home-feature-text">
            <strong>Resilient Fallback</strong>
            <span>Multi-provider cascade with zero downtime</span>
          </div>
        </div>

        <div className="home-feature-item">
          <div className="home-feature-icon">
            <HiCommandLine />
          </div>
          <div className="home-feature-text">
            <strong>Local Sessions</strong>
            <span>Full chat histories saved in your browser</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
