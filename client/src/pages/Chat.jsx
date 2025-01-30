import React, { useState } from "react";
import axios from "axios";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      const newMessage = { sender: "user", text: userInput };
      setMessages([...messages, newMessage]);
      setUserInput("");
      setLoading(true);

      try {
        // Make the request to the backend
        const response = await axios.post("http://localhost:5000/api/llm", { input: userInput });

        // Extract the response text from the backend's response
        const geminiText = response.data.text || "Sorry, no response from Gemini.";  // Fallback message

        // Add the Gemini response message
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "gemini", text: geminiText },
        ]);
      } catch (err) {
        console.error("Error in chat:", err);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "gemini", text: "Sorry, something went wrong!" },
        ]);
      }

      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender}>
              <p>{msg.text}</p> {/* Safely render text */}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={handleSendMessage} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
