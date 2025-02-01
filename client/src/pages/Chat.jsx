import React, { useState } from "react";
import axios from "axios";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_BASEURL; // Access the environment variable

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      const newMessage = { sender: "user", text: userInput };
      setMessages([...messages, newMessage]);
      setUserInput("");
      setLoading(true);
  
      try {
        const response = await axios.post(`${backendUrl}/api/chat`, {
          message: userInput,
        });
  
        const botMessage = { sender: "bot", text: response.data.reply };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Oops! Something went wrong." },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };
  

  // Function to clear the chat messages
  const clearMessages = () => {
    setMessages([]);
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
          {/* Clear Chat Button */}
          <button onClick={clearMessages} className="clear-btn">
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
