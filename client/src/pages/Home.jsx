import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiSparkles,
  HiPlus,
  HiMicrophone,
  HiArrowUp,
  HiPencilSquare,
  HiCodeBracket,
  HiLightBulb,
  HiMagnifyingGlass,
  HiCheck,
} from "react-icons/hi2";
import "./Home.css";

const ACTION_CHIPS = [
  {
    icon: <HiPencilSquare />,
    label: "Write or edit",
    prompt: "Write a compelling, professional introduction for a software engineer portfolio",
  },
  {
    icon: <HiCodeBracket />,
    label: "Code & debug",
    prompt: "How do I optimize React component re-renders and eliminate unnecessary state updates?",
  },
  {
    icon: <HiLightBulb />,
    label: "Brainstorm ideas",
    prompt: "Brainstorm 3 innovative AI product ideas with high defensibility and low overhead",
  },
  {
    icon: <HiMagnifyingGlass />,
    label: "Search & summarize",
    prompt: "Summarize the biggest breakthroughs in quantum computing and AI hardware for 2026",
  },
];

function Home() {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [copiedPill, setCopiedPill] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Auto-resize textarea height as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const nextHeight = Math.min(Math.max(el.scrollHeight, 24), 160);
      el.style.height = `${nextHeight}px`;
    }
  }, [prompt]);

  const handleLaunch = (textToLaunch) => {
    const query = textToLaunch || prompt;
    if (!query || !query.trim()) return;
    navigate("/chat", { state: { initialPrompt: query.trim() } });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleLaunch();
    }
  };

  // Optional Voice Input (Web Speech API)
  const handleVoiceToggle = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="home-canvas">
      {/* Subtle Gemini-style ambient radial aura */}
      <div className="home-ambient-aura" />

      <div className="home-content-wrap">
        {/* Modern Centered Headline */}
        <div className="home-header-block">
          <div className="home-sparkle-pill">
            <span className="home-sparkle-icon">
              <HiSparkles />
            </span>
            <span>mVerse Core 2.0</span>
          </div>
          <h1 className="home-main-greeting">
            Where should we begin?
          </h1>
        </div>

        {/* The Core Input Container (ChatGPT / Claude / Gemini hybrid) */}
        <div className="home-input-box">
          <textarea
            ref={textareaRef}
            className="home-prompt-textarea"
            placeholder="Ask anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
          />

          {/* Inner Toolbar */}
          <div className="home-input-toolbar">
            <div className="home-toolbar-left">
              <button
                type="button"
                className="home-tool-btn"
                title="Options"
                onClick={() => {
                  setCopiedPill(true);
                  setTimeout(() => setCopiedPill(false), 1500);
                }}
                aria-label="Add options"
              >
                {copiedPill ? <HiCheck className="check-icon" /> : <HiPlus />}
              </button>

              <div
                className="home-model-badge"
                title="Active Engine: Gemini Flash Lite with Multi-Model Fallback"
              >
                <span className="model-dot" />
                <span className="model-name">Flash 2.0</span>
              </div>
            </div>

            <div className="home-toolbar-right">
              <button
                type="button"
                className={`home-tool-btn ${isListening ? "listening" : ""}`}
                title={isListening ? "Listening..." : "Dictate with voice"}
                onClick={handleVoiceToggle}
                aria-label="Voice input"
              >
                <HiMicrophone />
              </button>

              <button
                type="button"
                className={`home-send-btn ${prompt.trim() ? "active" : ""}`}
                disabled={!prompt.trim()}
                onClick={() => handleLaunch()}
                title="Send prompt"
                aria-label="Send prompt"
              >
                <HiArrowUp />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Chips (Directly below input, ChatGPT style) */}
        <div className="home-action-chips">
          {ACTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="home-action-chip"
              onClick={() => handleLaunch(chip.prompt)}
              title={chip.prompt}
            >
              <span className="chip-icon">{chip.icon}</span>
              <span className="chip-label">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Micro Disclaimer */}
      <footer className="home-bottom-disclaimer">
        <span>mVerse can make mistakes. Verify important information.</span>
      </footer>
    </div>
  );
}

export default Home;
