import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  HiArrowUp,
  HiTrash,
  HiClipboard,
  HiCheck,
} from "react-icons/hi2";
import "./Chat.css";

// Code block with Copy feedback
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="code-shell">
      <div className="code-shell-bar">
        <span>{language || "code"}</span>
        <button onClick={handleCopy} className="code-copy-action">
          {copied ? (
            <>
              <HiCheck style={{ color: "var(--accent-mint-light)" }} />
              <span style={{ color: "var(--accent-mint-light)" }}>Copied</span>
            </>
          ) : (
            <>
              <HiClipboard />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Formatted Message component
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      elements.push({ type: "text", content: textBefore });
    }
    elements.push({
      type: "code",
      language: match[1] || "code",
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter.trim() || elements.length === 0) {
    elements.push({ type: "text", content: textAfter || content });
  }

  return (
    <div>
      {elements.map((item, idx) => {
        if (item.type === "code") {
          return (
            <CodeBlock
              key={idx}
              language={item.language}
              code={item.code}
            />
          );
        }

        const lines = item.content.split("\n");
        return (
          <div key={idx}>
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lineIdx} style={{ height: "0.4rem" }} />;
              }

              const isList = trimmed.startsWith("* ") || trimmed.startsWith("- ");
              const displayLine = isList ? trimmed.substring(2) : line;

              const parts = displayLine.split(/(\*\*.*?\*\*|`.*?`)/g);
              const formattedParts = parts.map((part, partIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={partIdx} style={{ color: "#ffffff" }}>
                      {part.substring(2, part.length - 2)}
                    </strong>
                  );
                }
                if (part.startsWith("`") && part.endsWith("`")) {
                  return (
                    <code key={partIdx} className="inline-code-token">
                      {part.substring(1, part.length - 1)}
                    </code>
                  );
                }
                return part;
              });

              if (isList) {
                return (
                  <div
                    key={lineIdx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.45rem",
                      margin: "0.2rem 0",
                    }}
                  >
                    <span style={{ color: "var(--accent-mint)", fontSize: "0.75rem", marginTop: "2px" }}>
                      •
                    </span>
                    <span>{formattedParts}</span>
                  </div>
                );
              }

              return <p key={lineIdx}>{formattedParts}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Dynamic backend URL:
  // - If REACT_APP_BACKEND_BASEURL is configured, use it.
  // - If running on localhost/127.0.0.1, use port 5001.
  // - Otherwise (Vercel serverless / same origin), use relative path "".
  const backendUrl =
    process.env.REACT_APP_BACKEND_BASEURL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5001"
      : "");

  const handleSendMessage = useCallback(async (overridePrompt) => {
    const textToSend = typeof overridePrompt === "string" ? overridePrompt : userInput;
    if (!textToSend.trim() || loading) return;

    const newMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/llm`, {
        input: textToSend,
      });

      const botText =
        response.data?.text || "No response received from mVerse.";

      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: botText },
      ]);
    } catch (err) {
      console.error("Error communicating with backend:", err);
      const serverMsg = err.response?.data?.text || err.response?.data?.error;
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text:
            serverMsg ||
            "**Unable to reach backend service.**\n\nIf testing locally, please ensure the backend is running (`node server.js` on port 5001). In production on Vercel, check that your server deployment is active.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, loading, userInput]);

  // If redirected from Home page with a query, auto-send it
  useEffect(() => {
    if (location.state?.initialPrompt) {
      const prompt = location.state.initialPrompt;
      window.history.replaceState({}, document.title);
      handleSendMessage(prompt);
    }
  }, [location.state, handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const starters = [
    "Explain quantum computing simply",
    "Debug React component re-renders",
    "Brainstorm 3 micro-SaaS ideas",
  ];

  return (
    <div className="chat-clean-container">
      <div className="chat-card-shell">
        {/* Header */}
        <div className="chat-clean-header">
          <div className="chat-header-left">
            <h3>
              mVerse
              <span className="chat-status-tag">
                <span className="status-dot-mint"></span>
                Core 2.0
              </span>
            </h3>
          </div>

          <div className="chat-header-right">
            <button
              onClick={() => setMessages([])}
              disabled={messages.length === 0 || loading}
              className="chat-clear-btn"
            >
              <HiTrash />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="chat-scroll-area">
          {messages.length === 0 ? (
            <div className="chat-empty-view">
              <h3>What would you like to explore?</h3>
              <p>Type a prompt below or choose a starting point.</p>
              <div className="chat-empty-chips">
                {starters.map((item, idx) => (
                  <button
                    key={idx}
                    className="chat-empty-chip-btn"
                    onClick={() => handleSendMessage(item)}
                  >
                    {item} →
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`msg-row ${msg.sender}`}>
                <div className="msg-avatar-badge">
                  {msg.sender === "user" ? "U" : "m"}
                </div>
                <div className="msg-body-card">
                  {msg.sender === "user" ? (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  ) : (
                    <FormattedMessage content={msg.text} />
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="msg-row assistant">
              <div className="msg-avatar-badge">m</div>
              <div className="msg-body-card">
                <div className="thinking-wave">
                  <span className="wave-dot"></span>
                  <span className="wave-dot"></span>
                  <span className="wave-dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="chat-prompt-bottom">
          <form
            className="chat-input-pill"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chat-core-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask mVerse anything..."
              autoFocus
            />
            <button
              type="submit"
              disabled={!userInput.trim() || loading}
              className="chat-submit-pill-btn"
              aria-label="Send"
            >
              <HiArrowUp />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;