// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css"; // Optional: to style with your custom CSS

function Home() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch welcome message from backend or set up static text
  const fetchLLMResponse = async (input) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/llm", { input });
      setResponse(res.data);
    } catch (err) {
      console.error("Error fetching LLM response", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLLMResponse("Welcome to My LLM App!");  // Optional: get a response to show
  }, []);

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to My LLM App</h1>
        <p>Your personalized AI assistant is just a click away.</p>
        <button onClick={() => navigate("/chat")} className="enter-chat-btn">
          Start Chat
        </button>
      </div>

      <div className="llm-response-section">
        <h2>Response from Gemini:</h2>
        {loading ? <p>Loading...</p> : <p>{response}</p>}
      </div>

      <div className="fancy-footer">
        <p>Powered by React & Node.js</p>
      </div>
    </div>
  );
}

export default Home;
