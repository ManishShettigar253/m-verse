import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiArrowUp,
  HiTrash,
  HiClipboard,
  HiCheck,
  HiPlus,
  HiBars3,
  HiXMark,
  HiChatBubbleLeftRight,
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

// Title synthesis helpers: extract concise, understandable 2-4 word topic titles
const STOP_WORDS = new Set([
  "a", "an", "the", "to", "for", "in", "on", "with", "about", "how", "what",
  "why", "does", "do", "did", "is", "are", "was", "were", "and", "or", "of",
  "can", "could", "should", "would", "help", "me", "you", "i", "it", "this",
  "that", "these", "those"
]);

function cleanPrompt(text) {
  if (!text) return "";
  let clean = text
    .replace(/^(\s*hello|\s*hi|\s*hey|\s*good morning|\s*good evening)[,!]?\s*/i, "")
    .replace(/^(can you|could you|please|tell me about|explain|how to|what is|how do i|debug|help me with|why does|why is|write a|create a|give me|what about|how about|what are|does|is|how|summarize|compare|brainstorm|design|build|make|show me)\s+/i, "")
    .replace(/\b(simply|in detail|step by step|briefly|clearly|for beginners|please)\b/gi, "")
    .replace(/[?!.:,;"'(){}[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean || text.trim();
}

function titleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function synthesizeChatTitle(messages) {
  if (!messages || messages.length === 0) return "New Chat";
  const userMessages = messages.filter((m) => m.sender === "user").map((m) => m.text);
  if (userMessages.length === 0) return "New Chat";

  const firstClean = cleanPrompt(userMessages[0]);
  const firstWords = firstClean
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w.toLowerCase()) && !/^\d+$/.test(w));

  // Single turn: pick 2 to 3 substantive topic words
  if (userMessages.length === 1 || firstWords.length >= 2) {
    if (userMessages.length === 1) {
      const source = firstWords.length >= 2 ? firstWords : firstClean.split(/\s+/).filter(Boolean);
      const chosen = source.slice(0, Math.min(Math.max(source.length, 2), 4));
      return titleCase(chosen.join(" ")) || "New Chat";
    }
  }

  // Multi-turn evolution: preserve core topic (1-2 words) + combine recent aspect (1-2 words)
  const latestClean = cleanPrompt(userMessages[userMessages.length - 1]);
  const latestWords = latestClean
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w.toLowerCase()) && !/^\d+$/.test(w));

  const rootWords = (firstWords.length >= 2 ? firstWords : firstClean.split(/\s+/).filter(Boolean)).slice(0, 2);
  const rootStr = rootWords.join(" ").toLowerCase();

  const newAspects = latestWords.filter((w) => !rootStr.includes(w.toLowerCase())).slice(0, 2);

  let finalWords = [];
  if (newAspects.length > 0) {
    finalWords = [...rootWords.slice(0, Math.min(2, 4 - newAspects.length)), ...newAspects];
  } else {
    finalWords = latestWords.length >= 2 ? latestWords.slice(0, 3) : rootWords.slice(0, 3);
  }

  if (finalWords.length < 2 && firstWords.length >= 2) {
    finalWords = firstWords.slice(0, 3);
  }

  const result = titleCase(finalWords.slice(0, 4).join(" "));
  return result || "New Chat";
}

const STORAGE_KEY = "mverse_chats_v2";
const ACTIVE_KEY = "mverse_active_chat_id_v2";

const createDefaultSession = () => ({
  id: "chat_" + Date.now(),
  title: "New Chat",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
});

function Chat() {
  // Load saved chats or start with 1 default empty session
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load chats from localStorage:", e);
    }
    return [createDefaultSession()];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return chats[0]?.id || "default";
  });

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const loadingRef = useRef(false);
  const initialPromptProcessed = useRef(false);

  // Auto-expanding textarea height adjustment (1 line up to 160px)
  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const nextHeight = Math.min(Math.max(el.scrollHeight, 24), 160);
      el.style.height = `${nextHeight}px`;
    }
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  // Sync chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error("Failed to persist chats:", e);
    }
  }, [chats]);

  // Sync activeChatId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, activeChatId);
    } catch (e) {}
  }, [activeChatId]);

  // Derive currently active chat session
  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || chats[0];
  }, [chats, activeChatId]);

  const messages = useMemo(() => activeChat?.messages || [], [activeChat]);

  // Dynamic backend URL
  const backendUrl =
    process.env.REACT_APP_BACKEND_BASEURL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5001"
      : "");

  // Start a brand new chat session
  const handleNewChat = useCallback(() => {
    const newSession = createDefaultSession();
    setChats((prev) => [newSession, ...prev]);
    setActiveChatId(newSession.id);
    setSidebarOpen(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  // Switch active chat session
  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  // Delete a specific chat
  const handleDeleteChat = useCallback((e, idToDelete) => {
    e.stopPropagation();
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== idToDelete);
      if (filtered.length === 0) {
        const fresh = createDefaultSession();
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (activeChatId === idToDelete) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeChatId]);

  // Clear all chats history
  const handleClearAllChats = useCallback(() => {
    const fresh = createDefaultSession();
    setChats([fresh]);
    setActiveChatId(fresh.id);
    setSidebarOpen(false);
  }, []);

  // Stable send prompt function
  const sendPrompt = useCallback(async (promptText) => {
    const textToSend = typeof promptText === "string" ? promptText.trim() : "";
    if (!textToSend || loadingRef.current) return;

    const userMessage = { sender: "user", text: textToSend };
    loadingRef.current = true;
    setLoading(true);

    // Update active chat with user message and dynamically synthesize title
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          const updatedMessages = [...chat.messages, userMessage];
          const updatedTitle = synthesizeChatTitle(updatedMessages);
          return {
            ...chat,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        }
        return chat;
      })
    );

    try {
      const response = await axios.post(`${backendUrl}/api/llm`, {
        input: textToSend,
      });

      const botText = response.data?.text || "No response received from mVerse.";
      const assistantMessage = { sender: "assistant", text: botText };

      // Update active chat with assistant response and re-evaluate title
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            const updatedMessages = [...chat.messages, assistantMessage];
            const updatedTitle = synthesizeChatTitle(updatedMessages);
            return {
              ...chat,
              title: updatedTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            };
          }
          return chat;
        })
      );
    } catch (err) {
      console.error("Error communicating with backend:", err);
      const serverMsg = err.response?.data?.text || err.response?.data?.error;
      const errorMessage = {
        sender: "assistant",
        text:
          serverMsg ||
          "**Unable to reach backend service.**\n\nIf testing locally, please ensure the backend is running (`node server.js` on port 5001). In production on Vercel, check your server status.",
      };
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, errorMessage],
              updatedAt: Date.now(),
            };
          }
          return chat;
        })
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [backendUrl, activeChatId]);

  // Handle form submission
  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loadingRef.current) return;
    const text = userInput;
    setUserInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendPrompt(text);
  };

  // If redirected from Home page with a query, auto-send it strictly once
  useEffect(() => {
    const initial = location.state?.initialPrompt;
    if (initial && !initialPromptProcessed.current) {
      initialPromptProcessed.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      if (activeChat && activeChat.messages.length > 0) {
        const fresh = createDefaultSession();
        setChats((prev) => [fresh, ...prev]);
        setActiveChatId(fresh.id);
        setTimeout(() => {
          sendPrompt(initial);
        }, 50);
      } else {
        sendPrompt(initial);
      }
    }
  }, [location.state, location.pathname, navigate, activeChat, sendPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const starters = [
    "Explain quantum computing simply",
    "Debug React component re-renders",
    "Brainstorm 3 micro-SaaS ideas",
  ];

  return (
    <div className="chat-layout-wrapper">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="chat-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left History Panel (Persistent on desktop, slide-over drawer on mobile) */}
      <aside className={`chat-sidebar-panel ${sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-top">
          <button
            className="chat-new-session-btn"
            onClick={handleNewChat}
          >
            <HiPlus className="btn-icon" />
            <span>New Chat</span>
          </button>
          <button
            className="chat-sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <HiXMark />
          </button>
        </div>

        <div className="chat-sidebar-history-header">
          <span>Conversations</span>
          <span className="chat-count-tag">{chats.length}</span>
        </div>

        {/* Scrollable list of chats */}
        <div className="chat-history-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-history-item ${chat.id === activeChatId ? "active" : ""}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="chat-history-icon">
                <HiChatBubbleLeftRight />
              </div>
              <div className="chat-history-info">
                <span className="chat-history-title">{chat.title}</span>
                <span className="chat-history-meta">
                  {chat.messages.length} {chat.messages.length === 1 ? "message" : "messages"}
                </span>
              </div>
              <button
                className="chat-history-delete-btn"
                onClick={(e) => handleDeleteChat(e, chat.id)}
                title="Delete Conversation"
                aria-label="Delete Conversation"
              >
                <HiTrash />
              </button>
            </div>
          ))}
        </div>

        {/* Clear All Footer */}
        <div className="chat-sidebar-footer">
          <button
            className="chat-clear-all-btn"
            onClick={handleClearAllChats}
            disabled={chats.length <= 1 && chats[0]?.messages.length === 0}
            title="Clear all chat history"
          >
            <HiTrash />
            <span>Clear History</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="chat-main-area">
        <div className="chat-card-shell">
          {/* Header */}
          <div className="chat-clean-header">
            <div className="chat-header-left">
              <button
                className="chat-sidebar-toggle-btn"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle Conversations Sidebar"
                title="Chat History"
              >
                <HiBars3 />
              </button>
              <div className="chat-header-title-block">
                <h3>
                  mVerse
                  <span className="chat-status-tag">
                    <span className="status-dot-mint"></span>
                    Core 2.0
                  </span>
                </h3>
                <span className="chat-header-current-topic" title={activeChat?.title}>
                  {activeChat?.title}
                </span>
              </div>
            </div>

            <div className="chat-header-right">
              <button
                onClick={handleNewChat}
                className="chat-header-new-btn"
                title="Start a new chat"
              >
                <HiPlus />
                <span className="header-btn-text">New Chat</span>
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
                      onClick={() => sendPrompt(item)}
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
              onSubmit={handleFormSubmit}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                className="chat-core-textarea"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
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
      </main>
    </div>
  );
}

export default Chat;